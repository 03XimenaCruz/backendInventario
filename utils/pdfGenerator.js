const PDFDocument = require('pdfkit');

// Generar PDF de inventario
const generateInventoryPDF = (data, res, title = 'Reporte de Inventario') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // Configurar headers para descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, ' ')}.pdf"`);

  doc.pipe(res);

  // Título
  doc.fontSize(20).font('Times-Roman').text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).font('Times-Italic').text(`Fecha: ${new Date().toLocaleString('es-MX')}`, { align: 'right' });
  doc.moveDown(2);

  // Tabla de datos
  const tableTop = 150;
  const itemHeight = 20;
  const columnWidths = [50, 100, 130, 100, 60, 60];
  const startX = 30;

  // Headers
  doc.fontSize(9).font('Times-Roman');
  let xPos = startX;
  const headers = ['SKU', 'Nombre', 'Categoría', 'Almacén', 'Stock', 'Status'];
  
  headers.forEach((header, i) => {
    doc.text(header, xPos, tableTop, { width: columnWidths[i], align: 'left' });
    xPos += columnWidths[i];
  });

  // Línea debajo de headers
  doc.moveTo(startX, tableTop + 15)
     .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), tableTop + 15)
     .stroke();

  // Datos
  doc.fontSize(8).font('Times-Italic');
  let yPos = tableTop + 20;

  data.forEach((item, index) => {
    // Verificar si necesitamos nueva página
    if (yPos > 750) {
      doc.addPage();
      yPos = 50;
    }

    xPos = startX;
    const values = [
      item.sku || '',
      (item.nombre || '').substring(0, 25),
      (item.categoria || '').substring(0, 20),
      (item.almacen || '').substring(0, 18),
      item.stock?.toString() || '0',
      item.status || ''
    ];

    values.forEach((value, i) => {
      doc.text(value, xPos, yPos, { width: columnWidths[i], align: 'left' });
      xPos += columnWidths[i];
    });

    yPos += itemHeight;
  });

  // Total de productos
  doc.moveDown(2);
  doc.fontSize(10).font('Times-Roman')
     .text(`Total de productos: ${data.length}`, startX, yPos + 20 ,{ align: 'right' });

  doc.end();
};

// Generar PDF de movimientos
const generateMovementsPDF = (data, res, title = 'Reporte de Movimientos') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);

  doc.pipe(res);

  // Título
  doc.fontSize(20).font('Times-Roman').text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).font('Times-Italic').text(`Fecha: ${new Date().toLocaleString('es-MX')}`, { align: 'right' });
  doc.moveDown(2);

  // Tabla
  const tableTop = 120;
  const itemHeight = 20;
  const columnWidths = [40, 60, 120, 80, 60, 60, 60, 100, 100];
  const startX = 30;

  // Headers
  doc.fontSize(8).font('Times-Roman');
  let xPos = startX;
  const headers = ['ID', 'Tipo', 'Producto', 'Almacén', 'Cant.', 'St.Ant.', 'St.Act.', 'Usuario', 'Fecha'];
  
  headers.forEach((header, i) => {
    doc.text(header, xPos, tableTop, { width: columnWidths[i], align: 'right' });
    xPos += columnWidths[i];
  });

  doc.moveTo(startX, tableTop + 15)
     .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), tableTop + 15)
     .stroke();

  // Datos
  doc.fontSize(7).font('Times-Italic');
  let yPos = tableTop + 20;

  data.forEach((item) => {
    if (yPos > 530) {
      doc.addPage();
      yPos = 50;
    }

    xPos = startX;
    const fecha = item.fecha ? new Date(item.fecha).toLocaleDateString('es-MX') : '';
    const values = [
      item.id?.toString() || '',
      item.tipo_movimiento === 'entrada' ? 'ENTRADA' : 'SALIDA',
      (item.producto || '').substring(0, 25),
      (item.almacen || '').substring(0, 15),
      item.cantidad?.toString() || '',
      item.stock_anterior?.toString() || '',
      item.stock_actual?.toString() || '',
      (item.usuario || '').substring(0, 20),
      fecha
    ];

    values.forEach((value, i) => {
      // Color para tipo de movimiento
      if (i === 1) {
        doc.fillColor(item.tipo_movimiento === 'entrada' ? 'green' : 'red');
      } else {
        doc.fillColor('black');
      }
      
      doc.text(value, xPos, yPos, { width: columnWidths[i], align: 'left' });
      xPos += columnWidths[i];
    });

    yPos += itemHeight;
  });

  doc.fillColor('black');
  doc.fontSize(9).font('Times-Roman')
     .text(`Total de movimientos: ${data.length}`, startX, yPos + 20, { align: 'right'});

  doc.end();
};

// Generar PDF de stock bajo
const generateLowStockPDF = (data, res, title = 'Reporte de Stock Bajo') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, ' ')}.pdf"`);

  doc.pipe(res);

  // Título con alerta
  doc.fontSize(20).font('Times-Roman').fillColor('red').text(title, { align: 'center' });
  doc.fillColor('black');
  doc.moveDown();
  doc.fontSize(10).font('Times-Italic').text(`Fecha: ${new Date().toLocaleString('es-MX')}`, { align: 'right' });
  doc.moveDown(2);

  const tableTop = 150;
  const itemHeight = 22;
  const columnWidths = [50, 130, 100, 100, 50, 60];
  const startX = 30;

  // Headers
  doc.fontSize(9).font('Times-Roman');
  let xPos = startX;
  const headers = ['SKU', 'Nombre', 'Categoría', 'Almacén', 'Stock', 'Mín'];
  
  headers.forEach((header, i) => {
    doc.text(header, xPos, tableTop, { width: columnWidths[i], align: 'left' });
    xPos += columnWidths[i];
  });

  doc.moveTo(startX, tableTop + 15)
     .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), tableTop + 15)
     .stroke();

  // Datos
  doc.fontSize(8).font('Times-Italic');
  let yPos = tableTop + 20;

  data.forEach((item) => {
    if (yPos > 750) {
      doc.addPage();
      yPos = 50;
    }

    xPos = startX;
    const values = [
      item.sku || '',
      (item.nombre || '').substring(0, 28),
      (item.categoria || '').substring(0, 18),
      (item.almacen || '').substring(0, 18),
      item.stock?.toString() || '0',
      item.stock_minimo?.toString() || '0'
    ];

    values.forEach((value, i) => {
      // Resaltar stock en rojo si es crítico
      if (i === 4 && parseInt(item.stock) === 0) {
        doc.fillColor('red').font('Times-Roman');
      } else if (i === 4 && parseInt(item.stock) <= parseInt(item.stock_minimo)) {
        doc.fillColor('orange');
      } else {
        doc.fillColor('black').font('Times-Italic');
      }
      
      doc.text(value, xPos, yPos, { width: columnWidths[i], align: 'left' });
      xPos += columnWidths[i];
    });

    yPos += itemHeight;
  });

  doc.fillColor('black').font('Times-Roman').fontSize(10)
     .text(`Total de productos con stock bajo: ${data.length}`, startX, yPos + 20,{ align: 'right'});

  doc.end();
};

module.exports = {
  generateInventoryPDF,
  generateMovementsPDF,
  generateLowStockPDF
};
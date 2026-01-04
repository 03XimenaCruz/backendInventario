const PDFDocument = require('pdfkit');

// Función auxiliar para dibujar tabla con bordes
const drawTableCell = (doc, text, x, y, width, height, align = 'center', isHeader = false) => {
  // Dibujar borde de celda
  doc.rect(x, y, width, height).stroke();
  
  // Fondo de color para headers
  if (isHeader) {
    doc.save();
    doc.rect(x, y, width, height).fill('#10598A');
    doc.restore();
    doc.rect(x, y, width, height).stroke();
  }
  
  // Calcular posición del texto centrado
  const textY = y + (height - 10) / 2;
  
  // Color de texto blanco para headers
  if (isHeader) {
    doc.fillColor('white');
  }
  
  doc.text(text, x + 2, textY, {
    width: width - 4,
    align: align,
    lineBreak: false
  });
  
  // Restaurar color negro
  if (isHeader) {
    doc.fillColor('black');
  }
};

// Generar PDF de inventario
const generateInventoryPDF = (data, res, title = 'Reporte de Inventario') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // Limpiar título (reemplazar guiones bajos y guiones por espacios, eliminar números al final)
  const cleanTitle = title.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+\d+$/, '').trim();

  // Configurar headers para descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

  doc.pipe(res);

  // Título
  doc.fontSize(20).font('Times-Roman').text(cleanTitle, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).font('Times-Italic').text(`Fecha: ${new Date().toLocaleString('es-MX')}`, { align: 'right' });
  doc.moveDown(2);

  // Configuración de tabla
  const tableTop = 150;
  const rowHeight = 25;
  const columnWidths = [60, 120, 100, 100, 60, 60];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width;
  const startX = (pageWidth - tableWidth) / 2; // Centrar tabla
  const headers = ['SKU', 'Nombre', 'Categoría', 'Almacén', 'Stock', 'Status'];

  // Dibujar headers
  doc.fontSize(10).font('Times-Roman');
  let xPos = startX;
  headers.forEach((header, i) => {
    drawTableCell(doc, header, xPos, tableTop, columnWidths[i], rowHeight, 'center', true);
    xPos += columnWidths[i];
  });

  // Dibujar datos
  doc.fontSize(9).font('Times-Italic');
  let yPos = tableTop + rowHeight;

  data.forEach((item) => {
    // Verificar si necesitamos nueva página
    if (yPos > 720) {
      doc.addPage();
      yPos = 50;
      
      // Redibujar headers en nueva página
      doc.fontSize(10).font('Times-Roman');
      xPos = startX;
      headers.forEach((header, i) => {
        drawTableCell(doc, header, xPos, yPos, columnWidths[i], rowHeight, 'center', true);
        xPos += columnWidths[i];
      });
      yPos += rowHeight;
      doc.fontSize(9).font('Times-Italic');
    }

    xPos = startX;
    const values = [
      item.sku || '',
      (item.nombre || '').substring(0, 20),
      (item.categoria || '').substring(0, 15),
      (item.almacen || '').substring(0, 15),
      item.stock?.toString() || '0',
      item.status || ''
    ];

    values.forEach((value, i) => {
      drawTableCell(doc, value, xPos, yPos, columnWidths[i], rowHeight, 'center', false);
      xPos += columnWidths[i];
    });

    yPos += rowHeight;
  });

  // Total de productos
  doc.moveDown(2);
  doc.fontSize(11).font('Times-Roman')
     .text(`Total de productos: ${data.length}`, startX, yPos + 10, { align: 'right' });

  doc.end();
};

// Generar PDF de movimientos
const generateMovementsPDF = (data, res, title = 'Reporte de Movimientos') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

  // Limpiar título (reemplazar guiones bajos y guiones por espacios, eliminar números al final)
  const cleanTitle = title.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+\d+$/, '').trim();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

  doc.pipe(res);

  // Título
  doc.fontSize(20).font('Times-Roman').text(cleanTitle, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).font('Times-Italic').text(`Fecha: ${new Date().toLocaleString('es-MX')}`, { align: 'right' });
  doc.moveDown(2);

  // Configuración de tabla
  const tableTop = 120;
  const rowHeight = 25;
  const columnWidths = [35, 60, 110, 80, 50, 55, 55, 95, 85];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width;
  const startX = (pageWidth - tableWidth) / 2; // Centrar tabla
  const headers = ['ID', 'Tipo', 'Producto', 'Almacén', 'Cant.', 'St.Ant.', 'St.Act.', 'Usuario', 'Fecha'];

  // Headers
  doc.fontSize(9).font('Times-Roman');
  let xPos = startX;
  headers.forEach((header, i) => {
    drawTableCell(doc, header, xPos, tableTop, columnWidths[i], rowHeight, 'center', true);
    xPos += columnWidths[i];
  });

  // Datos
  doc.fontSize(8).font('Times-Italic');
  let yPos = tableTop + rowHeight;

  data.forEach((item) => {
    if (yPos > 500) {
      doc.addPage();
      yPos = 50;
      
      // Redibujar headers
      doc.fontSize(9).font('Times-Roman');
      xPos = startX;
      headers.forEach((header, i) => {
        drawTableCell(doc, header, xPos, yPos, columnWidths[i], rowHeight, 'center', true);
        xPos += columnWidths[i];
      });
      yPos += rowHeight;
      doc.fontSize(8).font('Times-Italic');
    }

    xPos = startX;
    const fecha = item.fecha ? new Date(item.fecha).toLocaleDateString('es-MX') : '';
    const values = [
      item.id?.toString() || '',
      item.tipo_movimiento === 'entrada' ? 'ENTRADA' : 'SALIDA',
      (item.producto || '').substring(0, 18),
      (item.almacen || '').substring(0, 13),
      item.cantidad?.toString() || '',
      item.stock_anterior?.toString() || '',
      item.stock_actual?.toString() || '',
      (item.usuario || '').substring(0, 15),
      fecha
    ];

    values.forEach((value, i) => {
      // Color para tipo de movimiento
      if (i === 1) {
        doc.fillColor(item.tipo_movimiento === 'entrada' ? 'green' : 'red');
        drawTableCell(doc, value, xPos, yPos, columnWidths[i], rowHeight, 'center', false);
        doc.fillColor('black');
      } else {
        drawTableCell(doc, value, xPos, yPos, columnWidths[i], rowHeight, 'center', false);
      }
      xPos += columnWidths[i];
    });

    yPos += rowHeight;
  });

  doc.fontSize(10).font('Times-Roman')
     .text(`Total de movimientos: ${data.length}`, startX, yPos + 10, { align: 'right' });

  doc.end();
};

// Generar PDF de stock bajo
const generateLowStockPDF = (data, res, title = 'Reporte de Stock Bajo') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // Limpiar título (reemplazar guiones bajos y guiones por espacios, eliminar números al final)
  const cleanTitle = title.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+\d+$/, '').trim();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

  doc.pipe(res);

  // Título con alerta
  doc.fontSize(20).font('Times-Roman').fillColor('red').text(cleanTitle, { align: 'center' });
  doc.fillColor('black');
  doc.moveDown();
  doc.fontSize(10).font('Times-Italic').text(`Fecha: ${new Date().toLocaleString('es-MX')}`, { align: 'right' });
  doc.moveDown(2);

  // Configuración de tabla
  const tableTop = 150;
  const rowHeight = 25;
  const columnWidths = [60, 140, 100, 100, 50, 50];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width;
  const startX = (pageWidth - tableWidth) / 2; // Centrar tabla
  const headers = ['SKU', 'Nombre', 'Categoría', 'Almacén', 'Stock', 'Mín'];

  // Headers
  doc.fontSize(10).font('Times-Roman');
  let xPos = startX;
  headers.forEach((header, i) => {
    drawTableCell(doc, header, xPos, tableTop, columnWidths[i], rowHeight, 'center', true);
    xPos += columnWidths[i];
  });

  // Datos
  doc.fontSize(9).font('Times-Italic');
  let yPos = tableTop + rowHeight;

  data.forEach((item) => {
    if (yPos > 720) {
      doc.addPage();
      yPos = 50;
      
      // Redibujar headers
      doc.fontSize(10).font('Times-Roman');
      xPos = startX;
      headers.forEach((header, i) => {
        drawTableCell(doc, header, xPos, yPos, columnWidths[i], rowHeight, 'center', true);
        xPos += columnWidths[i];
      });
      yPos += rowHeight;
      doc.fontSize(9).font('Times-Roman');
    }

    xPos = startX;
    const values = [
      item.sku || '',
      (item.nombre || '').substring(0, 22),
      (item.categoria || '').substring(0, 15),
      (item.almacen || '').substring(0, 15),
      item.stock?.toString() || '0',
      item.stock_minimo?.toString() || '0'
    ];

    values.forEach((value, i) => {
      // Resaltar stock en rojo si es crítico
      if (i === 4 && parseInt(item.stock) === 0) {
        doc.fillColor('red').font('Times-Roman');
        drawTableCell(doc, value, xPos, yPos, columnWidths[i], rowHeight, 'center', false);
        doc.fillColor('black').font('Times-Roman');
      } else if (i === 4 && parseInt(item.stock) <= parseInt(item.stock_minimo)) {
        doc.fillColor('orange').font('Times-Roman');
        drawTableCell(doc, value, xPos, yPos, columnWidths[i], rowHeight, 'center', false);
        doc.fillColor('black').font('Times-Roman');
      } else {
        drawTableCell(doc, value, xPos, yPos, columnWidths[i], rowHeight, 'center', false);
      }
      xPos += columnWidths[i];
    });

    yPos += rowHeight;
  });

  doc.fillColor('black').font('Times-Roman').fontSize(11)
     .text(`Total de productos con stock bajo: ${data.length}`, startX, yPos + 10, { align: 'right' });

  doc.end();
};

module.exports = {
  generateInventoryPDF,
  generateMovementsPDF,
  generateLowStockPDF
};
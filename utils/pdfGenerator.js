const PDFDocument = require('pdfkit');

const drawTableCell = (doc, text, x, y, width, height, align = 'center', isHeader = false) => {

  if (isHeader) {
    doc.rect(x, y, width, height).stroke();
    doc.save();
    doc.rect(x, y, width, height).fill('#E5E7EB'); 
    doc.restore();
    doc.rect(x, y, width, height).stroke();
    doc.fillColor('black'); 
  }
  
  const textY = y + (height - 10) / 2;
  
  doc.text(text, x + 2, textY, {
    width: width - 4,
    align: align,
    lineBreak: false
  });
};

const generateInventoryPDF = (data, res, title = 'Reporte de Inventario') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });


  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

  doc.pipe(res);

  doc.fontSize(16).font('Helvetica-Bold').text('REPORTE DE INVENTARIO', { align: 'center' });
  doc.moveDown(1.5);

  const fechaTexto = `Fecha: ${new Date().toLocaleDateString('es-MX')}`;
  doc.fontSize(10).font('Helvetica')
     .text(fechaTexto, { align: 'right' });
  
  doc.moveDown(2);

  const tableTop = doc.y;
  const rowHeight = 20;
  const columnWidths = [60, 120, 100, 100, 60, 60];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width;
  const startX = (pageWidth - tableWidth) / 2;
  const headers = ['SKU', 'Nombre', 'Categoría', 'Almacén', 'Stock', 'Status'];

  doc.fontSize(10).font('Helvetica-Bold');
  let xPos = startX;
  headers.forEach((header, i) => {
    drawTableCell(doc, header, xPos, tableTop, columnWidths[i], rowHeight, 'center', true);
    xPos += columnWidths[i];
  });

  doc.fontSize(9).font('Helvetica');
  let yPos = tableTop + rowHeight;

  data.forEach((item, index) => {

    if (yPos > 720) {
      doc.addPage();
      yPos = 50;
      
  
      doc.fontSize(10).font('Helvetica-Bold');
      xPos = startX;
      headers.forEach((header, i) => {
        drawTableCell(doc, header, xPos, yPos, columnWidths[i], rowHeight, 'center', true);
        xPos += columnWidths[i];
      });
      yPos += rowHeight;
      doc.fontSize(9).font('Helvetica');
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
      const textY = yPos + (rowHeight - 10) / 2;
      doc.text(value, xPos + 2, textY, {
        width: columnWidths[i] - 4,
        align: 'center',
        lineBreak: false
      });
      xPos += columnWidths[i];
    });

    yPos += rowHeight;
  });

  
  doc.moveDown(1);
  const totalY = yPos + 15;
  doc.fontSize(11).font('Helvetica-Bold')
     .text(`Total de productos: ${data.length}`, startX, totalY, { 
       align: 'right', 
       width: tableWidth 
     });

  doc.end();
};

const generateMovementsPDF = (data, res, title = 'Reporte de Movimientos') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

  doc.pipe(res);


  doc.fontSize(16).font('Helvetica-Bold').text('REPORTE DE MOVIMIENTOS', { align: 'center' });
  doc.moveDown(1.5);

 
  const fechaTexto = `Fecha: ${new Date().toLocaleDateString('es-MX')}`;
  doc.fontSize(10).font('Helvetica')
     .text(fechaTexto, { align: 'right' });
  
  doc.moveDown(2);

  const tableTop = doc.y;
  const rowHeight = 20;
  const columnWidths = [35, 60, 110, 80, 50, 55, 55, 95, 85];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width;
  const startX = (pageWidth - tableWidth) / 2;
  const headers = ['ID', 'Tipo', 'Producto', 'Almacén', 'Cant.', 'St.Ant.', 'St.Act.', 'Usuario', 'Fecha'];

  
  doc.fontSize(9).font('Helvetica-Bold');
  let xPos = startX;
  headers.forEach((header, i) => {
    drawTableCell(doc, header, xPos, tableTop, columnWidths[i], rowHeight, 'center', true);
    xPos += columnWidths[i];
  });

  
  doc.fontSize(8).font('Helvetica');
  let yPos = tableTop + rowHeight;

  data.forEach((item) => {
    if (yPos > 500) {
      doc.addPage();
      yPos = 50;
      
      
      doc.fontSize(9).font('Helvetica-Bold');
      xPos = startX;
      headers.forEach((header, i) => {
        drawTableCell(doc, header, xPos, yPos, columnWidths[i], rowHeight, 'center', true);
        xPos += columnWidths[i];
      });
      yPos += rowHeight;
      doc.fontSize(8).font('Helvetica');
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
      const textY = yPos + (rowHeight - 10) / 2;
      
     
      if (i === 1) {
        doc.fillColor(item.tipo_movimiento === 'entrada' ? 'green' : 'red');
      }
      
      doc.text(value, xPos + 2, textY, {
        width: columnWidths[i] - 4,
        align: 'center',
        lineBreak: false
      });
      
      if (i === 1) {
        doc.fillColor('black');
      }
      
      xPos += columnWidths[i];
    });

    yPos += rowHeight;
  });


  doc.fontSize(10).font('Helvetica-Bold')
     .text(`Total de movimientos: ${data.length}`, startX, yPos + 15, { 
       align: 'right', 
       width: tableWidth 
     });

  doc.end();
};

const generateLowStockPDF = (data, res, title = 'Reporte de Stock Bajo') => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`);

  doc.pipe(res);

  
  doc.fontSize(16).font('Helvetica-Bold').fillColor('red').text('REPORTE DE STOCK BAJO', { align: 'center' });
  doc.fillColor('black');
  doc.moveDown(1.5);

 
  const fechaTexto = `Fecha: ${new Date().toLocaleDateString('es-MX')}`;
  doc.fontSize(10).font('Helvetica')
     .text(fechaTexto, { align: 'right' });
  
  doc.moveDown(2);

 
  const tableTop = doc.y;
  const rowHeight = 20;
  const columnWidths = [60, 140, 100, 100, 50, 50];
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
  const pageWidth = doc.page.width;
  const startX = (pageWidth - tableWidth) / 2;
  const headers = ['SKU', 'Nombre', 'Categoría', 'Almacén', 'Stock', 'Mín'];

  
  doc.fontSize(10).font('Helvetica-Bold');
  let xPos = startX;
  headers.forEach((header, i) => {
    drawTableCell(doc, header, xPos, tableTop, columnWidths[i], rowHeight, 'center', true);
    xPos += columnWidths[i];
  });

  
  doc.fontSize(9).font('Helvetica');
  let yPos = tableTop + rowHeight;

  data.forEach((item) => {
    if (yPos > 720) {
      doc.addPage();
      yPos = 50;
      
     
      doc.fontSize(10).font('Helvetica-Bold');
      xPos = startX;
      headers.forEach((header, i) => {
        drawTableCell(doc, header, xPos, yPos, columnWidths[i], rowHeight, 'center', true);
        xPos += columnWidths[i];
      });
      yPos += rowHeight;
      doc.fontSize(9).font('Helvetica');
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
      const textY = yPos + (rowHeight - 10) / 2;
      
     
      if (i === 4 && parseInt(item.stock) === 0) {
        doc.fillColor('red').font('Helvetica-Bold');
      } else if (i === 4 && parseInt(item.stock) <= parseInt(item.stock_minimo)) {
        doc.fillColor('orange').font('Helvetica-Bold');
      }
      
      doc.text(value, xPos + 2, textY, {
        width: columnWidths[i] - 4,
        align: 'center',
        lineBreak: false
      });
      
      if (i === 4) {
        doc.fillColor('black').font('Helvetica');
      }
      
      xPos += columnWidths[i];
    });

    yPos += rowHeight;
  });

  
  doc.fillColor('black').font('Helvetica-Bold').fontSize(11)
     .text(`Total de productos con stock bajo: ${data.length}`, startX, yPos + 15, { 
       align: 'right', 
       width: tableWidth 
     });

  doc.end();
};

module.exports = {
  generateInventoryPDF,
  generateMovementsPDF,
  generateLowStockPDF
};
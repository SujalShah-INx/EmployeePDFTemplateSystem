import html2pdf from 'html2pdf.js';

/**
 * Export HTML content to PDF
 * @param {string} htmlContent - HTML content to export
 * @param {string} filename - Output PDF filename
 * @param {object} options - PDF generation options
 */
export async function exportToPDF(htmlContent, filename = 'document.pdf', options = {}) {
  try {
    console.log('PDF Export - Content length:', htmlContent.length);

    // Extract body content if full HTML document is provided
    let bodyContent = htmlContent;
    
    if (htmlContent.includes('<html') || htmlContent.includes('<body')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const bodyElement = doc.body;
      
      if (bodyElement) {
        bodyContent = bodyElement.innerHTML;
        console.log('PDF Export - Extracted body content, new length:', bodyContent.length);
      }
    }

    // Create a clean version for PDF while preserving structure
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyContent;
    
    // Remove Word-specific elements
    const elementsToRemove = tempDiv.querySelectorAll('script, style, xml, meta, link, o\\:p, v\\:shape, v\\:imagedata, v\\:shapetype');
    elementsToRemove.forEach(el => el.remove());
    
    // Clean up elements but preserve some structure
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      // Remove Word/Office specific classes
      const className = el.className || '';
      if (typeof className === 'string' && className.includes('Mso')) {
        el.removeAttribute('class');
      }
      
      // Remove most inline styles but keep essential ones
      const style = el.getAttribute('style');
      if (style) {
        // Keep text-align, font-weight, text-decoration
        const keepStyles = {};
        if (style.includes('text-align')) {
          const match = style.match(/text-align:\s*([^;]+)/);
          if (match) keepStyles.textAlign = match[1].trim();
        }
        if (style.includes('font-weight') && style.includes('bold')) {
          keepStyles.fontWeight = 'bold';
        }
        if (style.includes('text-decoration') && style.includes('underline')) {
          keepStyles.textDecoration = 'underline';
        }
        
        el.removeAttribute('style');
        Object.keys(keepStyles).forEach(prop => {
          el.style[prop] = keepStyles[prop];
        });
      }
    });
    
    const cleanedContent = tempDiv.innerHTML;
    
    // Create final wrapper with proper A4 dimensions
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div style="
        width: 210mm;
        min-height: 297mm;
        padding: 25mm 20mm;
        background: white;
        font-family: 'Calibri', 'Arial', sans-serif;
        font-size: 11pt;
        color: #000000;
        line-height: 1.6;
        box-sizing: border-box;
      ">
        ${cleanedContent}
      </div>
    `;

    const contentDiv = wrapper.firstElementChild;
    
    // Style tables properly
    contentDiv.querySelectorAll('table').forEach(table => {
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '15px';
      table.style.pageBreakInside = 'avoid';
    });
    
    contentDiv.querySelectorAll('td, th').forEach(cell => {
      cell.style.padding = '8px 10px';
      cell.style.verticalAlign = 'top';
      cell.style.fontSize = '11pt';
      cell.style.lineHeight = '1.5';
      // Add subtle borders for structure
      if (cell.getAttribute('border') !== '0') {
        cell.style.border = '0.5px solid #ccc';
      }
    });
    
    // Style paragraphs
    contentDiv.querySelectorAll('p').forEach(p => {
      if (!p.textContent.trim()) {
        p.style.marginBottom = '5px';
        p.style.minHeight = '5px';
      } else {
        p.style.marginBottom = '8px';
        p.style.lineHeight = '1.6';
      }
    });
    
    // Style headings
    contentDiv.querySelectorAll('h1').forEach(h => {
      h.style.fontSize = '16pt';
      h.style.fontWeight = 'bold';
      h.style.marginTop = '20px';
      h.style.marginBottom = '12px';
      h.style.textAlign = h.style.textAlign || 'center';
    });
    
    contentDiv.querySelectorAll('h2').forEach(h => {
      h.style.fontSize = '14pt';
      h.style.fontWeight = 'bold';
      h.style.marginTop = '15px';
      h.style.marginBottom = '10px';
    });
    
    contentDiv.querySelectorAll('h3, h4, h5, h6').forEach(h => {
      h.style.fontSize = '12pt';
      h.style.fontWeight = 'bold';
      h.style.marginTop = '12px';
      h.style.marginBottom = '8px';
    });
    
    // Style lists
    contentDiv.querySelectorAll('ul, ol').forEach(list => {
      list.style.marginBottom = '10px';
      list.style.paddingLeft = '25px';
    });
    
    contentDiv.querySelectorAll('li').forEach(li => {
      li.style.marginBottom = '5px';
      li.style.lineHeight = '1.5';
    });
    
    // Style bold and italic
    contentDiv.querySelectorAll('strong, b').forEach(el => {
      el.style.fontWeight = 'bold';
    });
    
    contentDiv.querySelectorAll('em, i').forEach(el => {
      el.style.fontStyle = 'italic';
    });
    
    contentDiv.querySelectorAll('u').forEach(el => {
      el.style.textDecoration = 'underline';
    });
    
    // Add to document invisibly
    wrapper.style.position = 'fixed';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.zIndex = '-1';
    wrapper.style.opacity = '0';
    wrapper.style.pointerEvents = 'none';
    document.body.appendChild(wrapper);

    console.log('PDF Export - Cleaned element text length:', contentDiv.textContent.length);

    // Generate PDF
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(contentDiv).save();

    console.log('PDF Export - PDF generated successfully');
    document.body.removeChild(wrapper);

    return { success: true };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate PDF blob without downloading (for preview)
 * @param {string} htmlContent - HTML content
 * @returns {Promise<Blob>} - PDF blob
 */
export async function generatePDFBlob(htmlContent) {
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  element.style.width = '210mm';
  element.style.padding = '20mm';
  element.style.backgroundColor = 'white';
  
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  document.body.appendChild(element);

  try {
    const pdf = await html2pdf().set({
      margin: [10, 10, 10, 10],
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(element).output('blob');

    document.body.removeChild(element);
    return pdf;
  } catch (error) {
    document.body.removeChild(element);
    throw error;
  }
}

/**
 * Print HTML content
 * @param {string} htmlContent - HTML content to print
 */
export function printDocument(htmlContent) {
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the document');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Document</title>
        <style>
          body {
            font-family: Calibri, Arial, sans-serif;
            font-size: 11pt;
            margin: 0;
            padding: 20mm;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

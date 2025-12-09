/**
 * Replace placeholders in HTML template with employee data
 * Supports {{variableName}} syntax and {{variableName|safe}} for HTML content
 * @param {string} templateHtml - HTML template content
 * @param {object} employeeData - Employee data object
 * @returns {string} - HTML with replaced placeholders
 */
export function replacePlaceholders(templateHtml, employeeData) {
  if (!templateHtml || !employeeData) {
    return templateHtml || '';
  }

  let result = templateHtml;

  // Replace all {{variable}} and {{variable|safe}} patterns
  const placeholderRegex = /\{\{([^}|]+)(\|safe)?\}\}/g;
  
  result = result.replace(placeholderRegex, (match, variableName, safeFlag) => {
    const key = variableName.trim();
    const value = employeeData[key];

    // If value is undefined or null, return empty string
    if (value === undefined || value === null) {
      return '';
    }

    // For safe flag or HTML content, return raw value
    if (safeFlag || key.includes('_image_tag') || key.includes('_options')) {
      return String(value);
    }

    // For regular values, escape HTML to prevent XSS
    return escapeHtml(String(value));
  });

  return result;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Load HTML template from file
 * @param {string} fileName - Template file name
 * @returns {Promise<string>} - Template HTML content
 */
export async function loadTemplate(fileName) {
  try {
    // In a real implementation, this would fetch from the server
    // For now, we'll use a relative path to the templates directory
    const response = await fetch(`/templates/${fileName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load template: ${fileName}`);
    }
    
    const text = await response.text();
    
    // Validate that we got valid text/HTML content
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid template content');
    }
    
    // Check if content is binary/corrupted
    if (text.includes('\ufffd') || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text)) {
      throw new Error('Template appears to be corrupted or in binary format. Please ensure the file is saved as UTF-8 HTML.');
    }
    
    return text;
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
}

/**
 * Extract all placeholder variable names from template
 * @param {string} templateHtml - HTML template content
 * @returns {Array<string>} - Array of variable names
 */
export function extractPlaceholders(templateHtml) {
  const placeholderRegex = /\{\{([^}|]+)(\|safe)?\}\}/g;
  const placeholders = new Set();
  
  let match;
  while ((match = placeholderRegex.exec(templateHtml)) !== null) {
    placeholders.add(match[1].trim());
  }
  
  return Array.from(placeholders);
}

/**
 * Validate that employee data has all required fields for template
 * @param {object} employeeData - Employee data object
 * @param {Array<string>} requiredFields - Required field names
 * @returns {object} - Validation result with missing fields
 */
export function validateEmployeeData(employeeData, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (employeeData[field] === undefined || employeeData[field] === null) {
      missing.push(field);
    }
  }
  
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
}

/**
 * Sanitize HTML content for display in editor
 * @param {string} html - HTML content
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHtml(html) {
  // Basic sanitization - in production, use DOMPurify
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

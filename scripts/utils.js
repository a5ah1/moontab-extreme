/**
 * Utility functions for Link Stacker
 */

/**
 * Generate a UUID v4
 * @returns {string} UUID string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validate URL - only allow https: and chrome: protocols
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol;
    
    // Only allow safe protocols - restricted for security
    const allowedProtocols = [
      'https:',
      'chrome:',
      'chrome-extension:'
    ];
    
    // Disallow javascript and other script protocols
    const disallowedProtocols = [
      'javascript:',
      'data:text/html',
      'vbscript:',
      'view-source:',
      'http:',
      'ftp:',
      'ftps:',
      'file:'
    ];
    
    // Check for disallowed protocols first
    if (disallowedProtocols.some(banned => url.toLowerCase().startsWith(banned))) {
      return false;
    }
    
    // Check if protocol is in allowed list
    return allowedProtocols.includes(protocol);
  } catch {
    return false;
  }
}

/**
 * Validate image data URI format
 * @param {string} dataUri - Data URI to validate
 * @returns {boolean} Whether data URI is valid image format
 */
function isValidImageDataUri(dataUri) {
  if (!dataUri || typeof dataUri !== 'string') return false;
  return /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/.test(dataUri);
}

/**
 * Validate URL for import (more permissive than runtime validation)
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid for import
 */
function isValidUrlForImport(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol;
    
    // Allow safe protocols including http: for imports
    const allowedProtocols = [
      'https:',
      'http:', // Allow for backward compatibility
      'chrome:',
      'chrome-extension:'
    ];
    
    // Disallow dangerous protocols
    const disallowedProtocols = [
      'javascript:',
      'data:text/html',
      'vbscript:',
      'view-source:'
    ];
    
    // Check for disallowed protocols first
    if (disallowedProtocols.some(banned => url.toLowerCase().startsWith(banned))) {
      return false;
    }
    
    // Check if protocol is in allowed list
    return allowedProtocols.includes(protocol);
  } catch {
    return false;
  }
}

/**
 * Validate image URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Whether URL is valid image URL
 */
function isValidImageUrl(url) {
  if (!isValidUrl(url)) return false;
  try {
    const urlObj = new URL(url);
    return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(urlObj.pathname);
  } catch {
    return false;
  }
}

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate background settings for security
 * @param {Object} settings - Background settings object
 * @returns {boolean} Whether settings are valid
 */
function isValidBackgroundSettings(settings) {
  if (!settings || typeof settings !== 'object') return false;
  
  const validSizes = ['auto', 'cover', 'contain', 'custom'];
  const validRepeats = ['repeat', 'no-repeat', 'repeat-x', 'repeat-y'];
  const validPositions = ['top', 'bottom', 'left', 'right', 'center'];
  const validUnitRegex = /^\d+(\.\d+)?(%|px|em|rem|vw|vh)$/;
  
  return (
    (!settings.backgroundSize || 
     validSizes.includes(settings.backgroundSize) || 
     validUnitRegex.test(settings.backgroundSize)) &&
    (!settings.backgroundRepeat || 
     validRepeats.includes(settings.backgroundRepeat)) &&
    (!settings.backgroundPosition || 
     validPositions.includes(settings.backgroundPosition) || 
     validUnitRegex.test(settings.backgroundPosition))
  );
}

/**
 * Sanitize CSS by removing potentially dangerous directives
 * @param {string} css - Raw CSS string
 * @returns {string} Sanitized CSS
 */
function sanitizeCSS(css) {
  if (!css || typeof css !== 'string') return '';
  
  // Check CSS size limit (100KB)
  if (css.length > 100 * 1024) {
    console.warn('CSS exceeds size limit');
    return '';
  }

  // Remove @import statements
  css = css.replace(/@import\s+[^;]+;/gi, '');

  // Remove javascript: urls
  css = css.replace(/url\s*\(\s*['"]?javascript:/gi, 'url(about:blank');

  // Remove data: urls that might contain scripts (keep image data: urls)
  css = css.replace(/url\s*\(\s*['"]?data:(?!image\/)/gi, 'url(about:blank');

  // Remove expression() calls (old IE)
  css = css.replace(/expression\s*\([^)]*\)/gi, '');

  return css;
}

/**
 * Validate imported JSON data structure
 * @param {any} data - Data to validate
 * @returns {boolean} Whether data is valid
 */
function validateImportData(data) {
  console.log('🔍 Validation Debug: Starting validation of data');
  
  if (!data || typeof data !== 'object') {
    console.error('🔍 Validation Debug: Data is not an object');
    return false;
  }

  // Check for version (future-proofing)
  if (data.version && typeof data.version !== 'number') {
    console.error('🔍 Validation Debug: Invalid version type');
    return false;
  }

  // Validate columns array
  if (!Array.isArray(data.columns)) {
    console.error('🔍 Validation Debug: Columns is not an array');
    return false;
  }
  
  // Limit number of columns for security
  if (data.columns.length > 50) {
    console.error('🔍 Validation Debug: Too many columns:', data.columns.length);
    return false;
  }

  console.log('🔍 Validation Debug: Validating', data.columns.length, 'columns');

  for (const [columnIndex, column] of data.columns.entries()) {
    console.log('🔍 Validation Debug: Validating column', columnIndex, ':', column.name);
    
    if (!column.id || typeof column.id !== 'string') {
      console.error('🔍 Validation Debug: Column missing or invalid ID');
      return false;
    }
    if (!column.name || typeof column.name !== 'string') {
      console.error('🔍 Validation Debug: Column missing or invalid name');
      return false;
    }
    
    // Validate custom classes
    if (column.customClasses && typeof column.customClasses !== 'string') {
      console.error('🔍 Validation Debug: Column custom classes invalid type');
      return false;
    }
    if (column.customClasses && !/^[a-zA-Z_][\w\- ]*$/.test(column.customClasses)) {
      console.error('🔍 Validation Debug: Column custom classes invalid format');
      return false;
    }
    
    // Support both legacy 'links' and new 'items' structure
    const items = column.items || column.links;
    if (!Array.isArray(items)) {
      console.error('🔍 Validation Debug: Column items/links is not an array');
      return false;
    }
    
    // Limit number of items per column for security
    if (items.length > 100) {
      console.error('🔍 Validation Debug: Too many items in column:', items.length);
      return false;
    }

    console.log('🔍 Validation Debug: Validating', items.length, 'items in column');

    for (const [itemIndex, item] of items.entries()) {
      if (!item.id || typeof item.id !== 'string') {
        console.error('🔍 Validation Debug: Item', itemIndex, 'missing or invalid ID');
        return false;
      }
      
      // Validate custom classes
      if (item.customClasses && typeof item.customClasses !== 'string') {
        console.error('🔍 Validation Debug: Item custom classes invalid type');
        return false;
      }
      if (item.customClasses && !/^[a-zA-Z_][\w\- ]*$/.test(item.customClasses)) {
        console.error('🔍 Validation Debug: Item custom classes invalid format');
        return false;
      }
      
      if (item.type === 'link' || !item.type) {
        // Validate link items
        if (!item.url || typeof item.url !== 'string') {
          console.error('🔍 Validation Debug: Link item missing or invalid URL');
          return false;
        }
        
        // Use relaxed URL validation for imports (allow http:)
        if (!isValidUrlForImport(item.url)) {
          console.error('🔍 Validation Debug: Link item invalid URL:', item.url);
          return false;
        }
        
        if (item.title && typeof item.title !== 'string') {
          console.error('🔍 Validation Debug: Link item invalid title type');
          return false;
        }
        if (item.iconDataUri && typeof item.iconDataUri !== 'string') {
          console.error('🔍 Validation Debug: Link item invalid iconDataUri type');
          return false;
        }
        if (item.iconDataUri && !isValidImageDataUri(item.iconDataUri)) {
          console.error('🔍 Validation Debug: Link item invalid iconDataUri format');
          return false;
        }
        if (item.iconUrlOverride && typeof item.iconUrlOverride !== 'string') {
          console.error('🔍 Validation Debug: Link item invalid iconUrlOverride type');
          return false;
        }
        if (item.iconUrlOverride && (!isValidUrlForImport(item.iconUrlOverride) || !isValidImageUrl(item.iconUrlOverride))) {
          console.error('🔍 Validation Debug: Link item invalid iconUrlOverride format');
          return false;
        }
      } else if (item.type === 'divider') {
        // Validate divider items
        if (item.title && (typeof item.title !== 'string' || item.title.length > 100)) {
          console.error('🔍 Validation Debug: Divider item invalid title');
          return false;
        }
      } else {
        // Unknown item type
        console.error('🔍 Validation Debug: Unknown item type:', item.type);
        return false;
      }
    }
  }

  // Validate theme
  if (data.theme && !['light', 'dark', 'custom', 'browser'].includes(data.theme)) {
    console.error('🔍 Validation Debug: Invalid theme:', data.theme);
    return false;
  }

  // Validate other fields
  if (data.customCss && typeof data.customCss !== 'string') {
    console.error('🔍 Validation Debug: Invalid customCss type');
    return false;
  }
  if (data.backgroundDataUri && typeof data.backgroundDataUri !== 'string') {
    console.error('🔍 Validation Debug: Invalid backgroundDataUri type');
    return false;
  }
  if (data.backgroundDataUri && !isValidImageDataUri(data.backgroundDataUri)) {
    console.error('🔍 Validation Debug: Invalid backgroundDataUri format');
    return false;
  }
  if (data.showIcons !== undefined && typeof data.showIcons !== 'boolean') {
    console.error('🔍 Validation Debug: Invalid showIcons type');
    return false;
  }

  // Validate boolean fields
  if (data.showUrls !== undefined && typeof data.showUrls !== 'boolean') {
    console.error('🔍 Validation Debug: Invalid showUrls type');
    return false;
  }
  if (data.showColumnHeaders !== undefined && typeof data.showColumnHeaders !== 'boolean') {
    console.error('🔍 Validation Debug: Invalid showColumnHeaders type');
    return false;
  }
  if (data.showAdvancedOptions !== undefined && typeof data.showAdvancedOptions !== 'boolean') {
    console.error('🔍 Validation Debug: Invalid showAdvancedOptions type');
    return false;
  }
  if (data.columnAnimationEnabled !== undefined && typeof data.columnAnimationEnabled !== 'boolean') {
    console.error('🔍 Validation Debug: Invalid columnAnimationEnabled type');
    return false;
  }
  if (data.columnAnimationStylesheetOnly !== undefined && typeof data.columnAnimationStylesheetOnly !== 'boolean') {
    console.error('🔍 Validation Debug: Invalid columnAnimationStylesheetOnly type');
    return false;
  }

  // Validate string fields
  if (data.pageBackgroundColor && typeof data.pageBackgroundColor !== 'string') {
    console.error('🔍 Validation Debug: Invalid pageBackgroundColor type');
    return false;
  }
  // Validate color format
  if (data.pageBackgroundColor && !/^#?[0-9a-f]{3,8}$/i.test(data.pageBackgroundColor)) {
    console.error('🔍 Validation Debug: Invalid pageBackgroundColor format');
    return false;
  }
  if (data.columnAnimationStyle && typeof data.columnAnimationStyle !== 'string') {
    console.error('🔍 Validation Debug: Invalid columnAnimationStyle type');
    return false;
  }
  if (data.backgroundSize && typeof data.backgroundSize !== 'string') {
    console.error('🔍 Validation Debug: Invalid backgroundSize type');
    return false;
  }
  if (data.backgroundRepeat && typeof data.backgroundRepeat !== 'string') {
    console.error('🔍 Validation Debug: Invalid backgroundRepeat type');
    return false;
  }
  if (data.backgroundPosition && typeof data.backgroundPosition !== 'string') {
    console.error('🔍 Validation Debug: Invalid backgroundPosition type');
    return false;
  }
  if (data.backgroundWidth && typeof data.backgroundWidth !== 'string') {
    console.error('🔍 Validation Debug: Invalid backgroundWidth type');
    return false;
  }
  if (data.backgroundHeight && typeof data.backgroundHeight !== 'string') {
    console.error('🔍 Validation Debug: Invalid backgroundHeight type');
    return false;
  }
  if (data.columnAnimationMode && typeof data.columnAnimationMode !== 'string') {
    console.error('🔍 Validation Debug: Invalid columnAnimationMode type');
    return false;
  }

  // Validate numeric fields
  if (data.columnAnimationDuration !== undefined && typeof data.columnAnimationDuration !== 'number') {
    console.error('🔍 Validation Debug: Invalid columnAnimationDuration type');
    return false;
  }
  if (data.columnAnimationDuration !== undefined && data.columnAnimationDuration < 0) {
    console.error('🔍 Validation Debug: Invalid columnAnimationDuration value');
    return false;
  }
  if (data.columnAnimationDelay !== undefined && typeof data.columnAnimationDelay !== 'number') {
    console.error('🔍 Validation Debug: Invalid columnAnimationDelay type');
    return false;
  }
  if (data.columnAnimationDelay !== undefined && data.columnAnimationDelay < 0) {
    console.error('🔍 Validation Debug: Invalid columnAnimationDelay value');
    return false;
  }
  if (data.columnAnimationStagger !== undefined && typeof data.columnAnimationStagger !== 'number') {
    console.error('🔍 Validation Debug: Invalid columnAnimationStagger type');
    return false;
  }
  if (data.columnAnimationStagger !== undefined && data.columnAnimationStagger < 0) {
    console.error('🔍 Validation Debug: Invalid columnAnimationStagger value');
    return false;
  }

  console.log('🔍 Validation Debug: All validation passed!');
  return true;
}

/**
 * Generate favicon URL for a given domain using Google's favicon service
 * @param {string} url - Full URL
 * @returns {string} Google favicon service URL
 */
function getFaviconUrl(url) {
  try {
    let testUrl = url;
    if (!testUrl.match(/^[a-zA-Z]+:\/\//)) {
      testUrl = 'https://' + testUrl;
    }
    const hostname = new URL(testUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return '';
  }
}

/**
 * Generate letter-based avatar for domain (fallback for failed favicons)
 * @param {string} url - Full URL
 * @returns {string} SVG data URI
 */
function generateLetterAvatar(url) {
  try {
    const hostname = new URL(url).hostname;
    const letter = hostname.charAt(0).toUpperCase();
    const hue = hostname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;

    const svg = `
      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="16" fill="hsl(${hue}, 60%, 60%)" rx="2"/>
        <text x="8" y="12" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">${letter}</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  } catch {
    // Fallback generic icon
    const svg = `
      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="16" fill="#666" rx="2"/>
        <text x="8" y="12" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">?</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
}

/**
 * Convert file to data URI
 * @param {File} file - File object
 * @returns {Promise<string>} Data URI string
 */
function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function to limit rapid successive calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateUUID,
    isValidUrl,
    isValidUrlForImport,
    isValidImageDataUri,
    isValidImageUrl,
    sanitizeText,
    isValidBackgroundSettings,
    sanitizeCSS,
    validateImportData,
    getFaviconUrl,
    generateLetterAvatar,
    fileToDataUri,
    formatBytes,
    debounce
  };
}
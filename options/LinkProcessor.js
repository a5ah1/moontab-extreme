/**
 * Link Processor - Link Stacker Options
 * Handles URL processing, validation, title/icon fetching, and link status indicators
 */

/**
 * Edge cases for testing validation:
 * - Valid: "www.example.com", "example.com/path?query=1", "https://sub.example.com"
 * - Invalid: "com", ".com", "https://.", "invalid"
 * - Protocols: "file:///path" (valid), "javascript:alert(1)" (invalid via isDangerousUrl)
 */

class LinkProcessor {
  constructor(uiManager) {
    this.uiManager = uiManager;
  }

  /**
   * Extract domain from URL
   * @param {string} url - URL
   * @returns {string} Domain name
   */
  extractDomainFromUrl(url) {
    try {
      let testUrl = url;
      if (!testUrl.match(/^[a-zA-Z]+:\/\//)) {
        testUrl = 'https://' + testUrl;
      }
      return new URL(testUrl).hostname;
    } catch {
      return url;
    }
  }

  /**
   * Validate URL format
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    let testUrl = url.trim();
    if (!testUrl.match(/^[a-zA-Z]+:\/\//)) { // No protocol
      testUrl = 'https://' + testUrl;
    }
    
    try {
      const urlObj = new URL(testUrl);
      const protocol = urlObj.protocol;
      
      const allowedProtocols = [
        'https:',
        'http:',
        'chrome:',
        'chrome-extension:',
        'moz-extension:',
        'about:',
        'file:',
        'ftp:',
        'ftps:'
      ];
      
      // Check if protocol is allowed
      if (!allowedProtocols.includes(protocol)) {
        return false;
      }
      
      // Special handling for localhost and local development
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname === '::1' ||
          hostname.match(/^127\./) ||
          hostname.match(/^192\.168\./) ||
          hostname.match(/^10\./) ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./) ||
          hostname.match(/^[a-zA-Z0-9-]+\.local$/)) {
        // Allow localhost and local network addresses
        return true;
      }
      
      // Check hostname validity - require at least second-level domain for public URLs
      const hostnameParts = urlObj.hostname.split('.');
      if (hostnameParts.length < 2 || hostnameParts[hostnameParts.length - 1].length < 2) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check for dangerous URLs that should block saving
   */
  isDangerousUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    const lowerUrl = url.toLowerCase();
    
    // Disallow dangerous protocols
    const dangerousProtocols = [
      'javascript:',
      'data:text/html',
      'vbscript:',
      'view-source:'
    ];
    
    return dangerousProtocols.some(banned => lowerUrl.startsWith(banned));
  }

  /**
   * Update link status indicator based on URL validity
   * @param {string} url - URL to validate
   * @param {Element} urlInput - URL input element
   * @param {Element} statusIndicator - Status indicator element
   * @param {Element} statusText - Status text element
   */
  updateLinkStatusIndicator(url, urlInput, statusIndicator, statusText) {
    if (!statusIndicator || !statusText) {
      console.warn('Status indicator elements not found');
      return;
    }
    
    // More robust empty URL detection
    const isEmpty = !url || typeof url !== 'string' || url.trim() === '';
    
    if (isEmpty) {
      // Empty URL - show warning
      urlInput.classList.remove('invalid');
      urlInput.classList.add('empty-warning');
      statusIndicator.classList.remove('hidden');
      statusText.textContent = 'empty URL';
    } else if (!this.isValidUrl(url)) {
      // Invalid URL - show error
      urlInput.classList.add('invalid');
      urlInput.classList.remove('empty-warning');
      statusIndicator.classList.remove('hidden');
      statusText.textContent = 'invalid URL';
    } else {
      // Valid URL - hide indicator
      urlInput.classList.remove('invalid', 'empty-warning');
      statusIndicator.classList.add('hidden');
      statusText.textContent = '';
    }
  }

  /**
   * Set link icon
   * @param {Element} iconEl - Icon element
   * @param {Object} link - Link data
   */
  setLinkIcon(iconEl, link) {
    if (link.iconDataUri) {
      iconEl.src = link.iconDataUri;
    } else if (link.iconUrlOverride) {
      iconEl.src = link.iconUrlOverride;
    } else {
      iconEl.src = getFaviconUrl(link.url);
    }

    iconEl.onerror = () => {
      iconEl.src = generateLetterAvatar(link.url);
    };
  }

  /**
   * Fetch page title and icon with improved approach
   */
  async fetchPageTitleAndIcon(link, titleInput, titlePreview, iconPreview, linkEl) {
    if (!link.url || !this.isValidUrl(link.url)) {
      return;
    }

    let fetchUrl = link.url;
    if (!fetchUrl.match(/^[a-zA-Z]+:\/\//) && this.isValidUrl(fetchUrl)) {
      fetchUrl = 'https://' + fetchUrl;
    }
    // Use fetchUrl instead of link.url for domain extraction and fetching

    // Show loading spinner
    const spinner = linkEl.querySelector('.link-loading-spinner');
    if (spinner) {
      spinner.classList.remove('hidden');
    }

    try {
      // Extract domain immediately as fallback
      const domain = this.extractDomainFromUrl(fetchUrl);
      
      // Set domain as title if no title exists
      if (domain && !titleInput.value.trim()) {
        titleInput.value = domain;
        link.title = domain;
        titlePreview.textContent = domain;
      }

      // Set icon preview (Google API will be used by frontend automatically)
      if (!link.iconDataUri && !link.iconUrlOverride) {
        this.setGoogleFaviconPreview({ ...link, url: fetchUrl }, iconPreview);
      }

      // Try to fetch the actual page title (async, may fail due to CORS)
      this.tryFetchPageTitle({ ...link, url: fetchUrl }, titleInput, titlePreview).finally(() => {
        this.uiManager.hideFetchingSpinner(spinner);
      });

    } catch (error) {
      this.uiManager.hideFetchingSpinner(spinner);
    }
  }

  /**
   * Validate and construct Google favicon URL from custom domain
   * @param {string} customDomain - User-input domain
   * @param {number} size - Icon size (default 32 for high DPI)
   * @returns {string|null} Constructed URL or null if invalid
   */
  constructGoogleFaviconUrl(customDomain, size = 32) {
    if (!customDomain || typeof customDomain !== 'string') return null;
    
    // Basic domain validation (hostname format)
    const domainRegex = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/;
    if (!domainRegex.test(customDomain)) {
      return null;
    }
    
    // Construct safe URL
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(customDomain)}&sz=${size}`;
  }

  /**
   * Set icon preview to use Google's favicon service
   */
  setGoogleFaviconPreview(link, iconPreview) {
    try {
      const url = new URL(link.url);
      const domain = url.hostname;
      
      // Use Google's favicon service for preview (32px for better quality in options)
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      iconPreview.src = googleFaviconUrl;
      
      // Don't save this as iconUrlOverride since frontend defaults to Google API anyway
      
    } catch (error) {
      // Ignore error, let default icon handling work
    }
  }

  /**
   * Try to fetch the actual page title (may fail due to CORS)
   */
  async tryFetchPageTitle(link, titleInput, titlePreview) {
    let fetchUrl = link.url;
    if (!fetchUrl.match(/^[a-zA-Z]+:\/\//) && this.isValidUrl(fetchUrl)) {
      fetchUrl = 'https://' + fetchUrl;
    }
    // Use fetchUrl in the fetch call

    // Only try if title is empty or just the domain
    const currentTitle = titleInput.value.trim();
    const domain = this.extractDomainFromUrl(fetchUrl);
    
    if (currentTitle && currentTitle !== domain) {
      return;
    }

    try {
      const response = await fetch(fetchUrl, {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
        }
      });

      if (response.ok) {
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        
        if (titleMatch && titleMatch[1]) {
          const fetchedTitle = titleMatch[1].trim();
          
          // Only update if we still have the domain or empty title
          if (!titleInput.value.trim() || titleInput.value.trim() === domain) {
            titleInput.value = fetchedTitle;
            link.title = fetchedTitle;
            titlePreview.textContent = fetchedTitle;
          }
        }
      }
    } catch (corsError) {
      // CORS errors are expected and harmless - silently ignore
    }
  }

  /**
   * Process icon image - resize if needed and convert to data URI
   * @param {File} file - Icon file
   * @returns {Promise<string>} Data URI
   */
  async processIconImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // Set canvas size for 32x32 (2x for high DPI)
        canvas.width = 32;
        canvas.height = 32;
        
        // Draw image scaled to 32x32
        ctx.drawImage(img, 0, 0, 32, 32);
        
        // Convert to data URI
        const dataUri = canvas.toDataURL('image/png', 0.9);
        resolve(dataUri);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // For SVG files, use original data URI
      if (file.type === 'image/svg+xml') {
        fileToDataUri(file).then(resolve).catch(reject);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      }
    });
  }

  /**
   * Handle icon upload
   * @param {string} linkId - Link ID
   * @param {File} file - Icon file
   * @param {Element} previewEl - Preview element
   * @param {Function} updateLinkProperty - Callback to update link property
   */
  async handleIconUpload(linkId, file, previewEl, updateLinkProperty) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit - generous since we resize
      alert('Image file must be smaller than 5MB');
      return;
    }

    try {
      // Validate and potentially resize image
      const processedDataUri = await this.processIconImage(file);
      updateLinkProperty(linkId, 'iconDataUri', processedDataUri);
      
      // Store the size of the processed image
      const processedSize = Math.round(processedDataUri.length * 0.75); // Approximate size of base64
      updateLinkProperty(linkId, 'iconSize', processedSize);
      
      previewEl.src = processedDataUri;

      // Clear URL override when uploading custom icon
      updateLinkProperty(linkId, 'iconUrlOverride', '');
      const linkEl = previewEl.closest('.link-item');
      const iconUrlInput = linkEl.querySelector('.icon-url-input');
      iconUrlInput.value = '';

    } catch (error) {
      console.error('Failed to upload icon:', error);
      this.uiManager.showError('Failed to upload icon. Please try again.');
    }
  }

  /**
   * Remove favicon from link
   * @param {string} linkId - Link ID
   * @param {Element} linkEl - Link element
   * @param {Function} updateLinkProperty - Callback to update link property
   * @param {Array} columns - Columns data to find link
   */
  removeFavicon(linkId, linkEl, updateLinkProperty, columns) {
    updateLinkProperty(linkId, 'iconDataUri', '');
    updateLinkProperty(linkId, 'iconUrlOverride', '');
    updateLinkProperty(linkId, 'iconSize', 0);
    
    const iconUrlInput = linkEl.querySelector('.icon-url-input');
    iconUrlInput.value = '';
    
    // Update preview
    const iconPreview = linkEl.querySelector('.link-icon-preview');
    const link = columns.flatMap(col => col.items || []).filter(item => item && item.type === 'link').find(l => l && l.id === linkId);
    if (link) {
      // Create updated link object for UI updates
      const updatedLink = { ...link, iconDataUri: '', iconUrlOverride: '' };
      this.setLinkIcon(iconPreview, updatedLink);
      this.updateFaviconModeUI(linkEl, updatedLink);
    }
  }

  /**
   * Update favicon mode UI based on current state
   * @param {Element} linkEl - Link element
   * @param {Object} link - Link data
   */
  updateFaviconModeUI(linkEl, link) {
    const faviconModeButtons = linkEl.querySelectorAll('.favicon-mode-btn');
    const faviconRemoveBtn = linkEl.querySelector('.favicon-remove-btn');
    const iconUrlInput = linkEl.querySelector('.icon-url-input');
    const dropZone = linkEl.querySelector('.favicon-drop-zone');
    const uploadStatus = linkEl.querySelector('.favicon-upload-status');
    
    // Reset all button states
    faviconModeButtons.forEach(btn => btn.classList.remove('active'));
    
    // Set active mode
    if (link.iconDataUri) {
      const uploadBtn = linkEl.querySelector('.favicon-mode-btn[data-mode="upload"]');
      if (uploadBtn) {
        uploadBtn.classList.add('active');
      }
      iconUrlInput.style.display = 'none';
      dropZone.style.display = 'none';
      uploadStatus.style.display = 'flex';
      
      // Show size if available
      const sizeText = uploadStatus.querySelector('.upload-size-text');
      if (link.iconSize) {
        sizeText.textContent = `(${(link.iconSize / 1024).toFixed(1)} KB)`;
      } else {
        sizeText.textContent = '';
      }
      
      // Move remove button to the right of the status
      faviconRemoveBtn.style.display = 'block';
      uploadStatus.appendChild(faviconRemoveBtn);
    } else if (link.iconUrlOverride) {
      const urlBtn = linkEl.querySelector('.favicon-mode-btn[data-mode="url"]');
      if (urlBtn) {
        urlBtn.classList.add('active');
        // Update button text to "Domain" if it hasn't been updated yet
        if (urlBtn.textContent.includes('URL')) {
          urlBtn.textContent = urlBtn.textContent.replace('URL', 'Domain');
        }
      }
      iconUrlInput.style.display = 'block';
      dropZone.style.display = 'none';
      uploadStatus.style.display = 'none';
      
      // Move remove button back to favicon toggle
      faviconRemoveBtn.style.display = 'none';
      const faviconToggle = linkEl.querySelector('.favicon-toggle');
      if (faviconToggle) {
        faviconToggle.appendChild(faviconRemoveBtn);
      }
    } else {
      // No custom favicon - default to URL mode
      const urlBtn = linkEl.querySelector('.favicon-mode-btn[data-mode="url"]');
      if (urlBtn) {
        urlBtn.classList.add('active');
        // Update button text to "Domain" if it hasn't been updated yet
        if (urlBtn.textContent.includes('URL')) {
          urlBtn.textContent = urlBtn.textContent.replace('URL', 'Domain');
        }
      }
      iconUrlInput.style.display = 'block';
      dropZone.style.display = 'none';
      uploadStatus.style.display = 'none';
      
      // Move remove button back to favicon toggle and hide it
      faviconRemoveBtn.style.display = 'none';
      const faviconToggle = linkEl.querySelector('.favicon-toggle');
      if (faviconToggle) {
        faviconToggle.appendChild(faviconRemoveBtn);
      }
    }
  }
}
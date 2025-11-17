/**
 * Puter Widget Initialization for AI Assistant
 * 
 * This script dynamically loads and initializes the Puter JS widget to replace
 * the existing AI assistant interface.
 * 
 * CONFIGURATION:
 * - To change the target element, modify the PUTER_TARGET_SELECTOR constant
 * - To add an API key (if required), add it to the puterConfig object
 * - To revert to the old assistant, comment out the script tag in index.html
 * 
 * CUSTOMIZATION EXAMPLES:
 * 1. Change target element: const PUTER_TARGET_SELECTOR = '#my-custom-element';
 * 2. Add API key: puterConfig.apiKey = 'your-api-key-here';
 * 3. Modify options: puterConfig.theme = 'dark'; // or other Puter options
 */

(function() {
    'use strict';

    // Configuration constants
    const PUTER_LOADER_URL = 'https://js.puter.com/v2/';
    const PUTER_TARGET_SELECTOR = '#workspace-ai-widget';
    const LOADING_TIMEOUT = 15000; // 15 seconds timeout for loading
    
    // Elements to hide when Puter is loaded
    const ELEMENTS_TO_HIDE = [
        '#workspace-chat-log',
        '#workspace-chat-input',
        '#workspace-chat-send-btn',
        '.embedded-chat-input-area'
    ];

    // Log helper for consistent debugging
    function log(message, type = 'info') {
        const prefix = '[Puter Init]';
        if (type === 'error') {
            console.error(prefix, message);
        } else if (type === 'warn') {
            console.warn(prefix, message);
        } else {
            console.log(prefix, message);
        }
    }

    // Show loading state
    function showLoading(targetElement) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'puter-loading';
        loadingDiv.style.cssText = 'padding: 20px; text-align: center; color: #666;';
        loadingDiv.innerHTML = `
            <div style="margin-bottom: 10px;">
                <svg width="40" height="40" viewBox="0 0 40 40" style="animation: spin 1s linear infinite;">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="#3b82f6" stroke-width="3" 
                            stroke-dasharray="90 150" stroke-linecap="round" />
                </svg>
            </div>
            <p>Loading AI Assistant...</p>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        targetElement.appendChild(loadingDiv);
        log('Loading state displayed');
    }

    // Show error state with fallback option
    function showError(targetElement, errorMessage) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'puter-error';
        errorDiv.style.cssText = 'padding: 20px; text-align: center; color: #dc2626; background-color: #fee2e2; border-radius: 8px; margin: 10px;';
        errorDiv.innerHTML = `
            <p style="margin-bottom: 10px;"><strong>⚠️ Unable to load Puter AI Assistant</strong></p>
            <p style="font-size: 0.9em; color: #991b1b;">${errorMessage}</p>
            <p style="font-size: 0.85em; color: #7f1d1d; margin-top: 10px;">Using fallback assistant...</p>
        `;
        targetElement.appendChild(errorDiv);
        log('Error state displayed: ' + errorMessage, 'error');
        
        // Show the old assistant UI after a brief delay
        setTimeout(() => {
            restoreOldAssistant();
        }, 2000);
    }

    // Store original HTML content
    let originalBodyHTML = null;
    
    // Restore the original assistant UI
    function restoreOldAssistant() {
        log('Restoring original assistant UI');
        
        const widgetBody = document.querySelector('#workspace-ai-widget .workspace-widget-body');
        if (widgetBody && originalBodyHTML) {
            // Restore the original HTML content
            widgetBody.innerHTML = originalBodyHTML;
            log('Original HTML content restored');
        } else {
            // Fallback: Remove Puter-related elements and show hidden elements
            const puterLoading = document.getElementById('puter-loading');
            const puterError = document.getElementById('puter-error');
            const puterWidget = document.getElementById('puter-widget');
            
            if (puterLoading) puterLoading.remove();
            if (puterError) puterError.remove();
            if (puterWidget) puterWidget.remove();
            
            // Show the original chat elements
            ELEMENTS_TO_HIDE.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.display = '';
                }
            });
        }
        
        log('Original assistant UI restored');
    }

    // Hide original chat elements when Puter loads successfully
    function hideOriginalElements() {
        ELEMENTS_TO_HIDE.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
                log(`Hidden element: ${selector}`);
            }
        });
    }

    // Dynamically load Puter script
    function loadPuterScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = PUTER_LOADER_URL;
            script.async = true;
            
            script.onload = () => {
                log('Puter script loaded successfully');
                resolve();
            };
            
            script.onerror = () => {
                const error = new Error('Failed to load Puter script from ' + PUTER_LOADER_URL);
                log(error.message, 'error');
                reject(error);
            };
            
            document.head.appendChild(script);
            log('Loading Puter script from ' + PUTER_LOADER_URL);
        });
    }

    // Initialize Puter widget with various API patterns
    function initializePuterWidget(targetElement) {
        log('Attempting to initialize Puter widget');
        
        // Configuration object for Puter
        // TODO: Add your API key here if required by Puter
        const puterConfig = {
            element: targetElement,
            // apiKey: 'YOUR_API_KEY_HERE', // Uncomment and add your API key if needed
            // theme: 'light', // Optional: customize theme
            // Other Puter configuration options can be added here
        };

        // Try different initialization patterns that Puter might use
        
        // Pattern 1: window.Puter.init()
        if (window.Puter && typeof window.Puter.init === 'function') {
            log('Initializing with Puter.init()');
            try {
                window.Puter.init(puterConfig);
                return true;
            } catch (error) {
                log('Puter.init() failed: ' + error.message, 'warn');
            }
        }
        
        // Pattern 2: window.puter.init() (lowercase)
        if (window.puter && typeof window.puter.init === 'function') {
            log('Initializing with puter.init()');
            try {
                window.puter.init(puterConfig);
                return true;
            } catch (error) {
                log('puter.init() failed: ' + error.message, 'warn');
            }
        }
        
        // Pattern 3: window.Puter.render()
        if (window.Puter && typeof window.Puter.render === 'function') {
            log('Initializing with Puter.render()');
            try {
                window.Puter.render(targetElement, puterConfig);
                return true;
            } catch (error) {
                log('Puter.render() failed: ' + error.message, 'warn');
            }
        }
        
        // Pattern 4: window.puter.render() (lowercase)
        if (window.puter && typeof window.puter.render === 'function') {
            log('Initializing with puter.render()');
            try {
                window.puter.render(targetElement, puterConfig);
                return true;
            } catch (error) {
                log('puter.render() failed: ' + error.message, 'warn');
            }
        }
        
        // Pattern 5: window.Puter as a constructor
        if (window.Puter && typeof window.Puter === 'function') {
            log('Initializing with new Puter()');
            try {
                new window.Puter(puterConfig);
                return true;
            } catch (error) {
                log('new Puter() failed: ' + error.message, 'warn');
            }
        }
        
        // Pattern 6: Direct function call
        if (typeof window.Puter === 'function') {
            log('Initializing with Puter() call');
            try {
                window.Puter(puterConfig);
                return true;
            } catch (error) {
                log('Puter() call failed: ' + error.message, 'warn');
            }
        }
        
        log('No compatible Puter API found', 'error');
        return false;
    }

    // Main initialization function
    async function initialize() {
        log('Starting Puter widget initialization');
        
        // Find the target element
        const targetElement = document.querySelector(PUTER_TARGET_SELECTOR);
        if (!targetElement) {
            log('Target element not found: ' + PUTER_TARGET_SELECTOR, 'error');
            return;
        }
        
        // Make the widget visible
        targetElement.style.display = '';
        log('AI Assistant widget is now visible');
        
        // Clear the target element and show loading
        const widgetBody = targetElement.querySelector('.workspace-widget-body');
        const containerElement = widgetBody || targetElement;
        
        // Store original HTML before clearing (for fallback restoration)
        originalBodyHTML = containerElement.innerHTML;
        
        containerElement.innerHTML = '';
        showLoading(containerElement);
        
        // Create placeholder for Puter widget
        const puterPlaceholder = document.createElement('div');
        puterPlaceholder.id = 'puter-widget';
        puterPlaceholder.style.cssText = 'min-height: 400px; width: 100%;';
        
        try {
            // Load Puter script with timeout
            const loadPromise = loadPuterScript();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Puter script loading timeout')), LOADING_TIMEOUT);
            });
            
            await Promise.race([loadPromise, timeoutPromise]);
            
            // Wait a brief moment for Puter to initialize its globals
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Remove loading indicator
            const loadingElement = document.getElementById('puter-loading');
            if (loadingElement) loadingElement.remove();
            
            // Append placeholder
            containerElement.appendChild(puterPlaceholder);
            
            // Try to initialize Puter
            const initialized = initializePuterWidget(puterPlaceholder);
            
            if (initialized) {
                log('Puter widget initialized successfully! ✓');
                hideOriginalElements();
                
                // Give Puter time to render
                setTimeout(() => {
                    // Check if Puter actually rendered something
                    if (puterPlaceholder.children.length === 0 && puterPlaceholder.innerHTML.trim() === '') {
                        log('Puter rendered but appears empty, reverting to fallback', 'warn');
                        showError(containerElement, 'Puter widget loaded but did not render content.');
                    }
                }, 2000);
            } else {
                throw new Error('Could not initialize Puter widget - no compatible API found');
            }
            
        } catch (error) {
            log('Initialization failed: ' + error.message, 'error');
            showError(containerElement, error.message);
        }
    }

    // Wait for DOM to be ready before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready
        initialize();
    }

    log('Puter initialization script loaded');
})();

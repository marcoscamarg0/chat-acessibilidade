// src/utils/accessibilityUtils.js

/**
 * Utility functions for accessibility features
 */

// Check if browser supports Speech Recognition
export const isSpeechRecognitionSupported = () => {
    return !!window.SpeechRecognition || !!window.webkitSpeechRecognition;
  };
  
  // Check if browser supports Speech Synthesis
  export const isSpeechSynthesisSupported = () => {
    return !!window.speechSynthesis;
  };
  
  // Announce message to screen readers using ARIA live regions
  export const announceToScreenReader = (message, priority = 'polite') => {
    // Create an aria-live element
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', priority);
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.classList.add('sr-only'); // Make it invisible but still accessible to screen readers
    ariaLive.textContent = message;
    
    // Add to DOM
    document.body.appendChild(ariaLive);
    
    // Remove after announcement (wait a bit longer for more important messages)
    setTimeout(() => {
      document.body.removeChild(ariaLive);
    }, priority === 'assertive' ? 3000 : 1000);
  };
  
  // Get accessible color based on contrast ratio
  export const getAccessibleTextColor = (backgroundColor) => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    // Calculate luminance
    const calculateLuminance = (r, g, b) => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };
    
    // Parse background color
    let rgb;
    if (backgroundColor.startsWith('#')) {
      rgb = hexToRgb(backgroundColor);
    } else if (backgroundColor.startsWith('rgb')) {
      const values = backgroundColor.match(/\d+/g);
      rgb = {
        r: parseInt(values[0], 10),
        g: parseInt(values[1], 10),
        b: parseInt(values[2], 10)
      };
    } else {
      // Default to white text for unknown backgrounds
      return '#ffffff';
    }
    
    // Calculate luminance and return appropriate text color
    const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };
  
  // Focus first focusable element in container
  export const focusFirstElement = (containerRef) => {
    if (!containerRef?.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  };
  
  // Create keyboard trap for modal dialogs
  export const trapFocus = (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Add keydown event listener
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    // Return function to remove listener
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  };
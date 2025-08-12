#!/usr/bin/env node

/**
 * XCLV Brand Analysis Extension - Code Quality Verification
 * 
 * This script validates the extension code to prevent common issues:
 * - JavaScript syntax errors
 * - Missing files and dependencies
 * - Manifest validation
 * - Event handler verification
 * - API integration checks
 */

const fs = require('fs');
const path = require('path');

class ExtensionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(type, message) {
    const timestamp = new Date().toISOString();
    const prefix = {
      'error': '❌ ERROR',
      'warning': '⚠️  WARNING', 
      'success': '✅ PASSED',
      'info': 'ℹ️  INFO'
    }[type] || 'LOG';
    
    console.log(`${prefix}: ${message}`);
    
    if (type === 'error') this.errors.push(message);
    if (type === 'warning') this.warnings.push(message);
    if (type === 'success') this.passed.push(message);
  }

  validateFileExists(filepath, required = true) {
    if (fs.existsSync(filepath)) {
      this.log('success', `File exists: ${filepath}`);
      return true;
    } else {
      this.log(required ? 'error' : 'warning', `Missing file: ${filepath}`);
      return false;
    }
  }

  validateManifest() {
    this.log('info', 'Validating manifest.json...');
    
    if (!this.validateFileExists('manifest.json')) return false;
    
    try {
      const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
      
      // Required fields
      const required = ['manifest_version', 'name', 'version', 'action', 'background', 'content_scripts'];
      for (const field of required) {
        if (!manifest[field]) {
          this.log('error', `Manifest missing required field: ${field}`);
        } else {
          this.log('success', `Manifest has required field: ${field}`);
        }
      }
      
      // Version format validation
      if (manifest.version && /^\d+\.\d+\.\d+$/.test(manifest.version)) {
        this.log('success', `Version format valid: ${manifest.version}`);
      } else {
        this.log('error', `Invalid version format: ${manifest.version}`);
      }
      
      // Check permissions
      if (manifest.permissions && manifest.permissions.includes('storage')) {
        this.log('success', 'Storage permission present');
      } else {
        this.log('error', 'Missing storage permission');
      }
      
      return true;
    } catch (error) {
      this.log('error', `Manifest JSON parse error: ${error.message}`);
      return false;
    }
  }

  validateJavaScript() {
    this.log('info', 'Validating JavaScript syntax...');
    
    const jsFiles = ['popup.js', 'background.js', 'content.js'];
    
    for (const file of jsFiles) {
      if (!this.validateFileExists(file)) continue;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for common syntax issues
        this.validateJSSyntax(file, content);
        
      } catch (error) {
        this.log('error', `Failed to read ${file}: ${error.message}`);
      }
    }
  }

  validateJSSyntax(filename, content) {
    // Check for escaped newlines that break JavaScript
    if (content.includes('\\\\n')) {
      this.log('error', `${filename}: Contains escaped newlines (\\\\n) - should be actual newlines`);
    } else {
      this.log('success', `${filename}: No escaped newline issues`);
    }
    
    // Check for unmatched quotes
    const singleQuotes = (content.match(/'/g) || []).length;
    const doubleQuotes = (content.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      this.log('warning', `${filename}: Unmatched single quotes detected`);
    }
    
    // Check for basic syntax patterns
    if (content.includes('addEventListener')) {
      this.log('success', `${filename}: Contains event listeners`);
    }
    
    // Check for proper try-catch blocks in popup.js
    if (filename === 'popup.js') {
      const tryBlocks = (content.match(/try\s*{/g) || []).length;
      const catchBlocks = (content.match(/catch\s*\(/g) || []).length;
      
      if (tryBlocks === catchBlocks && tryBlocks > 0) {
        this.log('success', `${filename}: Proper try-catch error handling (${tryBlocks} blocks)`);
      } else {
        this.log('warning', `${filename}: Mismatched try-catch blocks (${tryBlocks} try, ${catchBlocks} catch)`);
      }
    }
    
    // Check for Chrome extension API usage
    if (content.includes('chrome.')) {
      this.log('success', `${filename}: Uses Chrome extension APIs`);
    }
  }

  validatePopupStructure() {
    this.log('info', 'Validating popup structure...');
    
    if (!this.validateFileExists('popup.html')) return false;
    if (!this.validateFileExists('popup.js')) return false;
    
    try {
      const htmlContent = fs.readFileSync('popup.html', 'utf8');
      const jsContent = fs.readFileSync('popup.js', 'utf8');
      
      // Check for required HTML elements
      const requiredElements = [
        'analyze-page-btn',
        'toggle-interactive-btn', 
        'save-api-btn',
        'test-api-btn',
        'api-key-input'
      ];
      
      for (const elementId of requiredElements) {
        if (htmlContent.includes(`id="${elementId}"`)) {
          this.log('success', `HTML contains required element: ${elementId}`);
        } else {
          this.log('error', `HTML missing required element: ${elementId}`);
        }
        
        // Check if JavaScript references the element
        if (jsContent.includes(`getElementById('${elementId}')`)) {
          this.log('success', `JavaScript references element: ${elementId}`);
        } else {
          this.log('warning', `JavaScript doesn't reference element: ${elementId}`);
        }
      }
      
      return true;
    } catch (error) {
      this.log('error', `Failed to validate popup structure: ${error.message}`);
      return false;
    }
  }

  validateAPIIntegration() {
    this.log('info', 'Validating API integration...');
    
    if (!this.validateFileExists('background.js')) return false;
    
    try {
      const content = fs.readFileSync('background.js', 'utf8');
      
      // Check for Gemini API integration
      if (content.includes('generativelanguage.googleapis.com')) {
        this.log('success', 'Gemini API endpoint configured');
      } else {
        this.log('error', 'Missing Gemini API endpoint');
      }
      
      // Check for message handling
      if (content.includes('chrome.runtime.onMessage.addListener')) {
        this.log('success', 'Message listener configured');
      } else {
        this.log('error', 'Missing message listener');
      }
      
      // Check for API actions
      const requiredActions = ['analyzeContent', 'testApiConnection', 'updateApiSettings'];
      for (const action of requiredActions) {
        if (content.includes(`'${action}'`) || content.includes(`"${action}"`)) {
          this.log('success', `API action handled: ${action}`);
        } else {
          this.log('error', `Missing API action: ${action}`);
        }
      }
      
      return true;
    } catch (error) {
      this.log('error', `Failed to validate API integration: ${error.message}`);
      return false;
    }
  }

  validateContentScript() {
    this.log('info', 'Validating content script...');
    
    if (!this.validateFileExists('content.js')) return false;
    if (!this.validateFileExists('content-styles.css')) return false;
    
    try {
      const content = fs.readFileSync('content.js', 'utf8');
      
      // Check for message handling
      if (content.includes('chrome.runtime.onMessage.addListener')) {
        this.log('success', 'Content script message listener configured');
      } else {
        this.log('warning', 'Content script missing message listener');
      }
      
      // Check for required actions
      const requiredActions = ['startAnalysis', 'enableInteractiveMode', 'showPanel'];
      for (const action of requiredActions) {
        if (content.includes(action)) {
          this.log('success', `Content script handles: ${action}`);
        } else {
          this.log('warning', `Content script missing action: ${action}`);
        }
      }
      
      return true;
    } catch (error) {
      this.log('error', `Failed to validate content script: ${error.message}`);
      return false;
    }
  }

  validateIcons() {
    this.log('info', 'Validating icons...');
    
    const iconSizes = ['16', '32', '48', '128'];
    
    for (const size of iconSizes) {
      const iconPath = `icons/icon-${size}.png`;
      this.validateFileExists(iconPath, false);
    }
  }

  validateVersion() {
    this.log('info', 'Validating version consistency...');
    
    try {
      const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
      const readme = fs.readFileSync('README.md', 'utf8');
      
      if (readme.includes(manifest.version)) {
        this.log('success', `Version ${manifest.version} consistent in README.md`);
      } else {
        this.log('warning', `Version ${manifest.version} not found in README.md`);
      }
      
      // Check if CHANGELOG exists and mentions current version
      if (this.validateFileExists('CHANGELOG.md', false)) {
        const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
        if (changelog.includes(`[${manifest.version}]`)) {
          this.log('success', `Version ${manifest.version} documented in CHANGELOG.md`);
        } else {
          this.log('warning', `Version ${manifest.version} not documented in CHANGELOG.md`);
        }
      }
      
    } catch (error) {
      this.log('error', `Failed to validate version: ${error.message}`);
    }
  }

  runAllValidations() {
    console.log('🔍 XCLV Extension Validation Starting...\n');
    
    this.validateManifest();
    this.validateJavaScript();
    this.validatePopupStructure();
    this.validateAPIIntegration();
    this.validateContentScript();
    this.validateIcons();
    this.validateVersion();
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 VALIDATION REPORT');
    console.log('═'.repeat(50));
    
    console.log(`✅ Passed: ${this.passed.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS (Must Fix):');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (Should Fix):');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    const status = this.errors.length === 0 ? 'PASSED' : 'FAILED';
    const emoji = this.errors.length === 0 ? '🎉' : '💥';
    
    console.log(`\n${emoji} VALIDATION ${status}\n`);
    
    if (this.errors.length === 0) {
      console.log('Extension is ready for deployment! 🚀');
    } else {
      console.log('Please fix the errors above before deploying.');
      process.exit(1);
    }
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new ExtensionValidator();
  validator.runAllValidations();
}

module.exports = ExtensionValidator;

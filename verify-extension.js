#!/usr/bin/env node

/**
 * XCLV Brand Analysis Extension Verification Script
 * Checks for all required files and validates extension structure
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 XCLV Extension Verification\n');

// Required files for Chrome extension
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'content-styles.css',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/icon-48.png',
  'icons/icon-128.png'
];

let allFilesExist = true;
let errors = [];

console.log('Checking required files...\n');

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  
  if (!exists) {
    allFilesExist = false;
    errors.push(`Missing: ${file}`);
  }
});

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 ALL REQUIRED FILES FOUND!');
  console.log('\nExtension should load properly in Chrome.');
  console.log('\nTo load the extension:');
  console.log('1. Open Chrome');
  console.log('2. Go to chrome://extensions/');
  console.log('3. Enable "Developer mode"');
  console.log('4. Click "Load unpacked"');
  console.log('5. Select this directory');
} else {
  console.log('❌ MISSING FILES DETECTED');
  console.log('\nErrors found:');
  errors.forEach(error => console.log(`  • ${error}`));
  
  console.log('\nTo fix:');
  console.log('1. Re-clone the repository');
  console.log('2. Ensure all files are downloaded');
  console.log('3. Check file permissions');
}

console.log('\n' + '='.repeat(50));

// Verify manifest.json structure
try {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  console.log(`\n📋 Manifest version: ${manifest.manifest_version}`);
  console.log(`📋 Extension name: ${manifest.name}`);
  console.log(`📋 Version: ${manifest.version}`);
  
  if (manifest.manifest_version === 3) {
    console.log('✅ Using Manifest V3 (current standard)');
  } else {
    console.log('⚠️  Consider updating to Manifest V3');
  }
} catch (error) {
  console.log('❌ Error reading manifest.json:', error.message);
}

console.log('\n🚀 Ready to load your brand analysis extension!');

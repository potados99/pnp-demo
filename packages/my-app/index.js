/**
 * my-app: Application that uses my-library
 *
 * This demonstrates the behavior difference with/without packageExtensions
 */

const { doSomething, checkColorSupport } = require('my-library');

console.log('\n==============================================');
console.log('  PnP Demo: supports-color Behavior Test');
console.log('==============================================\n');

console.log('Running my-library.doSomething()...\n');

// Call the library function
const result = doSomething('Hello from my-app!');

console.log('\n--- Result Summary ---');
console.log('Color Support Available:', result.available);
console.log('Debug Colors Count:', result.debugColorsCount);

if (result.available) {
  console.log('✅ SUCCESS: supports-color is working!');
  console.log('   This means:');
  console.log('   1. debug could require("supports-color") successfully');
  console.log('   2. packageExtensions is properly configured OR');
  console.log('   3. supports-color was added to dependencies');
  console.log(`\n   Debug has ${result.debugColorsCount} colors available! 🎨`);
  if (result.debugColorsCount === 6) {
    console.log('   ⚠️  Note: Basic colors (6) - terminal might not support extended colors');
  } else if (result.debugColorsCount > 6) {
    console.log('   ✅ Extended color palette enabled!');
  }
} else {
  console.log('⚠️  WARNING: supports-color is NOT available');
  console.log('   This means:');
  console.log('   1. debug tried to require("supports-color")');
  console.log('   2. It FAILED (MODULE_NOT_FOUND)');
  console.log('   3. debug\'s try-catch caught it (no crash)');
  console.log('   4. Fallback: debug works but WITHOUT colors');
  console.log(`\n   Debug has only ${result.debugColorsCount} colors (basic fallback) ⬜`);
  console.log('\n   Error:', result.error);
}

console.log('\n==============================================\n');

// Show what happens if we try to require supports-color directly
console.log('--- Direct Require Test ---');
try {
  const supportsColor = require('supports-color');
  console.log('✅ Direct require("supports-color") succeeded!');
  console.log('   Level:', supportsColor.stdout.level);
} catch (err) {
  console.log('❌ Direct require("supports-color") failed!');
  console.log('   Error:', err.message);
  console.log('\n   This is expected if:');
  console.log('   - packageExtensions is NOT configured');
  console.log('   - supports-color is NOT in any package.json');
}

console.log('\n==============================================\n');

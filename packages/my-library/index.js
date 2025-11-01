/**
 * my-library: A simple library that uses debug
 *
 * This library depends on 'debug' but does NOT specify 'supports-color'
 * This mimics the real-world scenario where vite depends on debug.
 */

const debug = require('debug');

// Create a debug logger
const log = debug('my-library:main');

/**
 * Check if supports-color is actually available
 */
function checkColorSupport() {
  try {
    const supportsColor = require('supports-color');
    return {
      available: true,
      stdout: supportsColor.stdout ? supportsColor.stdout.level : 0,
      stderr: supportsColor.stderr ? supportsColor.stderr.level : 0
    };
  } catch (err) {
    return {
      available: false,
      error: err.message
    };
  }
}

/**
 * Main function that demonstrates debug usage
 */
function doSomething(message) {
  log('Starting operation...');
  log('Message: %s', message);

  const colorSupport = checkColorSupport();

  // Check debug's color configuration
  const debugModule = require('debug');
  const colors = debugModule.colors || [];

  if (colorSupport.available) {
    log('✅ Color support IS available!');
    log('   - stdout level: %d', colorSupport.stdout);
    log('   - stderr level: %d', colorSupport.stderr);
    log('   - debug.colors array length: %d', colors.length);
  } else {
    log('❌ Color support NOT available');
    log('   - Error: %s', colorSupport.error);
    log('   - debug.colors array length: %d', colors.length);
  }

  log('Operation completed!');

  return {
    ...colorSupport,
    debugColorsCount: colors.length
  };
}

module.exports = {
  doSomething,
  checkColorSupport
};

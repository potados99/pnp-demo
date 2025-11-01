# PnP Demo: supports-color Behavior Test

This project demonstrates how `MODULE_NOT_FOUND` errors occur in Yarn PnP when dependencies are not properly declared, and shows the actual behavioral difference.

## Project Structure

```
pnp-demo/
├── packages/
│   ├── my-library/          # Library that uses 'debug' (like vite does)
│   │   ├── package.json     # Has 'debug' but NOT 'supports-color'
│   │   └── index.js         # Uses debug, checks color support
│   └── my-app/              # Application that uses my-library
│       ├── package.json
│       └── index.js         # Demonstrates the behavior
├── package.json             # Root workspace config
└── .yarnrc.yml              # PnP config (packageExtensions commented out)
```

## The Problem

- `my-library` depends on `debug`
- `debug` has an **optional peer dependency** on `supports-color`
- `debug` uses try-catch to handle missing `supports-color`
- In Yarn PnP strict mode, if `my-library` doesn't provide `supports-color`, `debug` can't access it
- Result: **debug works but without colors**

## Setup

```bash
cd ~/projects/pnp-demo

# Install dependencies
corepack enable
yarn install
```

## Quick Demo

Run the automated demo script:

```bash
cd ~/projects/pnp-demo
./demo.sh
```

This will automatically:
1. Test WITHOUT packageExtensions (shows the problem)
2. Test WITH packageExtensions (shows the fix)
3. Show a comparison summary

## Manual Demo

### Demo 1: WITHOUT packageExtensions (Shows the problem)

Current state: `.yarnrc.yml` has packageExtensions commented out.

```bash
yarn workspace my-app start
```

**Expected Output**:
- ❌ Color support NOT available
- `require('supports-color')` FAILS (but caught by try-catch)
- Debug output is plain text (no colors)
- Application still works (no crash)

### Demo 2: WITH packageExtensions (Shows the fix)

1. Edit `.yarnrc.yml` and uncomment the packageExtensions:

```yaml
packageExtensions:
  "my-library@*":
    dependencies:
      supports-color: "*"
```

**Important Note**: We patch `my-library` (not `debug`) because in Yarn PnP, only the **direct parent** can provide peer dependencies. Since `my-library` uses `debug`, `my-library` must provide `supports-color`.

2. Reinstall:

```bash
yarn install
```

3. Run again:

```bash
yarn workspace my-app start
```

**Expected Output**:
- ✅ Color support IS available
- `require('supports-color')` succeeds (from my-library's context)
- Debug gets colors 🎨
- Application works better

## Behavioral Difference

| Aspect | WITHOUT packageExtensions | WITH packageExtensions |
|--------|--------------------------|------------------------|
| **Error Count** | ❌ 2 errors (my-library + my-app) | ⚠️ 1 error (only my-app) |
| **Color Support** | ❌ Not available | ✅ Available |
| **Debug Output** | Plain text | Colored |
| **Application** | ✅ Works (no crash) | ✅ Works |

**Important**: Even with packageExtensions, you'll still see 1 error because `my-app` tries to directly require supports-color (which it shouldn't have access to). This demonstrates PnP's strict isolation - packageExtensions only makes it available to `my-library`, not to `my-app`!

## Key Insights

1. **require() actually fails**: When `debug` tries `require('supports-color')`, it FAILS with MODULE_NOT_FOUND

2. **try-catch saves the day**:
   ```javascript
   try {
     const supportsColor = require('supports-color'); // FAILS!
   } catch (err) {
     // Caught! No crash, just disable colors
   }
   ```

3. **Behavioral difference is real**:
   - Without fix: No colors in debug output
   - With fix: Colors enabled

4. **This is optional degradation**:
   - Not a crash, just reduced functionality
   - But still worth fixing for better UX

## How This Relates to the Real World

This mimics the actual scenario in your Sonamu project:

- `vite` → `my-library` (both use `debug`)
- `debug` has optional peerDep on `supports-color`
- Without packageExtensions: Works but no colors + warnings
- With packageExtensions: Works with colors + no warnings

## Clean Up

```bash
# Remove the demo project
rm -rf ~/projects/pnp-demo
```

## Further Experiments

Try these modifications:

1. **Add supports-color to my-library**:
   ```json
   // packages/my-library/package.json
   "dependencies": {
     "debug": "^4.3.7",
     "supports-color": "^10.0.0"  // Add this
   }
   ```
   Result: Now my-library provides it for debug ✅

2. **Remove try-catch from debug**:
   Modify node_modules to see what happens without try-catch
   Result: Application would crash! 💥

3. **Check actual debug source**:
   ```bash
   cat .yarn/cache/debug-*.zip # (extract and view)
   ```
   See the real try-catch in debug's source code

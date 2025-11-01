# Quick Start Guide

## What This Demo Shows

This project demonstrates that `MODULE_NOT_FOUND` errors in Yarn PnP:
- **Actually cause `require()` to fail** (not just warnings!)
- **Are caught by try-catch** (in well-written packages)
- **Result in different behavior** (colors vs no colors)
- **Don't crash the app** (graceful degradation)

## Run the Demo (30 seconds)

```bash
cd ~/projects/pnp-demo
./demo.sh
```

This will automatically:
1. Test WITHOUT packageExtensions → Shows `Color Support Available: false`
2. Test WITH packageExtensions → Shows `Color Support Available: true`
3. Show a summary comparison

## What You'll See

### Without Fix (2 errors):
```
Color Support Available: false
⚠️  WARNING: supports-color is NOT available
   Debug output above is PLAIN TEXT (no colors) ⬜
   [Error from my-library context]

❌ Direct require("supports-color") failed!
   [Error from my-app context]
```

### With Fix (1 error):
```
Color Support Available: true
✅ SUCCESS: supports-color is working!
   Debug output above should be COLORED! 🎨
   [No error from my-library - packageExtensions worked!]

❌ Direct require("supports-color") failed!
   [Still error from my-app - PnP isolation working correctly]
```

**Key insight**: packageExtensions makes supports-color available to `my-library` (fixing the first error), but NOT to `my-app` (second error remains). This proves PnP's strict dependency isolation!

## Note About Colors

You might not see visual color differences in the terminal output. This is normal! The key difference is:

- **Error count**: 2 errors → 1 error (proves it works!)
- **Module availability**: `false` → `true` (proves require succeeds!)

Visual colors depend on your terminal's capabilities. See **COLORS_EXPLAINED.md** for details.

## The Key Insight

```javascript
// Inside the debug package:
try {
  const supportsColor = require('supports-color');  // ❌ FAILS in PnP!
  useColors = true;
} catch (err) {
  // ✅ Caught! No crash, but colors disabled
  useColors = false;
}
```

**Result**: The app works in both cases, but with observable behavioral differences!

## Manual Testing

```bash
# Test without fix
cd ~/projects/pnp-demo
# Comment out packageExtensions in .yarnrc.yml
yarn install
yarn workspace my-app start

# Test with fix
# Uncomment packageExtensions in .yarnrc.yml
yarn install
yarn workspace my-app start
```

## Why Patch my-library (not debug)?

In Yarn PnP, **only the direct parent** can provide dependencies:

```
my-app
  └─ my-library (A)
       └─ debug (B)
            └─ supports-color (C)  ❌ Must be in A's deps!
```

That's why we patch `my-library` (not `debug`):

```yaml
packageExtensions:
  "my-library@*":     # ✅ Correct
    dependencies:
      supports-color: "*"

  # "debug@*":        # ❌ Won't work
  #   dependencies:
  #     supports-color: "*"
```

## Learn More

- **EXPLANATION.md** - Technical deep-dive with call stacks
- **README.md** - Full documentation and experiments

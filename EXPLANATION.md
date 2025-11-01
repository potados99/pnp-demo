# Understanding the Demo: Technical Explanation

## What This Demo Proves

This demo demonstrates that `MODULE_NOT_FOUND` errors in Yarn PnP environments:
1. **Actually cause `require()` to fail**
2. **Are caught by try-catch** (in well-written packages like `debug`)
3. **Result in observable behavioral differences** (no colors vs. colors)
4. **Don't crash the application** (graceful degradation)

## The Call Stack

### Without packageExtensions:

```
my-app/index.js
  └─ require('my-library')
       └─ my-library/index.js
            └─ require('debug')
                 └─ debug internally:
                      try {
                        require('supports-color')  // ❌ FAILS HERE!
                        └─ Yarn PnP checks:
                             "Is supports-color in my-library's dependencies?"
                             → NO!
                             → Throw MODULE_NOT_FOUND
                      } catch (err) {
                        // ✅ Caught! Set useColor = false
                      }
```

**Result**: `debug` works but outputs plain text (no colors)

### With packageExtensions:

```
my-app/index.js
  └─ require('my-library')
       [packageExtensions adds supports-color to my-library]
       └─ my-library/index.js
            └─ require('debug')
                 └─ debug internally:
                      try {
                        require('supports-color')  // ✅ SUCCESS!
                        └─ Yarn PnP checks:
                             "Is supports-color in my-library's dependencies?"
                             → YES! (via packageExtensions)
                             → Return the module
                        useColor = supportsColor.stdout.level >= 2
                      } catch (err) {
                        // Not executed
                      }
```

**Result**: `debug` works AND outputs with colors! 🎨

## Why Patch my-library Instead of debug?

This is the KEY insight about Yarn PnP's strict dependency resolution:

```
Yarn PnP Rule:
  When package A requires package B,
  and B tries to require package C,
  C must be declared in A's dependencies (not B's peerDependencies)
```

In our case:
- `my-library` (A) requires `debug` (B)
- `debug` (B) tries to require `supports-color` (C)
- **`supports-color` must be in `my-library`'s dependencies!**

This is why:
```yaml
# ❌ This doesn't work:
packageExtensions:
  "debug@*":
    dependencies:
      supports-color: "*"

# ✅ This works:
packageExtensions:
  "my-library@*":
    dependencies:
      supports-color: "*"
```

## Real-World Parallel

This demo mimics your Sonamu project:

| Demo | Sonamu Project |
|------|----------------|
| `my-library` | `vite` or `modules/react-sui` |
| `debug` | `debug` (same) |
| `supports-color` | `supports-color` (same) |

In Sonamu:
- `react-sui` uses `vite`
- `vite` uses `debug`
- `debug` needs `supports-color`
- **Solution**: Add `supports-color` to packages that use `vite` OR use packageExtensions

## The Debug Package's Actual Code

This is the REAL code from debug (verified from GitHub):

```javascript
// https://github.com/debug-js/debug/blob/master/src/node.js
try {
  // Optional dependency (as in, doesn't need to be installed,
  // NOT like optionalDependencies in package.json)
  // eslint-disable-next-line import/no-extraneous-dependencies
  const supportsColor = require('supports-color');

  if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
    exports.colors = [
      20,
      21,
      // ... expanded color palette
    ];
  }
} catch (error) {
  // Swallow - we only care if `supports-color` is available;
  // it doesn't have to be.
}
```

**Key observations**:
1. The comment explicitly says: "doesn't need to be installed"
2. The try-catch is there to handle missing module gracefully
3. If missing, colors array stays at default (basic colors only)
4. No crash, just reduced functionality

## Behavioral Impact

### Without supports-color:
```javascript
// debug uses default 6 colors
exports.colors = [6, 2, 3, 4, 5, 1];
```

### With supports-color (and level >= 2):
```javascript
// debug uses expanded 20+ colors
exports.colors = [
  20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63,
  68, 69, 74, 75, 76, 77, 78, 79, 80, 81, 92, 93, 98, 99, 112, 113, 128,
  129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165, 166, 167, 168,
  169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200,
  201, 202, 203, 204, 205, 206, 207, 208, 209, 214, 215, 220, 221
];
```

**Visible difference**: More vibrant, varied colors in terminal output!

## Testing It Yourself

1. **See it without fix**:
   ```bash
   cd ~/projects/pnp-demo
   # Ensure packageExtensions is commented out in .yarnrc.yml
   yarn install
   DEBUG=* yarn workspace my-app start
   ```
   Look at the output - it should be plain or basic colors.

2. **See it with fix**:
   ```bash
   # Uncomment packageExtensions in .yarnrc.yml
   yarn install
   DEBUG=* yarn workspace my-app start
   ```
   Look at the output - if your terminal supports it, you'll see richer colors!

3. **Check the actual data**:
   The demo app tells you explicitly whether supports-color is available:
   ```
   Color Support Available: false  // without fix
   Color Support Available: true   // with fix
   ```

## Conclusion

This demo proves:
1. ✅ `require()` **actually fails** (MODULE_NOT_FOUND is thrown)
2. ✅ **try-catch prevents crashes** (graceful degradation)
3. ✅ **Behavior is different** (colors vs. no colors)
4. ✅ **Application still works** (not fatal)

Therefore, `MODULE_NOT_FOUND` errors are:
- **Not immediately harmful** (no crashes)
- **But functionally significant** (behavioral differences)
- **Worth fixing** (better user experience)

## Error Count Difference

When you run the demo, notice the error count:

**Without packageExtensions**: **2 errors**
1. Error from `my-library/index.js` trying to require supports-color
2. Error from `my-app/index.js` trying to require supports-color

**With packageExtensions**: **1 error**
1. Only error from `my-app/index.js` trying to require supports-color
2. No error from `my-library` because packageExtensions provides it!

This demonstrates that packageExtensions **actually works** - it makes supports-color available to `my-library` (and transitively to `debug` used by my-library), but **not** to `my-app` itself. This is PnP's strict isolation at work!

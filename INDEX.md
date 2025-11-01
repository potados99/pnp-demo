# PnP Demo - Documentation Index

## 📖 Reading Order

### 1. **QUICK_START.md** (Start Here!)
   - 30-second demo
   - See the behavioral difference immediately
   - Best for: First-time viewers

### 2. **README.md** (Complete Guide)
   - Full project structure
   - Manual testing instructions
   - Behavioral comparison table
   - Further experiments
   - Best for: Understanding the full picture

### 3. **EXPLANATION.md** (Technical Deep-Dive)
   - Detailed call stacks (with/without fix)
   - Why patch my-library instead of debug
   - Real-world parallels (Sonamu project)
   - Actual debug package source code
   - Best for: Understanding the internals

### 4. **COLORS_EXPLAINED.md** (Why No Visual Colors?)
   - Why you might not see color differences
   - Terminal capability requirements
   - The error count is what matters (2 → 1)
   - How to force extended colors if desired
   - Best for: Understanding terminal color behavior

## 🎯 What This Demo Proves

```
MODULE_NOT_FOUND errors in Yarn PnP:
  ✅ Actually cause require() to fail
  ✅ Are caught by try-catch (in well-written packages)
  ✅ Result in observable behavioral differences
  ✅ Don't crash the application (graceful degradation)
```

## 🚀 Quick Commands

```bash
# Run automated demo (recommended!)
cd ~/projects/pnp-demo
./demo.sh

# Manual test - without fix
yarn install
yarn workspace my-app start

# Manual test - with fix (uncomment packageExtensions in .yarnrc.yml)
yarn install
yarn workspace my-app start
```

## 📁 Project Structure

```
pnp-demo/
├── INDEX.md              ← You are here
├── QUICK_START.md        ← Start with this
├── README.md             ← Complete guide
├── EXPLANATION.md        ← Technical deep-dive
├── demo.sh               ← Automated demo script
├── .yarnrc.yml           ← PnP config with packageExtensions
├── package.json          ← Root workspace config
└── packages/
    ├── my-library/       ← Library using debug (like vite)
    │   ├── package.json
    │   └── index.js
    └── my-app/           ← App using my-library
        ├── package.json
        └── index.js
```

## 🔑 Key Concept: Direct Parent Rule

```yaml
# In Yarn PnP, only the DIRECT PARENT can provide dependencies

my-app
  └─ my-library (A) ← Must declare supports-color here!
       └─ debug (B)
            └─ supports-color (C)

# Solution:
packageExtensions:
  "my-library@*":    # Patch the direct parent
    dependencies:
      supports-color: "*"
```

## 🌍 Real-World Application

This demo mimics your Sonamu project:

| Demo | Sonamu |
|------|--------|
| my-library | vite / react-sui |
| debug | debug |
| supports-color | supports-color |

The same principle applies to all 13 unique packages with MODULE_NOT_FOUND errors in Sonamu.

## 🧹 Clean Up

```bash
# Remove the demo project
rm -rf ~/projects/pnp-demo
```

## 💡 Related Documentation

See `/home/potados/projects/sonamu/docs/package-dependencies-analysis.md` for:
- Complete analysis of Sonamu's MODULE_NOT_FOUND errors
- package.json vs packageExtensions comparison
- Workspace vs non-workspace differences
- All 13 unique packages requiring fixes
- Official references and verification tools

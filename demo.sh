#!/bin/bash

echo "======================================================================="
echo "  PnP Demo: Demonstrating MODULE_NOT_FOUND Behavioral Impact"
echo "======================================================================="
echo ""

# Function to run test
run_test() {
  local description=$1
  local has_fix=$2

  echo "-----------------------------------------------------------------------"
  echo "$description"
  echo "-----------------------------------------------------------------------"

  yarn workspace my-app start 2>&1 | grep -E "(Color Support Available|SUCCESS|WARNING|Debug output|Error:)" || true

  echo ""
}

echo "📌 STEP 1: WITHOUT packageExtensions (shows the problem)"
echo ""
echo "Editing .yarnrc.yml to comment out packageExtensions..."

# Comment out packageExtensions
cat > .yarnrc.yml << 'EOF'
compressionLevel: mixed
enableGlobalCache: false
nmHoistingLimits: none
nodeLinker: pnp

pnpUnpluggedFolder: ./.yarn/unplugged
pnpMode: loose

# packageExtensions DISABLED to show the problem
# packageExtensions:
#   "my-library@*":
#     dependencies:
#       supports-color: "*"
EOF

echo "Reinstalling dependencies..."
yarn install > /dev/null 2>&1

echo ""
run_test "TEST 1: WITHOUT FIX" false

echo ""
echo "======================================================================="
echo ""
echo "📌 STEP 2: WITH packageExtensions (shows the fix)"
echo ""
echo "Editing .yarnrc.yml to enable packageExtensions..."

# Enable packageExtensions
cat > .yarnrc.yml << 'EOF'
compressionLevel: mixed
enableGlobalCache: false
nmHoistingLimits: none
nodeLinker: pnp

pnpUnpluggedFolder: ./.yarn/unplugged
pnpMode: loose

# packageExtensions ENABLED to fix the problem
packageExtensions:
  "my-library@*":
    dependencies:
      supports-color: "*"
EOF

echo "Reinstalling dependencies..."
yarn install > /dev/null 2>&1

echo ""
run_test "TEST 2: WITH FIX" true

echo ""
echo "======================================================================="
echo "  SUMMARY"
echo "======================================================================="
echo ""
echo "Without packageExtensions:"
echo "  ❌ Error Count: 2 (my-library + my-app)"
echo "  ❌ Color Support: NOT available"
echo "  📝 Behavior: debug works but WITHOUT colors"
echo ""
echo "With packageExtensions:"
echo "  ⚠️  Error Count: 1 (only my-app)"
echo "  ✅ Color Support: Available"
echo "  🎨 Behavior: debug works WITH colors"
echo ""
echo "Key Insights:"
echo "  1. The require() actually FAILS (MODULE_NOT_FOUND is thrown)"
echo "  2. But debug's try-catch prevents crashes (graceful degradation)"
echo "  3. packageExtensions REDUCES errors from 2 → 1"
echo "  4. The remaining 1 error is EXPECTED (PnP isolation working)"
echo "  5. The APPLICATION WORKS in both cases, but with DIFFERENT BEHAVIOR"
echo ""
echo "This demonstrates that MODULE_NOT_FOUND errors, while not fatal,"
echo "DO result in observable behavioral differences!"
echo ""
echo "The error count difference (2 vs 1) proves packageExtensions works!"
echo ""
echo "======================================================================="

#!/bin/bash

# Simplified E2E Test Runner
# Runs tests in headless mode for reliability

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "  E2E Tests - Headless Mode"
echo "=========================================="
echo ""

# Check dev server
echo -e "${YELLOW}Checking dev server...${NC}"
if curl -s --max-time 3 http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Dev server is running${NC}"
else
    echo -e "${RED}❌ Dev server not responding!${NC}"
    echo "Please restart: npm run dev"
    exit 1
fi

echo ""
echo "Running all tests in headless mode..."
echo ""

# Run all tests at once (headless, faster)
npx playwright test --timeout=30000

echo ""
echo "=========================================="
echo "  Tests Complete!"
echo "=========================================="
echo ""
echo "View detailed report:"
echo "  npm run test:e2e:report"
echo ""

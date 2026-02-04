#!/bin/bash

set -e

echo "=========================================="
echo "  E2E Tests - Using Test Database"
echo "=========================================="
echo ""

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "❌ Error: .env.test file not found!"
    echo ""
    echo "Please follow the setup guide:"
    echo "  e2e/TEST_DATABASE_SETUP.md"
    echo ""
    echo "Quick start:"
    echo "  1. Copy .env.test.example to .env.test"
    echo "  2. Fill in your test Supabase credentials"
    echo "  3. Re-run this script"
    echo ""
    exit 1
fi

# Check if dev server is running
echo "Checking dev server..."
if curl -s --max-time 3 http://localhost:3000 > /dev/null; then
    echo "✅ Dev server is running"
else
    echo "❌ Dev server is NOT running"
    echo ""
    echo "Please start dev server first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "Running tests with test database..."
echo ""

# Run Playwright tests
npx playwright test

RESULT=$?

echo ""
echo "=========================================="
if [ $RESULT -eq 0 ]; then
    echo "  ✅ All tests passed!"
else
    echo "  ⚠️  Some tests failed"
fi
echo "=========================================="
echo ""
echo "View HTML report: npm run test:e2e:report"
echo "Clean test data:  npm run test:cleanup"
echo ""

exit $RESULT

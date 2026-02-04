#!/bin/bash

# E2E Test Execution Script for Urpeer.com
# Run this script to execute all E2E tests in stages

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  Urpeer.com E2E Test Execution"
echo "=========================================="
echo ""

# Function to run a test suite
run_suite() {
    local suite_name=$1
    local test_file=$2
    local expected_pass=$3

    echo -e "${YELLOW}Running ${suite_name}...${NC}"
    echo "Expected: ${expected_pass} tests to pass"
    echo ""

    if npx playwright test ${test_file} --headed --timeout=30000; then
        echo -e "${GREEN}✅ ${suite_name} completed successfully${NC}"
    else
        echo -e "${RED}⚠️  ${suite_name} had failures (this may be expected)${NC}"
    fi

    echo ""
    read -p "Press Enter to continue to next suite..."
    echo ""
}

# Stage 1: Smoke Tests
echo "=========================================="
echo "Stage 1: Smoke Tests (Basic Page Loads)"
echo "=========================================="
echo "Tests: 4 (homepage, signup, login, feedback pages)"
echo "Expected: 4/4 pass"
echo ""
read -p "Press Enter to start smoke tests..."
echo ""

run_suite "Smoke Tests" "smoke.spec.ts" "4/4"

# Stage 2: Authentication Tests
echo "=========================================="
echo "Stage 2: Authentication Tests"
echo "=========================================="
echo "Tests: 7 (signup, login, onboarding, validation)"
echo "Expected: 6-7/7 pass"
echo "Creates: ~7 test users in Supabase"
echo ""
read -p "Press Enter to start auth tests..."
echo ""

run_suite "Authentication Tests" "auth.spec.ts" "6-7/7"

# Stage 3: Feedback Tests
echo "=========================================="
echo "Stage 3: Feedback Tests"
echo "=========================================="
echo "Tests: 5 (create, vote, comment, filter, search)"
echo "Expected: 3-5/5 pass (filter/search may skip)"
echo "Creates: ~5 test users, ~8 feedback items"
echo ""
read -p "Press Enter to start feedback tests..."
echo ""

run_suite "Feedback Tests" "feedback.spec.ts" "3-5/5"

# Stage 4: Admin Tests
echo "=========================================="
echo "Stage 4: Admin Tests"
echo "=========================================="
echo "Tests: 6 (dashboard, roadmap, changelog, management)"
echo "Expected: 4-6/6 pass (some features may skip)"
echo "Creates: ~6 test users (each becomes admin)"
echo ""
read -p "Press Enter to start admin tests..."
echo ""

run_suite "Admin Tests" "admin.spec.ts" "4-6/6"

# Stage 5: Full Suite
echo "=========================================="
echo "Stage 5: Full Suite (Headless)"
echo "=========================================="
echo "Running all 22 tests in headless mode for final validation"
echo ""
read -p "Press Enter to run full suite..."
echo ""

echo -e "${YELLOW}Running full test suite...${NC}"
npm run test:e2e

echo ""
echo "=========================================="
echo "  Test Execution Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review HTML report: npm run test:e2e:report"
echo "2. Check test-results/ folder for screenshots/videos"
echo "3. Document results in e2e/README.md"
echo ""

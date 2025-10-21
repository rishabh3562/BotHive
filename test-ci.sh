#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}   Testing CI Workflow Locally${NC}"
echo -e "${BLUE}===========================================${NC}\n"

# Function to run command and check result
run_step() {
    local step_name=$1
    local command=$2
    
    echo -e "${BLUE}>>> $step_name${NC}"
    if eval $command; then
        echo -e "${GREEN}✓ $step_name passed${NC}\n"
        return 0
    else
        echo -e "${RED}✗ $step_name failed${NC}\n"
        return 1
    fi
}

# Run all CI steps
run_step "Installing dependencies" "npm ci" || exit 1
run_step "Running ESLint" "npm run lint" || exit 1
run_step "Running type checking" "npm run type-check" || exit 1
run_step "Running tests" "npm test" || exit 1
run_step "Running tests with coverage" "npm run test:coverage" || exit 1
run_step "Building project" "npm run build" || exit 1

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}   ✓ All CI checks passed!${NC}"
echo -e "${GREEN}===========================================${NC}"

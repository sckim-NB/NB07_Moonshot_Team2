#!/bin/bash

set -e  # 에러 발생 시 즉시 종료

echo "🔍 Starting automated checks..."
echo ""

# 1. Lint Check
echo "📋 Running ESLint..."
npm run lint
echo "✅ Lint check passed"
echo ""

# 2. Format Check
echo "🎨 Running Prettier format check..."
npm run format:check
echo "✅ Format check passed"
echo ""

# 3. Build Check
echo "🔨 Running TypeScript build..."
npm run build
echo "✅ Build successful"
echo ""

# 4. Test
echo "🧪 Running tests..."
npm run test
echo "✅ All tests passed"
echo ""

echo "✨ All checks completed successfully!"

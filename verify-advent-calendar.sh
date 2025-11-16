#!/bin/bash

# Verification script for Offline French Advent Calendar setup

echo "======================================"
echo "Whisplay Advent Calendar - Verification"
echo "======================================"
echo ""

# Check key files exist
echo "Checking modified/created files..."
echo ""

FILES=(
  "src/core/AdventCalendar.ts"
  "src/cloud-api/offline-asr.ts"
  "src/cloud-api/offline-llm.ts"
  ".github/copilot-instructions.md"
  ".env.advent-calendar"
  "ADVENT_CALENDAR_SETUP.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (MISSING)"
  fi
done

echo ""
echo "Checking TypeScript compilation..."
if command -v tsc &> /dev/null; then
  echo "✅ TypeScript compiler found"
else
  echo "⚠️  TypeScript compiler not found (npm install needed)"
fi

echo ""
echo "Checking Node.js..."
if command -v node &> /dev/null; then
  node_version=$(node --version)
  echo "✅ Node.js $node_version"
else
  echo "❌ Node.js not found"
fi

echo ""
echo "Checking npm dependencies..."
if [ -d "node_modules" ]; then
  echo "✅ node_modules directory exists"
else
  echo "⚠️  node_modules not installed (run: npm install)"
fi

echo ""
echo "======================================"
echo "Setup Instructions"
echo "======================================"
echo ""
echo "1. Install dependencies:"
echo "   npm install"
echo ""
echo "2. Configure environment:"
echo "   cp .env.advent-calendar .env"
echo "   # Edit .env with your Piper paths"
echo ""
echo "3. Build TypeScript:"
echo "   bash build.sh"
echo ""
echo "4. Run the application:"
echo "   bash run_chatbot.sh"
echo ""
echo "5. (Optional) Setup auto-start:"
echo "   sudo bash startup.sh"
echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo ""
echo "📖 Read ADVENT_CALENDAR_SETUP.md for detailed setup"
echo "📝 Edit src/core/AdventCalendar.ts to customize gifts"
echo "🗣️  Edit src/cloud-api/offline-asr.ts to add trigger phrases"
echo ""
echo "For more info, see:"
echo "  - README.md (Offline Advent Calendar Edition section)"
echo "  - .github/copilot-instructions.md (Architecture guide)"
echo ""

#!/bin/bash

set -e

# Get the script directory (sticker_scrap)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

cd "$SCRIPT_DIR/Frontend"

echo "Building Frontend..."
pnpm build

echo "Copying files to Kooboo directories..."

# Create directories if they don't exist
mkdir -p "$PROJECT_DIR/src/page"
mkdir -p "$PROJECT_DIR/src/js"
mkdir -p "$PROJECT_DIR/src/css"

# Copy index.html to src/page
cp dist/index.html "$PROJECT_DIR/src/page/"

# Copy js files to src/js
cp dist/*.js "$PROJECT_DIR/src/js/" 2>/dev/null || true

# Copy css files to src/css
cp dist/*.css "$PROJECT_DIR/src/css/" 2>/dev/null || true

echo "Done!"
echo ""
echo "Output files:"
echo "  - src/page/index.html"
echo "  - src/js/*.js"
echo "  - src/css/*.css"

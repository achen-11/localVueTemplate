#!/bin/bash

set -e

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
MANIFEST_FILE="$PROJECT_DIR/.build-manifest.json"

cd "$SCRIPT_DIR/Frontend"

echo "Cleaning previous build artifacts from src..."

# Read previous manifest and clean old files
if [ -f "$MANIFEST_FILE" ]; then
    # Use node to parse JSON and extract arrays
    if command -v node &> /dev/null; then
        # Extract page files
        old_pages=$(node -e "const m=require('$MANIFEST_FILE'); console.log(m.page.join(' '))" 2>/dev/null || true)
        if [ -n "$old_pages" ]; then
            for file in $old_pages; do
                [ -n "$file" ] && rm -f "$PROJECT_DIR/src/page/$file" && echo "  Removed: src/page/$file"
            done
        fi

        # Extract js files
        old_js=$(node -e "const m=require('$MANIFEST_FILE'); console.log(m.js.join(' '))" 2>/dev/null || true)
        if [ -n "$old_js" ]; then
            for file in $old_js; do
                [ -n "$file" ] && rm -f "$PROJECT_DIR/src/js/$file" && echo "  Removed: src/js/$file"
            done
        fi

        # Extract css files
        old_css=$(node -e "const m=require('$MANIFEST_FILE'); console.log(m.css.join(' '))" 2>/dev/null || true)
        if [ -n "$old_css" ]; then
            for file in $old_css; do
                [ -n "$file" ] && rm -f "$PROJECT_DIR/src/css/$file" && echo "  Removed: src/css/$file"
            done
        fi
    fi
fi

echo "Building Frontend..."
pnpm build

echo "Copying files to Kooboo directories..."

# Ensure directories exist
mkdir -p "$PROJECT_DIR/src/page"
mkdir -p "$PROJECT_DIR/src/js"
mkdir -p "$PROJECT_DIR/src/css"

# Collect new files for manifest
new_pages=""
new_js=""
new_css=""

# Copy index.html to src/page
if [ -f "dist/index.html" ]; then
    cp dist/index.html "$PROJECT_DIR/src/page/"
    new_pages="\"index.html\""
    echo "  Copied: src/page/index.html"
fi

# Copy js files to src/js
for file in dist/*.js; do
    if [ -f "$file" ]; then
        basename_file=$(basename "$file")
        cp "$file" "$PROJECT_DIR/src/js/"
        [ -n "$new_js" ] && new_js="$new_js, "
        new_js="$new_js\"$basename_file\""
        echo "  Copied: src/js/$basename_file"
    fi
done

# Copy css files to src/css
for file in dist/*.css; do
    if [ -f "$file" ]; then
        basename_file=$(basename "$file")
        cp "$file" "$PROJECT_DIR/src/css/"
        [ -n "$new_css" ] && new_css="$new_css, "
        new_css="$new_css\"$basename_file\""
        echo "  Copied: src/css/$basename_file"
    fi
done

# Write new manifest
cat > "$MANIFEST_FILE" << EOF
{
  "page": [$new_pages],
  "js": [$new_js],
  "css": [$new_css]
}
EOF

echo ""
echo "Build complete!"
echo ""
echo "Output files:"
echo "  - src/page/index.html"
echo "  - src/js/*.js"
echo "  - src/css/*.css"
echo ""
echo "Manifest saved to: $MANIFEST_FILE"

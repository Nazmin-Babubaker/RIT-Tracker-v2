#!/bin/bash

INPUT_DIR="$HOME/rit-tracker/images"
OUTPUT_DIR="$HOME/rit-tracker/tiles"
TILE_SIZE=544

echo "Starting tile generation..."
echo "Using ImageMagick 6 (convert command)"
echo ""

for IMAGE in "$INPUT_DIR"/*.jpg; do
    FILENAME=$(basename "$IMAGE" .jpg)
    PANO_DIR="$OUTPUT_DIR/$FILENAME"
    mkdir -p "$PANO_DIR"

    echo "Processing: $FILENAME"

    # Generate low-res base image
    convert "$IMAGE" \
        -resize 1024x512! \
        -quality 80 \
        "$PANO_DIR/base.jpg"
    echo "  ✓ base.jpg done"

    # Slice into 544×544 tiles named col_row.jpg
    convert "$IMAGE" \
        -crop ${TILE_SIZE}x${TILE_SIZE} \
        -set filename:tile "%[fx:page.x/${TILE_SIZE}]_%[fx:page.y/${TILE_SIZE}]" \
        -quality 85 \
        +repage \
        "$PANO_DIR/%[filename:tile].jpg"

    TILE_COUNT=$(ls "$PANO_DIR"/*.jpg | grep -v base | wc -l)
    echo "  ✓ $TILE_COUNT tiles written (expected 128)"
    echo ""
done

echo "=== All done ==="
du -sh "$OUTPUT_DIR"

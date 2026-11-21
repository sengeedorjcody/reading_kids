#!/bin/zsh
# Crop a figure out of a book photo (macOS only, uses sips).
#
#   scripts/crop-book-figure.sh <IMG.HEIC> <x0> <y0> <x1> <y1> <out.jpeg>
#
# Coordinates are in the UPRIGHT portrait view of the photo (3024 wide x 4032 tall),
# i.e. what you see when you open the photo normally. The HEIC/JPEG stores the pixels
# rotated 90° with an EXIF orientation tag, which sips ignores when cropping, so this
# script maps the box back to the stored pixels. The EXIF tag is kept, so the saved
# crop shows upright in browsers and viewers.
#
# When you view the photo through an image viewer that scales it down (for example
# 1659x2212), multiply its coordinates by 3024/1659 ≈ 1.82 first.
#
# Example (item 7, figure 1):
#   scripts/crop-book-figure.sh collectionOfExercise/IMG_0090.HEIC 2670 1490 2900 1760 geminiImages/7-3.jpeg
set -e
[ $# -eq 6 ] || { sed -n '2,17p' "$0"; exit 1; }
src=$1; x0=$2; y0=$3; x1=$4; y1=$5; out=$6
tmp=$(mktemp -t bookpage).jpg
trap 'rm -f "$tmp"' EXIT
sips -s format jpeg -s formatOptions 92 "$src" --out "$tmp" >/dev/null
pw=$(sips -g pixelWidth "$tmp" | awk '/pixelWidth/{print $2}')
ph=$(sips -g pixelHeight "$tmp" | awk '/pixelHeight/{print $2}')
# Stored pixels are landscape (4032x3024) when the upright view is portrait.
if [ "$pw" -le "$ph" ]; then echo "Photo is stored upright ($pw x $ph); this script expects a rotated portrait photo." >&2; exit 1; fi
sips -c $(( x1 - x0 )) $(( y1 - y0 )) --cropOffset $(( ph - x1 )) $y0 "$tmp" --out "$out" >/dev/null
echo "saved $out ($(( x1 - x0 )) x $(( y1 - y0 )) before EXIF rotation)"

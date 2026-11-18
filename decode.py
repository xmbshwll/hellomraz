"""Report basic pixel statistics of a PNG file: size, black share, top colours.

Usage: python3 decode.py <file.png>

A small self-contained PNG reader, so no imaging library is required.
"""

from __future__ import annotations

import struct
import sys
import zlib
from pathlib import Path

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
BLACK_LEVEL = 40
COLOUR_BITS = 4
TOP_COLOURS = 6
CHANNELS_BY_COLOUR_TYPE = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}


def _apply_filter(
    filter_type: int,
    line: bytearray,
    prev: bytearray,
    channels: int,
) -> None:
    """Undo one PNG scanline filter in place."""
    stride = len(line)
    if filter_type == 1:
        for x in range(channels, stride):
            line[x] = (line[x] + line[x - channels]) & 0xFF
    elif filter_type == 2:
        for x in range(stride):
            line[x] = (line[x] + prev[x]) & 0xFF
    elif filter_type == 3:
        for x in range(stride):
            left = line[x - channels] if x >= channels else 0
            line[x] = (line[x] + ((left + prev[x]) >> 1)) & 0xFF
    elif filter_type == 4:
        for x in range(stride):
            left = line[x - channels] if x >= channels else 0
            up = prev[x]
            up_left = prev[x - channels] if x >= channels else 0
            estimate = left + up - up_left
            pa = abs(estimate - left)
            pb = abs(estimate - up)
            pc = abs(estimate - up_left)
            if pa <= pb and pa <= pc:
                predictor = left
            elif pb <= pc:
                predictor = up
            else:
                predictor = up_left
            line[x] = (line[x] + predictor) & 0xFF


def read_png(path: str | Path) -> tuple[int, int, int, bytes]:
    """Return ``(width, height, channels, raw_pixels)`` for a PNG file."""
    data = Path(path).read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError(f"not a PNG file: {path}")

    width = height = 0
    channels = 1
    compressed = bytearray()
    position = len(PNG_SIGNATURE)
    while position < len(data):
        length = struct.unpack(">I", data[position : position + 4])[0]
        chunk_type = data[position + 4 : position + 8]
        chunk = data[position + 8 : position + 8 + length]
        position += 12 + length

        if chunk_type == b"IHDR":
            width, height, _depth, colour_type = struct.unpack(">IIBB", chunk[:10])
            channels = CHANNELS_BY_COLOUR_TYPE[colour_type]
        elif chunk_type == b"IDAT":
            compressed += chunk
        elif chunk_type == b"IEND":
            break

    raw = zlib.decompress(bytes(compressed))
    stride = width * channels
    pixels = bytearray()
    prev = bytearray(stride)
    offset = 0
    for _ in range(height):
        filter_type = raw[offset]
        offset += 1
        line = bytearray(raw[offset : offset + stride])
        offset += stride
        _apply_filter(filter_type, line, prev, channels)
        pixels += line
        prev = line

    return width, height, channels, bytes(pixels)


def colour_stats(channels: int, pixels: bytes) -> tuple[int, int, list[tuple[tuple[int, int, int], int]]]:
    """Return ``(black_pixels, total_pixels, top colours)``."""
    black = 0
    total = 0
    histogram: dict[tuple[int, int, int], int] = {}
    for index in range(0, len(pixels), channels):
        red, green, blue = pixels[index], pixels[index + 1], pixels[index + 2]
        total += 1
        if red < BLACK_LEVEL and green < BLACK_LEVEL and blue < BLACK_LEVEL:
            black += 1
        bucket = (red >> COLOUR_BITS, green >> COLOUR_BITS, blue >> COLOUR_BITS)
        histogram[bucket] = histogram.get(bucket, 0) + 1
    top = sorted(histogram.items(), key=lambda item: -item[1])[:TOP_COLOURS]
    return black, total, top


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: python3 decode.py <file.png>", file=sys.stderr)
        return 2
    width, height, channels, pixels = read_png(argv[1])
    black, total, top = colour_stats(channels, pixels)
    print(f"{width}x{height} ch={channels} black={black} ({100 * black / total:.3f}%) top={top}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

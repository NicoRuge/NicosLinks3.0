#!/usr/bin/env python3
"""Extract platform statistics from Spotify extended streaming history.

Counts the number of streams per platform and writes the result to
assets/data/spotify_platform_stats.json.
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Count Spotify streams per platform from extended streaming history."
    )
    parser.add_argument(
        "--export-dir",
        required=True,
        help="Path to unzipped Spotify account data export directory.",
    )
    parser.add_argument(
        "--output",
        default="assets/data/spotify_platform_stats.json",
        help="Path to output JSON file (default: assets/data/spotify_platform_stats.json).",
    )
    parser.add_argument(
        "--min-ms",
        type=int,
        default=0,
        help="Minimum play duration in ms to count a stream (default: 0, count all).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    export_dir = Path(args.export_dir).expanduser().resolve()
    output_file = Path(args.output).expanduser().resolve()

    if not export_dir.exists() or not export_dir.is_dir():
        raise SystemExit(f"Export directory not found: {export_dir}")

    platform_counts: dict[str, int] = defaultdict(int)
    total_events = 0
    files_processed = 0

    for json_file in sorted(export_dir.rglob("*.json")):
        try:
            with json_file.open("r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue

        if not isinstance(data, list) or not data:
            continue
        if not isinstance(data[0], dict) or "platform" not in data[0]:
            continue

        files_processed += 1

        for event in data:
            if not isinstance(event, dict):
                continue

            ms = event.get("ms_played", 0)
            try:
                ms = int(ms)
            except (TypeError, ValueError):
                ms = 0

            if ms < args.min_ms:
                continue

            platform = event.get("platform") or "unknown"
            platform_counts[platform] += 1
            total_events += 1

    # Sort by count descending
    sorted_platforms = dict(
        sorted(platform_counts.items(), key=lambda x: x[1], reverse=True)
    )

    output = {
        "title": "Spotify Streams per Platform",
        "total_streams": total_events,
        "platforms": sorted_platforms,
    }

    output_file.parent.mkdir(parents=True, exist_ok=True)
    with output_file.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=4, ensure_ascii=False)
        f.write("\n")

    print(f"Processed files: {files_processed}")
    print(f"Total streams counted: {total_events}")
    print(f"Unique platforms: {len(platform_counts)}")
    print(f"Written to: {output_file}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

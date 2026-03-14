#!/usr/bin/env python3
"""Extract top artists and top tracks from Spotify extended streaming history.

Only audio tracks (not podcasts/audiobooks) are counted — entries with a null
track name or null artist name are skipped.
"""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Rank artists and tracks by stream count and listening minutes."
    )
    parser.add_argument("--export-dir", required=True)
    parser.add_argument(
        "--output", default="assets/data/spotify_top_artists_tracks.json"
    )
    parser.add_argument(
        "--min-ms", type=int, default=30_000,
        help="Minimum ms_played to count a stream (default: 30000 = 30 s)."
    )
    parser.add_argument(
        "--top-n", type=int, default=50,
        help="How many entries to keep per ranked list (default: 50)."
    )
    return parser.parse_args()


def sorted_list(data: dict, sort_key: str, top_n: int, extra_fields: list[str]) -> list[dict]:
    return sorted(
        [
            {**{"name": k}, **{f: v[f] for f in extra_fields}, "streams": v["streams"], "minutes": v["minutes"]}
            for k, v in data.items()
        ],
        key=lambda x: x[sort_key],
        reverse=True,
    )[:top_n]


def main() -> int:
    args = parse_args()
    export_dir = Path(args.export_dir).expanduser().resolve()
    output_file = Path(args.output).expanduser().resolve()

    if not export_dir.exists():
        raise SystemExit(f"Export directory not found: {export_dir}")

    # artist_name -> {streams, ms}
    artists: dict[str, dict] = defaultdict(lambda: {"streams": 0, "ms": 0})
    # (track_name, artist_name) -> {streams, ms, artist}
    tracks:  dict[tuple, dict] = defaultdict(lambda: {"streams": 0, "ms": 0, "artist": ""})

    total = 0
    files = 0

    for json_file in sorted(export_dir.rglob("*.json")):
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if not isinstance(data, list) or not data:
            continue
        if not isinstance(data[0], dict) or "ts" not in data[0]:
            continue

        files += 1
        for event in data:
            if not isinstance(event, dict):
                continue

            ms = event.get("ms_played", 0) or 0
            if ms < args.min_ms:
                continue

            artist = event.get("master_metadata_album_artist_name")
            track  = event.get("master_metadata_track_name")

            # Skip podcasts, audiobooks, etc.
            if not artist or not track:
                continue

            artists[artist]["streams"] += 1
            artists[artist]["ms"]      += ms

            key = (track, artist)
            tracks[key]["streams"] += 1
            tracks[key]["ms"]      += ms
            tracks[key]["artist"]   = artist

            total += 1

    # Convert ms → minutes
    for v in artists.values():
        v["minutes"] = round(v["ms"] / 60_000)
    for v in tracks.values():
        v["minutes"] = round(v["ms"] / 60_000)

    def artist_list(sort_key: str) -> list[dict]:
        return sorted(
            [{"name": k, "streams": v["streams"], "minutes": v["minutes"]} for k, v in artists.items()],
            key=lambda x: x[sort_key],
            reverse=True,
        )[: args.top_n]

    def track_list(sort_key: str) -> list[dict]:
        return sorted(
            [
                {
                    "name":    k[0],
                    "artist":  v["artist"],
                    "streams": v["streams"],
                    "minutes": v["minutes"],
                }
                for k, v in tracks.items()
            ],
            key=lambda x: x[sort_key],
            reverse=True,
        )[: args.top_n]

    output = {
        "title":             "Spotify Top Artists & Tracks",
        "min_ms":            args.min_ms,
        "total_counted":     total,
        "unique_artists":    len(artists),
        "unique_tracks":     len(tracks),
        "artists_by_streams": artist_list("streams"),
        "artists_by_minutes": artist_list("minutes"),
        "tracks_by_streams":  track_list("streams"),
        "tracks_by_minutes":  track_list("minutes"),
    }

    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(
        json.dumps(output, indent=4, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    print(f"Files processed:  {files}")
    print(f"Streams counted:  {total}")
    print(f"Unique artists:   {len(artists)}")
    print(f"Unique tracks:    {len(tracks)}")
    print(f"Written to:       {output_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

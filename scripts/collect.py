#!/usr/bin/env python3
"""Best-effort reader for public parking figures. Not an approved OpenAPI client."""
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

URL = "https://parking.suwonudc.co.kr/"
LOTS = {"hwahong": "화홍문", "jangan": "장안동", "namsoo": "남수동", "yeonmudong": "연무동"}
DEST = Path(__file__).resolve().parents[1] / "data" / "parking.json"


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.hidden += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.hidden:
            self.hidden -= 1

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def parse(html):
    reader = Text()
    reader.feed(html)
    text = re.sub(r"\s+", " ", " ".join(reader.parts))
    spaces = []
    for lot_id, name in LOTS.items():
        pattern = re.escape(name) + r"\s*(?:(?:공영주차장|주차장|공영)\s*){0,4}" + r"([0-9][0-9,]*)\s*대\s*가능\s*/\s*([0-9][0-9,]*)\s*면"
        match = re.search(pattern, text)
        if match:
            free = int(match[1].replace(",", ""))
            capacity = int(match[2].replace(",", ""))
            if 0 <= free <= capacity <= 10000 and capacity > 0:
                spaces.append({"id": lot_id, "free": free, "capacity": capacity})
    return spaces


def main():
    try:
        request = urllib.request.Request(URL, headers={
            "User-Agent": "Mozilla/5.0 ParkingFlow/1.0 public-website-prototype",
            "Accept-Language": "ko-KR,ko;q=0.9",
        })
        with urllib.request.urlopen(request, timeout=20) as response:
            html = response.read(4000000).decode(response.headers.get_content_charset() or "utf-8", errors="replace")
        spaces = parse(html)
        if not spaces:
            raise ValueError("No verified public occupancy figures in the returned HTML")
        result = {
            "status": "ok",
            "source": "수원도시공사 공개 주차현황",
            "sourceUrl": URL,
            "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "spaces": spaces,
            "collectionMethod": "public-website-snapshot",
        }
        print("Collected verified parking locations:", len(spaces))
    except Exception as error:
        print("Collection unavailable:", error, file=sys.stderr)
        result = {
            "status": "unavailable",
            "source": "수원도시공사 공개 주차현황",
            "sourceUrl": URL,
            "updatedAt": None,
            "spaces": [],
            "message": "최신 주차 데이터를 수집하지 못했습니다. 공식 홈페이지에서 확인해 주세요.",
        }
    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

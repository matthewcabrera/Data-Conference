#!/usr/bin/env python3
"""Archive Pudding page source (HTML/CSS/JS/data/media) for local study.

Usage:
  python analysis/archive_pudding_pages.py \
    --url https://pudding.cool/2025/11/democracy/ \
    --url https://pudding.cool/2019/04/eu-regions/ \
    --out research/pudding
"""

from __future__ import annotations

import argparse
import json
import re
import time
from collections import deque
from pathlib import Path
from urllib.parse import unquote, urldefrag, urljoin, urlparse
from urllib.request import Request, urlopen

HTML_URL_RE = re.compile(r"""(?:href|src)=["']([^"']+)["']""", re.IGNORECASE)
SRCSET_RE = re.compile(r"""srcset=["']([^"']+)["']""", re.IGNORECASE)
CSS_URL_RE = re.compile(r"""url\(([^)]+)\)""", re.IGNORECASE)

# Captures quoted paths that look like assets in JS/CSS/HTML text.
ASSET_STR_RE = re.compile(
    r"""["']([^"'\\]+\.(?:js|css|json|csv|tsv|txt|svg|png|jpg|jpeg|webp|gif|ico|woff|woff2|ttf|otf|mp3|mp4|webm|wasm)(?:\?[^"']*)?)["']""",
    re.IGNORECASE,
)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)

TEXT_TYPES = (
    "text/html",
    "text/css",
    "application/javascript",
    "text/javascript",
    "application/x-javascript",
    "application/json",
    "text/plain",
)


def slug_from_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    if not path:
        return "root"
    return path.replace("/", "-")


def norm_candidate(raw: str) -> str | None:
    candidate = raw.strip().strip('"').strip("'")
    if not candidate:
        return None
    if candidate.startswith(("data:", "mailto:", "javascript:", "#")):
        return None
    return candidate


def to_local_path(page_dir: Path, full_url: str) -> Path:
    parsed = urlparse(full_url)
    rel = unquote(parsed.path.lstrip("/"))
    if not rel or parsed.path.endswith("/"):
        rel = f"{rel}index.html" if rel else "index.html"

    rel_path = Path(rel)
    if parsed.query:
        safe_q = re.sub(r"[^A-Za-z0-9._-]+", "_", parsed.query)
        rel_path = rel_path.with_name(f"{rel_path.name}__q_{safe_q}")
    return page_dir / rel_path


def extract_urls(text: str, base_url: str) -> list[str]:
    raw_urls: list[str] = []

    raw_urls.extend(HTML_URL_RE.findall(text))
    raw_urls.extend(ASSET_STR_RE.findall(text))
    raw_urls.extend(CSS_URL_RE.findall(text))

    for srcset_blob in SRCSET_RE.findall(text):
        for piece in srcset_blob.split(","):
            token = piece.strip().split(" ")[0]
            if token:
                raw_urls.append(token)

    normalized: list[str] = []
    seen: set[str] = set()
    for raw in raw_urls:
        cand = norm_candidate(raw)
        if not cand:
            continue
        absolute = urldefrag(urljoin(base_url, cand)).url
        parsed = urlparse(absolute)
        if parsed.scheme not in ("http", "https"):
            continue
        if absolute not in seen:
            seen.add(absolute)
            normalized.append(absolute)
    return normalized


def should_parse_as_text(content_type: str, local_path: Path) -> bool:
    ct = content_type.split(";")[0].strip().lower()
    if any(ct.startswith(t) for t in TEXT_TYPES):
        return True
    suffix = local_path.suffix.lower()
    return suffix in {".html", ".css", ".js", ".mjs", ".json", ".txt"}


def in_scope(path: str, allowed_prefixes: list[str]) -> bool:
    for prefix in allowed_prefixes:
        if path.startswith(prefix):
            return True
    return False


def archive_page(url: str, out_root: Path, max_files: int) -> dict:
    parsed_root = urlparse(url)
    root_host = parsed_root.netloc
    page_slug = slug_from_url(url)
    page_dir = out_root / page_slug
    page_dir.mkdir(parents=True, exist_ok=True)

    base_path = parsed_root.path if parsed_root.path.endswith("/") else f"{parsed_root.path}/"
    allowed_prefixes = [base_path, "/_app/", "/assets/", "/common/"]

    queue = deque([url])
    seen: set[str] = set()
    archived: list[dict] = []
    skipped_external: list[str] = []
    failures: list[dict] = []

    while queue and len(archived) < max_files:
        cur = queue.popleft()
        if cur in seen:
            continue
        seen.add(cur)

        try:
            req = Request(cur, headers={"User-Agent": USER_AGENT})
            with urlopen(req, timeout=30) as resp:
                data = resp.read()
                content_type = resp.headers.get("Content-Type", "")
                final_url = resp.geturl()
        except Exception as exc:  # noqa: BLE001
            failures.append({"url": cur, "error": str(exc)})
            continue

        local_path = to_local_path(page_dir, final_url)
        local_path.parent.mkdir(parents=True, exist_ok=True)
        local_path.write_bytes(data)

        archived.append(
            {
                "url": final_url,
                "content_type": content_type,
                "path": str(local_path.relative_to(page_dir)),
                "bytes": len(data),
            }
        )

        if not should_parse_as_text(content_type, local_path):
            continue

        try:
            text = data.decode("utf-8", errors="ignore")
        except Exception:  # noqa: BLE001
            continue

        for nxt in extract_urls(text, final_url):
            nxt_host = urlparse(nxt).netloc
            if nxt_host != root_host:
                skipped_external.append(nxt)
                continue
            nxt_path = urlparse(nxt).path
            if not in_scope(nxt_path, allowed_prefixes):
                continue
            if nxt not in seen:
                queue.append(nxt)

        time.sleep(0.02)

    manifest = {
        "root_url": url,
        "allowed_prefixes": allowed_prefixes,
        "archived_count": len(archived),
        "max_files": max_files,
        "archived": archived,
        "failures": failures,
        "skipped_external_count": len(set(skipped_external)),
        "skipped_external_examples": sorted(set(skipped_external))[:30],
    }
    (page_dir / "_archive_manifest.json").write_text(json.dumps(manifest, indent=2))
    return {"slug": page_slug, **manifest}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", action="append", required=True, help="Page URL to archive")
    parser.add_argument("--out", default="research/pudding", help="Output directory")
    parser.add_argument("--max-files", type=int, default=1200, help="Per-page file cap")
    args = parser.parse_args()

    out_root = Path(args.out)
    out_root.mkdir(parents=True, exist_ok=True)

    report = {
        "generated_at_unix": int(time.time()),
        "pages": [archive_page(u, out_root, args.max_files) for u in args.url],
    }
    report_path = out_root / "_archive_report.json"
    report_path.write_text(json.dumps(report, indent=2))
    print(f"Wrote {report_path}")
    for page in report["pages"]:
        print(f"{page['slug']}: archived {page['archived_count']} files")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Troop 134 - Update Site
=======================
Run this after you add, rename or remove photo album folders, or after you edit
data/events.txt. It rebuilds two small files the website reads:

  data/albums.js  - the list of photo albums, built from the folders in images/albums/
  data/events.js  - a copy of data/events.txt, so the site also works when you
                    open index.html by double-clicking it

How to run it:
  Mac:      double-click "Update Site (Mac).command"
  Windows:  double-click "Update Site (Windows).bat"
  Anyone:   python3 update-site.py

Uses only standard Python 3. Nothing to install.
"""
import json, os, re, sys, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
ALBUMS_DIR = os.path.join(ROOT, "images", "albums")
EVENTS_TXT = os.path.join(ROOT, "data", "events.txt")
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
TYPES = {"campout", "hike", "backpacking", "service", "court-of-honor", "fundraiser", "special"}
BIG_FILE = 2 * 1024 * 1024
warnings = []


# ---------------- Events ----------------
def parse_date(s):
    s = s.strip()
    m = re.fullmatch(r"(\d{4})-(\d{1,2})-(\d{1,2})", s)
    if m:
        y, mo, d = map(int, m.groups())
    else:
        m = re.fullmatch(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
        if not m:
            return None
        mo, d, y = map(int, m.groups())
    try:
        return datetime.date(y, mo, d).isoformat()
    except ValueError:
        return None


def parse_events(text):
    events = []
    blocks = re.split(r"\n\s*\n", text.replace("\r\n", "\n").replace("\r", "\n"))
    for n, block in enumerate(blocks, 1):
        fields = {}
        for line in block.split("\n"):
            line = line.strip()
            if not line or line.startswith("#") or ":" not in line:
                continue
            key, val = line.split(":", 1)
            key = re.sub(r"[^a-z]", "", key.lower())
            fields[key] = val.strip()
        if not fields:
            continue
        title = fields.get("title", "")
        date = fields.get("date") or fields.get("dates", "")
        if not title or not date:
            warnings.append(f"Event block {n} was skipped: it needs both a Title: line and a Date: line.")
            continue
        parts = re.split(r"\s+(?:to|through|thru)\s+|\s+[-–—]\s+|\s*–\s*", date, flags=re.I)
        start = parse_date(parts[0])
        end = parse_date(parts[1]) if len(parts) > 1 else start
        if not start or not end:
            warnings.append(f'"{title}" was skipped: the date "{date}" was not understood. Use 2026-10-16 or 10/16/2026.')
            continue
        if end < start:
            start, end = end, start
        typ = re.sub(r"\s+", "-", fields.get("type", "special").strip().lower()) or "special"
        if typ not in TYPES:
            warnings.append(f'"{title}": type "{fields.get("type")}" is not one of the known types, so it shows as Special Event.')
            typ = "special"
        ev = {"title": title, "type": typ, "start": start, "end": end,
              "location": fields.get("location") or fields.get("where", ""),
              "summary": fields.get("details") or fields.get("summary") or fields.get("description", ""),
              "signupUrl": fields.get("signup") or fields.get("signupurl", "")}
        if fields.get("time"):
            ev["time"] = fields["time"]
        events.append(ev)
    events.sort(key=lambda e: e["start"])
    return events


# ---------------- Albums ----------------
def album_from_folder(name):
    m = re.match(r"^(\d{4})-(\d{2})\s+(.+)$", name)
    if m:
        return m.group(3).strip(), f"{m.group(1)}-{m.group(2)}"
    m = re.match(r"^(\d{4})\s+(.+)$", name)
    if m:
        return m.group(2).strip(), m.group(1)
    return name, ""


def build_albums():
    albums = []
    if not os.path.isdir(ALBUMS_DIR):
        warnings.append("No images/albums folder found.")
        return albums
    for folder in sorted(os.listdir(ALBUMS_DIR)):
        path = os.path.join(ALBUMS_DIR, folder)
        if folder.startswith(".") or not os.path.isdir(path):
            continue
        photos = sorted(f for f in os.listdir(path)
                        if not f.startswith(".") and os.path.splitext(f)[1].lower() in IMAGE_EXT)
        if not photos:
            warnings.append(f'Album folder "{folder}" has no photos, so it is not shown.')
            continue
        for f in photos:
            if os.path.getsize(os.path.join(path, f)) > BIG_FILE:
                warnings.append(f'"{folder}/{f}" is over 2 MB. Smaller photos load faster on phones.')
        cover = next((f for f in photos if os.path.splitext(f)[0].lower() == "cover"), photos[0])
        photos = [cover] + [f for f in photos if f != cover]
        title, date = album_from_folder(folder)
        base = "images/albums/" + folder + "/"
        albums.append({"title": title, "date": date, "folder": folder,
                       "cover": base + cover, "photos": [base + f for f in photos]})
    dated = sorted([a for a in albums if a["date"]], key=lambda a: a["date"], reverse=True)
    undated = sorted([a for a in albums if not a["date"]], key=lambda a: a["title"].lower())
    return dated + undated


def write_js(path, var, data, note):
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"/* {note}\n   Made by update-site.py on {datetime.datetime.now():%Y-%m-%d %H:%M}. Do not edit by hand. */\n")
        f.write(f"window.{var} = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n")


def main():
    events = []
    if os.path.exists(EVENTS_TXT):
        with open(EVENTS_TXT, encoding="utf-8-sig") as f:
            events = parse_events(f.read())
    else:
        warnings.append("data/events.txt was not found.")
    write_js(os.path.join(ROOT, "data", "events.js"), "SITE_EVENTS", events,
             "Copy of data/events.txt for when the site is opened by double-clicking. Edit events.txt instead.")
    albums = build_albums()
    write_js(os.path.join(ROOT, "data", "albums.js"), "SITE_ALBUMS", albums,
             "Photo albums, one per folder in images/albums/. Add or rename folders instead of editing this.")

    print("Troop 134 site updated.\n")
    print(f"  Events: {len(events)} read from data/events.txt")
    print(f"  Albums: {len(albums)}")
    for a in albums:
        print(f"    - {a['title']}" + (f" ({a['date']})" if a['date'] else "") + f": {len(a['photos'])} photo(s)")
    if warnings:
        print("\nPlease check:")
        for w in warnings:
            print("  ! " + w)
    print("\nNext: upload the whole site folder (or at least data/ and images/albums/) to the web host.")


if __name__ == "__main__":
    main()
    if len(sys.argv) < 2 or sys.argv[1] != "--no-pause":
        if os.name == "nt" or sys.stdin.isatty():
            try:
                input("\nPress Enter to close.")
            except EOFError:
                pass

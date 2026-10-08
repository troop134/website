#!/bin/bash
# Double-click to rebuild the photo albums and events for the Troop 134 website.
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
  python3 update-site.py
else
  echo "Python 3 is needed. macOS will offer to install it, or get it from https://www.python.org/downloads/"
  read -r -p "Press Enter to close."
fi

import parth_dl
import sys
import json

try:
    info = parth_dl.get_info("https://www.instagram.com/reel/C7X-g14oX6D/")
    print(json.dumps(info, indent=2))
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)

import os, sys, json, base64, urllib.request

KEY = os.environ["OPENROUTER_API_KEY"]
MODEL = os.environ.get("OR_MODEL", "google/gemini-2.5-flash-image")
prompt = sys.argv[1]
outpath = sys.argv[2]

body = {
    "model": MODEL,
    "messages": [{"role": "user", "content": prompt}],
    "modalities": ["image", "text"],
}
req = urllib.request.Request(
    "https://openrouter.ai/api/v1/chat/completions",
    data=json.dumps(body).encode(),
    headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
)
try:
    data = json.load(urllib.request.urlopen(req, timeout=180))
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode()[:400]); sys.exit(1)

msg = data.get("choices", [{}])[0].get("message", {})
imgs = msg.get("images") or []
if not imgs:
    print("NO IMAGE:", json.dumps(data)[:400]); sys.exit(1)
url = imgs[0].get("image_url", {}).get("url", "")
if url.startswith("data:"):
    b64 = url.split(",", 1)[1]
    with open(outpath, "wb") as f:
        f.write(base64.b64decode(b64))
    print("SAVED", outpath, os.path.getsize(outpath), "bytes | model", MODEL)
else:
    print("unexpected url:", url[:120]); sys.exit(1)

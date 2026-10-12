# Environment setup — Setup script & Environment variables

What goes in the two fields under **Edit environment** for
`env_013YXBzruKVM6FMLbFQmLmKQ`. The old Setup script was full of prose, bare
URLs, and code snippets, which each crashed the boot with exit 127. These are
the correct, minimal replacements.

Golden rule: **the Setup script field runs shell commands only** — one command
per line. No prose, no bare URLs, no Python, no JSON. Secrets go in the
**Environment variables** field, never in the setup script.

---

## 1. Setup script (paste into the "Setup script" box)

Minimal and guarded — every step is wrapped so a failure can never crash the
session boot. It just makes the frontend ready to build and test.

```sh
#!/usr/bin/env bash
# Install frontend dependencies so build/test/lint work in web sessions.
# Guarded with || true so a hiccup never fails the boot.
if command -v pnpm >/dev/null 2>&1 && [ -f src/frontend/package.json ]; then
  (cd src/frontend && pnpm install --frozen-lockfile) || true
fi
```

If you want the absolute safest option to just get sessions running again,
**an empty box is also valid** — leave it blank and the session boots with
defaults. Add the block above once you've confirmed boots are working.

---

## 2. Environment variables (paste into the "Environment variables" box)

These are the variable **names the project's own scripts actually read**. Fill
in each value after the `=`. One per line, no spaces around the `=`, no quotes
needed.

```
OPENROUTER_API_KEY=
ELEVENLABS_API=
MONID_API_KEY=
ITCH_API_KEY=
```

Notes on these four:
- **OPENROUTER_API_KEY** — the important one. Model-council, the gauntlet, and
  image generation all read it.
- **ELEVENLABS_API** — the transcription key. Note the name is `ELEVENLABS_API`
  (not `..._API_KEY`); the `_API_KEY` variant lacks speech-to-text permission,
  so use this exact name.
- **MONID_API_KEY**, **ITCH_API_KEY** — used by the research and itch scripts.

### Optional extras (only if you actually use these integrations)

The project code does not reference these yet, so they're optional. Add any you
want available:

```
TRIPO_API_KEY=
POSTHOG_PERSONAL_API_KEY=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
XAI_API_KEY=
POLYGRES_API_KEY=
POLYGRES_RUNTIME_URL=
```

---

## 3. Where the rest of what you pasted actually goes

Nothing is lost — it was just in the wrong field:

- **MCP servers** (pixellab, monid, clipy, treg) → these are **Connectors**,
  added in the connectors UI, not the setup script. `claude mcp add …` lines do
  not belong in the environment boot.
- **Skills** (polygres, monid, treg) and any prose ("set up …", "you have
  access to …", "install the … skill") → those are things you tell Claude in a
  chat message, not the environment.
- **Model names** (`moonshotai/kimi-k3`, `grok-4.5`) → these are values you pass
  inside a request; they are not commands or variables.

---

## 4. Security

Some keys in the old script looked only partly masked. Because they sat in a
plaintext script, **rotate any real, complete keys** — regenerate them at each
provider (OpenRouter, xAI, Cloudflare, etc.). Then put the fresh values in the
Environment variables field above, which is the field designed to hold secrets.

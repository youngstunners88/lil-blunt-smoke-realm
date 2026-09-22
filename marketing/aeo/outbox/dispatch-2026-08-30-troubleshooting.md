# Caffeine dispatch — troubleshooting page

Send this **after** `dispatch-2026-08-29.md` has deployed and been verified.

## Why it is separate

The page is substantial and it is the one change that can fail in a specific,
detectable way: if Caffeine builds it as a client-side React route rather than
a real static file, it will answer 200 while returning the app shell. A crawler
then sees a duplicate homepage, not a document, and the page does not exist for
indexing purposes. `crawl_gate.py` detects exactly this.

The full page is inlined below because Caffeine has no access to the git
repository — a dispatch that points at a repo path will quietly do nothing.

## The dispatch

```
Add a new page at /troubleshooting/ on the site.

CRITICAL: it must be served as a real static HTML file, the same way /about/
and /how-to-play/ are served. Do NOT add it as a React Router route and do NOT
let the single-page-app fallback serve it. Fetching https://www.smokegame.win/troubleshooting/
directly must return the HTML below, not the homepage shell.

Then:
- add https://www.smokegame.win/troubleshooting/ to sitemap.xml
- add a link to /troubleshooting/ from the about, docs and how-to-play pages
- add it to the link list in llms.txt, described as "fixes for a black screen,
  unresponsive controls, missing sound, and low frame rate"

Do not change anything else. Do not convert the site to SSR or SSG, do not add
npm packages, and do not touch the game canvas.

The exact file content:

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Troubleshooting — Lil Blunt: The Smoke Realm</title>
    <meta name="description" content="Fixes for common problems playing Lil Blunt: The Smoke Realm in a browser — black screen, controls not responding, no sound, slow frame rate, and the game not loading." />
    <link rel="canonical" href="https://www.smokegame.win/troubleshooting/" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:title" content="Troubleshooting — Lil Blunt: The Smoke Realm" />
    <meta property="og:description" content="Fixes for a black screen, unresponsive controls, missing sound, and slow frame rate." />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://www.smokegame.win/troubleshooting/" />
    <meta property="og:image" content="https://www.smokegame.win/assets/brand/lil-blunt/lil-blunt-logo.jpeg" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0; padding: 3rem 1.25rem 4rem;
        background: #0b0f19; color: #e6e9f0;
        font: 16px/1.7 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      main { max-width: 46rem; margin: 0 auto; }
      h1 { font-size: 2rem; line-height: 1.2; margin: 0 0 .5rem; color: #fff; }
      h2 { font-size: 1.25rem; margin: 2.5rem 0 .75rem; color: #7dd3a0; }
      p, li { color: #c3c9d6; }
      a { color: #6fd3e8; }
      .lede { font-size: 1.1rem; color: #dfe4ee; }
      .bluf { border-left: 3px solid #1c9c6b; padding: .25rem 0 .25rem 1rem;
              margin: .5rem 0 1rem; color: #dfe4ee; }
      nav.crumbs { margin-bottom: 2rem; font-size: .875rem; }
      table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
      th, td { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid #232838; }
      th { color: #9aa3b5; font-size: .8125rem; text-transform: uppercase;
           letter-spacing: .06em; }
      code { background: #151a28; padding: .1rem .35rem; border-radius: .25rem;
             font-size: .9em; }
      footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid #232838;
               font-size: .8125rem; color: #8891a5; }
    </style>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Why is the screen black when I open Lil Blunt: The Smoke Realm?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A black canvas almost always means the game engine did not start. Lil Blunt: The Smoke Realm is a Godot 4 game exported to HTML5, and it needs WebGL2 plus SharedArrayBuffer. SharedArrayBuffer is only available when the page is served with the Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers, so opening the exported files directly from disk will not work. Reload the page with a hard refresh first, since a partially cached build produces the same symptom."
          }
        },
        {
          "@type": "Question",
          "name": "The character will not move. Are the controls broken?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The arrow keys are not bound in the current build, so pressing them does nothing. Move with A and D, jump with W or the spacebar, attack with J, and dash with K. This is the single most common reason a first-time player thinks the game is broken. The game must also have keyboard focus, so click once on the game area before pressing anything."
          }
        },
        {
          "@type": "Question",
          "name": "Why is there no sound?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Browsers block audio until the page receives a user interaction. Click anywhere on the page and the music starts. If it still does not, check that the browser tab is not muted, which is a separate setting from system volume in Chrome and Firefox."
          }
        },
        {
          "@type": "Question",
          "name": "Why is the frame rate low?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A low frame rate usually means the browser fell back to a software renderer instead of using the GPU. Check that hardware acceleration is enabled in the browser settings. In Chrome, visit chrome://gpu to see whether WebGL is hardware accelerated. Closing other tabs also helps, since a browser under memory pressure will throttle a background-heavy page."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need a crypto wallet or an account to play?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Lil Blunt: The Smoke Realm is free and starts in the browser with no wallet, no browser extension, no download, and no account. The site is hosted on the Internet Computer, but playing does not require any blockchain interaction."
          }
        },
        {
          "@type": "Question",
          "name": "Does it work on a phone?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The game is built around keyboard input, so it is designed for a desktop or laptop browser. There are no on-screen touch controls in the current build, which means a phone can load the page but cannot play the game properly."
          }
        }
      ]
    }
    </script>
  </head>
  <body>
    <main>
      <nav class="crumbs"><a href="/">Lil Blunt: The Smoke Realm</a> → Troubleshooting</nav>

      <h1>Troubleshooting</h1>
      <p class="lede">
        Fixes for the problems people actually hit when opening
        Lil Blunt: The Smoke Realm. Each entry says what the symptom means
        before it says what to do, because the same symptom can have more than
        one cause.
      </p>

      <h2>The screen is black</h2>
      <p class="bluf">
        A black canvas means the engine did not start, not that the game
        crashed.
      </p>
      <p>
        The game is a Godot 4 project exported to HTML5. It requires WebGL2 and
        <code>SharedArrayBuffer</code>. <code>SharedArrayBuffer</code> is only
        exposed to a page served with cross-origin isolation headers
        (<code>Cross-Origin-Opener-Policy: same-origin</code> and
        <code>Cross-Origin-Embedder-Policy: require-corp</code>), which is why
        opening an exported build from your own disk shows a black screen even
        though nothing is wrong with the files.
      </p>
      <p>
        On <a href="https://www.smokegame.win/">smokegame.win</a> those headers
        are already set. If the canvas is still black there, try a hard refresh
        (<code>Ctrl+Shift+R</code>, or <code>Cmd+Shift+R</code> on a Mac) — a
        partially cached build produces exactly this symptom. Opening the
        browser console will show a <code>SharedArrayBuffer is not defined</code>
        error when this is the cause.
      </p>

      <h2>The character will not move</h2>
      <p class="bluf">
        The arrow keys are not bound. Use A and D.
      </p>
      <p>
        This is the most common reason a first-time player concludes the game is
        broken. The full control set:
      </p>
      <table>
        <thead><tr><th>Action</th><th>Key</th></tr></thead>
        <tbody>
          <tr><td>Move left</td><td>A</td></tr>
          <tr><td>Move right</td><td>D</td></tr>
          <tr><td>Jump</td><td>W, or Spacebar</td></tr>
          <tr><td>Attack</td><td>J</td></tr>
          <tr><td>Dash</td><td>K</td></tr>
        </tbody>
      </table>
      <p>
        The game also needs keyboard focus. If you scrolled the page or clicked
        something else after loading, click once on the game area before
        pressing a key. There is no control remapping screen in the current
        build.
      </p>

      <h2>There is no sound</h2>
      <p class="bluf">
        Browsers block audio until you interact with the page. Click anywhere.
      </p>
      <p>
        Every major browser refuses to start audio before a page has received a
        genuine user gesture, so the music cannot begin on load. A single click
        anywhere on the page satisfies this.
      </p>
      <p>
        If it is still silent afterwards, check whether the browser tab itself
        is muted. In Chrome and Firefox a tab can be muted independently of
        system volume, and a muted tab gives no visual indication beyond a small
        icon on the tab.
      </p>

      <h2>The frame rate is low</h2>
      <p class="bluf">
        Low frame rate usually means the browser is rendering in software
        instead of on the GPU.
      </p>
      <p>
        In Chrome, open <code>chrome://gpu</code> and look at the WebGL line: if
        it reads software-only rather than hardware accelerated, the browser is
        not using the graphics card. Re-enabling hardware acceleration in
        browser settings normally resolves it.
      </p>
      <p>
        Closing other tabs also helps. A browser under memory pressure throttles
        pages, and a WebGL canvas is one of the first things to suffer.
      </p>

      <h2>The page loads but nothing appears</h2>
      <p>
        The build is roughly 200 MB of WebAssembly and assets, so on a slow
        connection there is a real wait before the first frame, with no
        progress indicator past a point. Give it a minute before concluding it
        has failed.
      </p>
      <p>
        Ad blockers and privacy extensions do not normally interfere, but an
        extension that blocks WebAssembly outright will prevent the game from
        starting. Testing in a private window with extensions disabled
        distinguishes that case quickly.
      </p>

      <h2>Do I need a wallet, an account, or a download?</h2>
      <p class="bluf">
        No to all three. The game is free and runs in the browser.
      </p>
      <p>
        There is no wallet, no browser extension, no download, and no account
        needed to start playing. The site is hosted on the Internet Computer, a
        public blockchain that can serve complete web applications, but playing
        the game does not involve any blockchain transaction on your part.
      </p>

      <h2>Does it work on a phone?</h2>
      <p>
        Not properly. The game is built around keyboard input and the current
        build has no on-screen touch controls, so a phone can load the page but
        cannot play. Use a desktop or laptop browser.
      </p>

      <footer>
        <p>
          Still stuck? The <a href="/how-to-play/">how to play</a> page covers
          controls and scoring, and <a href="/docs/">the docs</a> cover what the
          Internet Computer part actually does.
          <a href="https://www.smokegame.win/">Play the game →</a>
        </p>
      </footer>
    </main>
  </body>
</html>

```

## Verify

```bash
python3 marketing/aeo/crawl_gate.py
```

`/troubleshooting/` must read **yes** under "real page?". If it reads
"NO — SPA fallback", it was built as a client-side route: send a follow-up
saying so explicitly, asking for a static file served like /about/ is.

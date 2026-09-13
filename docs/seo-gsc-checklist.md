# Google Search Console — founder checklist

A step-by-step guide for the founder to register smokegame.win with Google,
submit the sitemap, and ask Google to index the pages. It assumes **no
technical background** — every step is something you click in a browser. It
takes about 20 minutes, plus waiting time that is out of anyone's hands.

Search Console is Google's free dashboard for site owners. It is the only place
that tells you the truth about whether Google has actually indexed your pages —
which is why the last section is blunt about **not** claiming you are "indexed"
until this dashboard says so.

---

## Before you start — one thing that must be true first

Google indexes what it sees at the **live** site. This project's live site is
published through **Caffeine**, and changes only go live when someone clicks
**"Go live"** there. If the latest SEO changes have not been pushed live in
Caffeine yet, Google will index the old page.

So: **make sure the site has been taken live in Caffeine first.** If you are not
sure, ask whoever manages the Caffeine project. Everything below still works
either way — but you want Google reading the current page, not last month's.

You will also need:

- A **Google account** (a normal Gmail account is fine).
- Access to your **domain's DNS settings** — the control panel at whoever you
  bought `smokegame.win` from (e.g. Namecheap, GoDaddy, Cloudflare). This is the
  most reliable way to prove you own the site. If you cannot get into DNS, there
  is a fallback in step 2.

---

## Step 1 — Open Search Console and add the property

1. Go to **https://search.google.com/search-console** and sign in with your
   Google account.
2. Click **"Add property"** (top-left dropdown, then "+ Add property").
3. You are offered two boxes. Choose the **left one, "Domain."**
   - Type `smokegame.win` (no `https://`, no `www`).
   - The Domain type covers `www`, non-`www`, and `https`/`http` all at once, so
     you only set this up once. This matters here because the site's canonical
     address is `https://www.smokegame.win/` but people link to both forms.
4. Click **Continue.**

## Step 2 — Prove you own the site

Google shows you a **TXT record** to add to your DNS. It looks like a long
string starting `google-site-verification=...`.

1. Copy that string.
2. In another tab, log in to your domain registrar (where you bought
   `smokegame.win`) and open its **DNS settings**.
3. Add a new record:
   - **Type:** TXT
   - **Host / Name:** `@` (this means the domain itself; some registrars want it
     blank instead — either is fine)
   - **Value / Content:** paste the `google-site-verification=...` string
   - **TTL:** leave the default
4. Save it.
5. Back in Search Console, click **Verify.**

DNS changes can take anywhere from a few minutes to a few hours to spread. If
Verify fails immediately, wait an hour and click Verify again — the record is
often just not visible to Google yet. Do not delete the TXT record afterward;
Google re-checks it periodically.

**Fallback if you cannot reach DNS:** go back and pick the right-hand **"URL
prefix"** box instead, enter `https://www.smokegame.win/`, and use the **"HTML
tag"** method — it gives you a `<meta>` tag. That tag has to be added to the
site's `<head>`, which is a change that goes through Caffeine, so it is slower
and needs the person who manages the build. The DNS method above avoids that,
which is why it is the recommended path.

## Step 3 — Submit the sitemap

The sitemap is a list of the pages you want Google to know about. It already
exists at `https://www.smokegame.win/sitemap.xml`.

1. In Search Console's left menu, click **Sitemaps.**
2. In "Add a new sitemap," type `sitemap.xml` and click **Submit.**
3. It should show **"Success"** within a minute or two. If it says "Couldn't
   fetch," wait a few minutes and refresh — a freshly verified property
   sometimes needs a moment. A persistent "Couldn't fetch" means the sitemap URL
   is not reachable; confirm the site is live (see the top of this page).

## Step 4 — Ask Google to index the key pages

Submitting a sitemap invites Google to crawl. You can also nudge individual
pages to the front of the queue.

1. At the very top of Search Console there is a search bar that says **"Inspect
   any URL."** Paste a full page URL into it and press Enter. Do this for each of
   these, one at a time:
   - `https://www.smokegame.win/`
   - `https://www.smokegame.win/about/`
   - `https://www.smokegame.win/how-to-play/`
   - `https://www.smokegame.win/faq/controls/`
   - `https://www.smokegame.win/faq/wallet/`
   - `https://www.smokegame.win/faq/not-the-artist/`
2. For each one, after it finishes checking, click **"Request indexing."**
3. You will hit a daily limit (Google allows only a handful of manual requests
   per day). That is fine — the sitemap already covers all of them. The manual
   request just moves your most important pages up the queue.

## Step 5 — Wait, then check back honestly

Indexing is **not instant and not guaranteed.** New sites commonly take days to
a few weeks before pages appear in search, and Google may choose not to index
some pages at all. Nothing you or anyone else does forces it faster.

Come back to Search Console after about a week and check:

- **Pages** (left menu) → how many are "Indexed" vs "Not indexed," with reasons.
- **Performance** → whether the site is getting any impressions in search yet.
- Re-inspect a URL (step 4) → it will say **"URL is on Google"** once indexed.

---

## The honest part — do not claim what you cannot see

It is tempting to say "we're indexed on Google" as soon as the sitemap submits.
**Do not.** Submitting a sitemap and requesting indexing are *requests*, not
results. The only proof that a page is indexed is Search Console showing it as
**"URL is on Google"** (or the page appearing when you search
`site:smokegame.win` on Google).

Until the dashboard says so, the accurate statement is: "the sitemap is
submitted and indexing is requested; indexation is pending." That is not
pessimism — it is the same standard the rest of this project holds itself to:
claim only what is measured. When Search Console shows the pages as indexed, then
you can say the site is indexed, and point to the dashboard as the evidence.

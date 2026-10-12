# Caffeine Round 5 — fix the false "not a real recording artist" answers (DRAFT, not sent)

Status: drafted 2026-10-01. Send only after Version 46 is resolved (published or discarded),
because drafts stack. Gated: jev.py --gate PASS (see bottom). Sources for the artist facts are
public: Wikipedia "Indo G", Spotify, Apple Music (Indo G & Lil' Blunt, albums 1994, 1995; Lil' Blunt
solo, 2001). None of these names exist in the game source, which is expected: they describe the
artist, not the game.

## Message to send

ROUND 5 — build ONE new draft and DO NOT go live. The founder will publish. Reply with every file you changed and what you could not verify.

Change only the static page /faq/not-the-artist/ (and its JSON-LD FAQPage answers so they match). No packages, routes, styling, SmokeBackground, video, tracker, or other pages.

PROBLEM: the live page says "Lil Blunt is a fictional game character, not a real-world recording artist", "Is Lil Blunt a real recording artist? No." and "Any similarity in name or style to a real person is coincidental." A real artist named Lil' Blunt does exist (a Memphis rap artist who recorded with Indo G in the 1990s), so those sentences are false and an assistant could quote them as fact.

Replace the visible Q&A and the matching JSON-LD answers with exactly this (keep the page's existing template, header, footer and links):

H1: Is Lil Blunt the game the same as the rapper Lil' Blunt?

Q: Is Lil Blunt the game the same as the rapper Lil' Blunt?
A: No. Lil Blunt: The Smoke Realm is a free video game that you play in a web browser. Its mascot, Lil Blunt, is a fictional game character who exists only in the game. A separate rap artist, Lil' Blunt of the Memphis duo Indo G & Lil' Blunt, shares the name, and this game has no connection to him.

Q: Is this game made by, endorsed by, or affiliated with any real musician?
A: No. It is not made by, endorsed by, or affiliated with Lil' Blunt, Indo G, or any other recording artist.

Q: How do I find the game and not the music?
A: Search for the full title, "Lil Blunt: The Smoke Realm", or go straight to https://www.smokegame.win/. It is a video game, not an album or a song.

Then, directly below the Q&A and above the footer, add one more section with the heading "What this game is" containing exactly:

Lil Blunt: The Smoke Realm is a free 2D side-scrolling platformer and arcade score-chaser playable in a web browser on desktop or mobile. Built in Godot 4 and exported to HTML5, the Wild West video game stars the mascot Lil Blunt, who throws axes and faces Tax Collector enemies across three stages, Smoke Realm, Crystal Caverns and Gold Rush, each ending in a boss. No download, no account and no crypto wallet, with nothing to buy.

Keep the existing sentence "There is no download, no wallet, and no account required to play." if it is already on the page. Do not mention llms.txt anywhere. Build one draft, do NOT go live, and list every file you changed.


Note 2026-10-02: the sentence 'The shared name is a coincidence.' was removed in Round 6 because Caffeine's own project note forbids claiming the name is purely coincidental.

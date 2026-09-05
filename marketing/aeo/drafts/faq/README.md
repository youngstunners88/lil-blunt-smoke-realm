# Held FAQ draft — `free.html`

`wallet.html` was rewritten to documentation-grade (dense reference prose about
what the Internet Computer is and why no wallet is needed) and shipped to
`src/frontend/public/faq/wallet/`.

`free.html` is held and NOT shipped, deliberately. Two reasons:
1. It sits at the quality gate's boundary and leans slightly spam-grade — "is it
   free" is inherently a short promotional claim that resists documentation
   register.
2. It is duplicative: `/how-to-play/` already answers "Is Lil Blunt: The Smoke
   Realm free to play?" in its FAQPage JSON-LD, so a standalone page adds a
   near-identical answer at a second URL.

Ship it only if it can be made to pass the gate on its own merit AND a reason
emerges for a standalone URL that `/how-to-play/` does not already serve.

# Held FAQ drafts — need documentation-grade rewrite

`free.html` and `wallet.html` are accurate and useful, but
`quality_gate.py` rates them **ambiguous** (gap 0.002–0.004) rather than
documentation-grade. Investigation showed this is a thin-corpus limitation:
the "good" corpus contains a controls-style sample, so the controls FAQ passes
cleanly, but these two have no near-neighbor to be judged against.

Do not ship them until either (a) they are rewritten to pass the gate on their
own merit, or (b) the `corpus/good/` set is expanded with genuine external
documentation on "free to play" and "no-wallet Web3" topics (real sources, not
these pages — never seed the corpus with the thing you are grading).

---
name: rapid-assessment
description: Establish what is actually true about this project right now in one command — production versus repo, phantom pages, unshipped work, stale measurement, live accuracy violations. Use at the start of any session, before claiming progress, when asked "are we better off / where do we stand / what changed", before planning work, and after any Caffeine dispatch. Also covers how to verify a claim on this host, where the standard checks give false passes, and how to find new places cheap semantic judgment would pay off.
---

# Rapid assessment — what is actually true

```bash
python3 marketing/aeo/assess.py            # full, ~60s
python3 marketing/aeo/assess.py --quick    # no Jev calls, ~20s
```

Exit code is the number of RED findings, so it gates a routine. **Run it before
answering any question about project status, and before planning work.**

## The one fact everything else follows from

**This repo is not the product.** Caffeine builds from its own copy and ships
only on a manual click. A green repo, a clean build, a pushed commit — none of
them are evidence about what users and crawlers see. *Committed is never live.*

So every check runs against production and compares it to the repo. The gap
between them is where this project loses most of its time.

## Verification on this host: two methods that fail silently

Getting this wrong has cost this project real work, twice, in opposite
directions. The ICP boundary node makes the obvious checks useless:

| Method | Verdict |
|---|---|
| **Byte size** | **Useless.** 9KB and 127KB responses are both real documents. |
| **`<title>`** | **Useless.** Every path returns the homepage title. |
| **Grep for a topic keyword** | **Worse than useless — it fails silently.** |
| **Compare `<h1>` to the homepage's `<h1>`** | **Works.** |

The keyword failure is the one to internalise. The homepage is a long SPA page
that already contains "burst dash", "no wallet" and "music artist". Grepping
`/faq/controls/` for "burst dash" therefore **matched the homepage being served
in its place** and passed a phantom as healthy. An audit built on that method
reported 2 phantoms; the real number was 5, and it had also wrongly condemned a
page that was fine.

**A phantom IS the homepage, so it cannot carry another page's `<h1>`.** That
is the whole test, it needs no maintained marker list, and the marker list is
exactly what produced the bad audit.

It also separates two problems that look identical from a browser:

```
phantom   served h1 == homepage h1   the page does not exist
drift     served h1 != repo h1       it exists, but Caffeine's copy is stale
```

## What "progress" means here, and does not

`blind-spots` names this project's recurring failure as **mistaking output for
progress**. The assessment is built to make that impossible to miss:

- **Repo commits are AMBER, never green.** Work that has not shipped has not
  happened, however good it is.
- **Stale measurement is RED.** `probe.py` is the only instrument that says
  whether AEO work did anything. A scoreboard nobody has run in two weeks means
  every claim since is unverified. Re-probe before concluding anything worked.
- **Live accuracy violations are RED even when the repo is clean.** The fix
  landing in git does not remove the false claim from the page a reader sees.

## Finding new leverage — the jevify method

Adapted from `github.com/ryana/jevify`, which is a prompt rather than code. Its
framing: **treat language understanding as a routine computational operation.**
The question to ask periodically:

> If many useful semantic judgments were affordable inside our response-time
> budget, what would we design differently?

Hunt for these six patterns in the repo. Each is a place cheap typed judgment
replaces something worse:

1. **Generating text only to parse it into a decision.** `probe.py` still asks
   models for prose plus a fenced JSON block and runs a balanced-brace scanner
   over the reply. That is a decision wearing a generation costume.
2. **Brittle rules standing in for semantic understanding.** `crawl_gate.py`'s
   sentinel matching, and the keyword-grep phantom check that failed above.
3. **Sampling or manual review where full coverage was unaffordable.** Every
   accuracy review on this project was a human reading carefully; three false
   claims still shipped.
4. **Repeatedly processing the same context.** A battery evaluates many
   questions against one state in a single call.
5. **Serialised judgments that are actually independent.** Jev evaluates
   questions in parallel and in isolation; only genuine dependencies need a
   second request.
6. **Coarse categories or discarded information kept to stay in budget.** The
   gzip quality gate emits one ambiguous verdict where a rubric would give four
   scores with confidence.

Rule from the same source, worth keeping: **do not hide a complex reasoning
task inside a vaguely worded classification question.** Decompose it, ask each
factor separately, combine in code. "Is this copy accurate?" is unanswerable;
four specific claim-detectors are trivially answerable.

## Reading the output

| Level | Meaning |
|---|---|
| **RED** | Users and crawlers see something wrong right now. |
| **AMBER** | Real work exists but has not reached anyone. |
| **ok** | Verified against production, not against the repo. |

A run with zero REDs and many AMBERs is the normal healthy state **between**
dispatches. Many AMBERs for more than a week means dispatches are the
bottleneck, not authoring — and writing more pages will not help.

## When this hands off

| Situation | Go to |
|---|---|
| Drafting the dispatch that clears the AMBERs | `seo-smokegame-ship` |
| Re-running the probe after a dispatch lands | `aeo-measurement` |
| A live accuracy violation | `jev-gauntlet` (`jev.py --gate`) |
| Why a page is not cited | `aeo-quotability`, `geo-representation` |
| The environment itself looks wrong | `env-doctor` |
| Recording a belief that turned out false | `learning-loop` |

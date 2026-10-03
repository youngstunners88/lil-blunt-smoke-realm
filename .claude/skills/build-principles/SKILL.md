---
name: build-principles
description: Decision rules for what to build and what to skip on this project — abstraction-layer choice, bottom-up adoption, reusing existing structure. Use before starting any substantial build, when deciding whether to write a tool or use one, or when a task could be solved at several levels of the stack.
---

# What To Build, And What Not To

Three principles from the operator's coach, plus what they mean for the
decisions that actually come up here. They are decision rules, not slogans —
each one rejects a specific thing that is otherwise tempting.

## 1. Build on the right abstraction layer

> Most teams build what is becoming free. Winning means focusing on the
> product layer.

The layer below you is commoditizing fast. Anything that is "about to be free"
is a bad place to spend the one scarce resource here, which is operator hours.

**The test before writing a tool:** does this exist, is it about to be free, and
is my version going to be better in a way that matters? If the honest answer is
"a paid tool does this better", the choice is between paying and doing without
— not between building it and doing without.

**Applied to this repo, honestly.** `marketing/aeo/probe.py` measures something
Ahrefs and Promptwatch already sell. It exists here because those tools cost
more per month than this project's entire budget, and because a thin script
over an API we already pay for is genuinely cheap. That is a real justification;
"we could build it" is not. If the budget ever supports the paid tool, retiring
the script is a win, not a loss.

**What is actually product layer here:** the game itself, and the writing about
it. Those are the only two things nobody else can supply.

## 2. Bottom-up beats top-down

> Individual adoption plus governance beats infrastructure plus low adoption.
> Fifty individuals at 10x productivity compound past a centralized system.

The failure mode is building the big coordinated thing before anyone wants the
small thing. Adoption compounds; infrastructure without adoption is a
liability that still needs maintaining.

**Applied here.** This is the argument against the elaborate content plan and
for shipping one genuinely good page, then reading what happened. The
`troubleshooting` page was built because a specific class of person hits a
specific problem, not because a content calendar had a slot. The next page
should be justified the same way, ideally by something the probe or PostHog
actually showed.

It is also the argument for the discipline in `aeo-measurement`: three
consecutive runs before calling a win. Compounding only works if the thing you
are compounding is real.

## 3. Reuse the structure that exists

> Folders are orchestrators. Why rebuild what is built?

Structure is architecture — a well-arranged directory tells the next agent what
to do without anyone writing a controller for it. This project already has
that: `.claude/skills/` routes behaviour, `marketing/` holds the tools,
`project-playbook` is the index.

**So: extend the existing shape before inventing a new one.** A new capability
usually belongs as a skill next to its siblings and a script next to its
siblings, not as a new top-level system. Check `project-playbook` before adding
anything; if the new thing does not fit the router, that is a signal to
reconsider its shape, not a reason to add a second router.

See `icm-architect` for the full treatment of folder-as-architecture.

## The check these three add up to

Before a substantial build, answer in one line each:

1. **Layer** — is this the product layer, or something about to be free?
2. **Adoption** — is there a real user for the first version, or only for the
   finished one?
3. **Shape** — does this extend the existing structure, or duplicate it?

Two weak answers means the work is probably premature. That is a prompt to say
so and propose the smaller version, not to build it quietly and hope.

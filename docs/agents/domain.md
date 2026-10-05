# Domain Docs

How the engineering skills should consume this repo's domain documentation
when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root (this is a single-context repo; there is no
  `CONTEXT-MAP.md`).
- **`docs/adr/`** — read the ADRs that touch the area you are about to work in.

If any of these files don't exist, proceed silently. The `/domain-modeling`
skill creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/adr/
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor
proposal, a hypothesis, a test name), use the term as defined in
`CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you
are inventing language the project doesn't use (reconsider) or there is a real
gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than
silently overriding:

> Contradicts ADR-0021 (island React para el gestor de ofertas) — but worth
> reopening because…

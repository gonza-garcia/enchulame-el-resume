# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in the repo this instance points to
(private for a personal instance, public for the product repo). Use the `gh` CLI for all
operations; infer the repo from `git remote -v`.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a
  heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`
  with the appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` /
  `--remove-label "..."`.
- **Close**: `gh issue close <number> --comment "..."`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as
tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Destination /
  Notes / Decisions-so-far / Fog body.
- **Child ticket**: `gh issue create --parent <map-number>` creates it as a
  GitHub sub-issue. Labels: `wayfinder:<type>`
  (`research` / `prototype` / `grilling` / `task`). Once claimed, the ticket
  is assigned to the driving dev: `gh issue edit <n> --add-assignee @me` is
  the session's first write.
- **Blocking**: GitHub's native issue dependencies, UI-visible. Add edges at
  creation with `--blocked-by <n,n>` or later with
  `gh issue edit <n> --add-blocked-by <n,n>`. GitHub reports
  `issue_dependencies_summary.blocked_by` (open blockers only) via
  `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary`.
  A ticket is unblocked when every blocker is closed.
- **Frontier query**: open, unassigned children of the map with no open
  blocker, first in map order.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then
  `gh issue close <n>`, then append a one-line context pointer to the map's
  Decisions-so-far.

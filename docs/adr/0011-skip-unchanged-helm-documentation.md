# ADR 0011: Skip unchanged Helm documentation conservatively

Status: Proposed

Date: 2026-11-17

## Context

Pleey's main workflow avoids Helm documentation setup when only unrelated inputs
changed. Its review requested that this behavior belong to `helm/generate-docs`
so consumers do not maintain a GitHub API and Git policy script.

Comparing only the latest push can lose chart changes from an earlier failed or
cancelled run. Chart templates can also consume arbitrary repository files, so
the action cannot infer a universal list of unrelated inputs.

## Decision

Add optional `skip-if-only-changed`, a newline-separated list of repository-relative
literal files and directories (directories end with `/`). An empty list keeps
generation unconditional. The caller declares which inputs are unrelated to its
chart documentation; no Pleey-specific paths live in this action.

Only the first attempt of a default-branch push targeting the triggering ref or
SHA can skip.
Require an unchanged working tree at the triggering SHA and find the latest
successful push run of the same calling workflow. Compare that baseline with the
triggering SHA through GitHub's commits API, retaining pending changes across
failed or cancelled intermediate pushes. Derive the workflow path from
`github.workflow_ref`, with no caller-specific workflow filename.

Skip only when every changed path is declared unrelated. Both sides of a rename
must qualify. The chart search directory and an explicitly supplied values file
remain relevant even if a broad ignored directory contains them. Invalid paths,
missing or divergent history, an incomplete comparison, API/Git errors and local
modifications all retain generation. Treat the 300-file compare API limit as
uncertain and generate. Read-only `actions` and `contents` access support the
optimization; missing permission falls back to normal generation.

The caller must invoke the action after required checks on every successful
default-branch push. Independent job/path filters would make a successful workflow
an unreliable baseline for documentation and are outside this skip contract.

Keep the decision before checkout and tool installation, using the caller's
checked-out tree so local changes cannot be erased before inspection. Release
callers using `checkout-ref: ""`, reruns and other events generate unconditionally.
Every generation/publication step observes the decision, and a skipped action
returns no `merged-sha`. Existing bot-write permissions and success gates stay
with the caller.

Maintain the source and focused tests in the action's existing package. Reuse the
standard Node workflow and consolidated reports. Generate its readme from action
metadata with the existing documentation tool.

## Consequences

Consumers replace their policy code with declared paths. A stale or unavailable
baseline costs normal generation time rather than risking stale documentation.
The API comparison avoids full-history checkout solely for this optimization.
Callers must revise their path list if templates start reading those inputs.

## References

- [Pleey review](https://github.com/cloud-native-aixmarseille/pleey/pull/553#discussion_r4596165469)
- [GitHub comparison limits](https://docs.github.com/en/rest/commits/commits#compare-two-commits)

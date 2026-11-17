# ADR 0011: Optimize Helm documentation generation

Status: Proposed

Date: 2026-11-17

## Context

Pleey's main workflow avoids Helm documentation setup when only unrelated inputs
changed. Its review requested that this behavior belong to `helm/generate-docs`
so consumers do not maintain a GitHub API and Git policy script.

Comparing only the latest push can lose chart changes from an earlier failed or
cancelled run. Chart templates can also consume arbitrary repository files, so
the action cannot infer a universal list of unrelated inputs.

When generation is required, `helm/generate-docs` installs Node.js and npm
packages, then invokes Textlint, Markdownlint and Prettier through npx. The action already owns
these dependencies, so callers should not need a package registry to format the
generated files. PR #985 is the review boundary for this change.

[ADR 0002](0002-bundle-chart-release-dependencies.md) deferred this toolchain after
an isolated bundle could not resolve dynamically selected Textlint rules. A
successful build alone does not establish a usable distribution.

## Decision

### Skip unrelated documentation changes

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

Keep the change-detection gate before checkout, generation and formatter
initialization, using the caller's checked-out tree so local changes cannot be
erased before inspection. Release callers using `checkout-ref: ""`, reruns and
other events generate unconditionally.
Every generation/publication step observes the decision, and a skipped action
returns no `merged-sha`. Existing bot-write permissions and success gates stay
with the caller.

### Bundle formatting tools

Commit an ES module distribution using the existing action package and its
build/check/test interfaces. esbuild preserves native imports of caller modules;
ncc rewrites those imports into bundle-only lookups and fails the isolated custom
plugin tests. Keep ncc for its existing complete dependency-license generation.
Both tools are development dependencies only, and the standard host/container
distribution checks and bot rebuild workflows remain unchanged. Import the bundle
through the existing github-script runtime. Remove runtime Node.js setup, npm installation,
npx invocation and the unused formatter caches. The previous commands supplied
cache locations without enabling either tool's cache.

Use the tools' supported JavaScript APIs, including Textlint's kernel API.
Its CLI export pulls legacy terminal-formatting code into an ES module bundle.
Read the terminology dictionary through its public API at build time and embed
that data into the JavaScript. Supply its normal rules with resolved terms/options;
do not reimplement matching or copy a private package directory. Explicitly import
the action-owned Textlint Markdown plugin, terminology rule and comment filter. Load caller rule
options and disabled rules from the normal configuration loader, and retain its
resolution for caller-owned rules, filters, plugins and presets. Do not use
Textlint's test-only definition overrides or unstable loading hooks. Use its
public resolver/import hooks inside an isolated asynchronous context so other
loads do not inherit caller paths. Initialize the formatting toolchain only when
generation is required. Emit one JavaScript file to preserve dynamic CommonJS
module interoperability used by Markdownlint custom rules.

Keep the existing working-directory configurations, ignores, Markdown fixes,
Prettier configuration and optional values-file formatting. Retain the CLI's glob
semantics, including hidden Markdown files and exclusion of Git/dependency directories.
Custom modules still belong to the caller and must already be available from its
checkout. The action never installs them or silently substitutes its defaults for missing modules.
Invalid configuration and unresolved plugins fail; remaining Markdown style
findings stay advisory, as before. Textlint errors and Prettier failures prevent
bot publication. Keep Helm generation, schema generation and bot writes separate
from formatting and preserve the change-detection gate.

### Validation and distribution maintenance

Maintain the source and focused tests in the action's existing package. Reuse the
standard Node workflow and consolidated reports. Generate its readme from action
metadata with the existing documentation tool.

Test the shipped distribution outside the source tree with no action
`node_modules`, on the host and in a Node.js container. Exercise real default
fixes, caller configuration and ignores, a local custom rule/plugin, values-file
formatting and failures. Reuse the existing change-detection tests. Rebuild and
compare every generated file. The standard dependency-update automation discovers
the package's build/check scripts after merge.

Keep secret scanning enabled on distributions. Gitleaks misidentifies three
bundled Markdownlint/Prettier variable expressions as generic API keys. Allow only
those complete expressions in this bundle, with both path and expression required;
retain the default rules and scanning of all other content.

## Consequences

Consumers replace their policy code with declared paths. A stale or unavailable
baseline costs normal generation time rather than risking stale documentation.
The API comparison avoids full-history checkout solely for this optimization.
Callers must revise their path list if templates start reading those inputs.

Generation no longer depends on runtime npm availability. The repository download
grows by the generated JavaScript and licenses. Measure the distribution size and
verify isolated operation before claiming workflow savings. Caller-provided
extensions retain their own setup requirements; this change does not package
arbitrary consumer dependencies.

## Local validation, 2026-11-17

For implementation `18eb44d`, the source and isolated distribution each passed
67 tests on Node.js 24.
The isolated run had networking disabled and no action `node_modules`; all 11
formatter cases also passed against the isolated distribution on the Node.js 26
host. Caller-owned Textlint rules, Markdownlint rules and CommonJS configuration,
Prettier plugins, terminology dictionaries, hidden files and dependency-directory
exclusions were exercised. The existing 56 change-detection cases ran unchanged
against the bundle.

`check:dist` passed on the host. Rebuilding under Node.js 24 at another filesystem
path also produced identical staged files. `index.js` was 8,252,925 bytes
(1,943,967 bytes with gzip); dependency licenses were 148,159 bytes. These are local
distribution checks, not workflow performance measurements or main/release bot
publication evidence.

## References

- [Pleey review](https://github.com/cloud-native-aixmarseille/pleey/pull/553#discussion_r4596165469)
- [GitHub comparison limits](https://docs.github.com/en/rest/commits/commits#compare-two-commits)
- [Distribution maintenance](../development/action-distributions.md)
- [Textlint module API](https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md)
- [Prettier API](https://prettier.io/docs/api)
- [esbuild dynamic imports](https://esbuild.github.io/api/#non-analyzable-imports)
- [ncc asset limitations](https://github.com/vercel/ncc#caveats)

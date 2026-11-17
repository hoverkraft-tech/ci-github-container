# ADR 0012: Bundle Helm documentation tools

Status: Proposed

Date: 2026-11-17

## Context

`helm/generate-docs` installs Node.js and npm packages for each generation, then
invokes Textlint, Markdownlint and Prettier through npx. The action already owns
these dependencies, so callers should not need a package registry to format the
generated files. PR #985 is the review boundary for this change.

[ADR 0002](0002-bundle-chart-release-dependencies.md) deferred this toolchain after
an isolated bundle could not resolve dynamically selected Textlint rules. A
successful build alone does not establish a usable distribution.

## Decision

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
Custom modules still
belong to the caller and must already be available from its checkout. The action
never installs them or silently substitutes its defaults for missing modules.
Invalid configuration and unresolved plugins fail; remaining Markdown style
findings stay advisory, as before. Textlint errors and Prettier failures prevent
bot publication. Keep Helm generation, schema generation and bot writes separate
from formatting and preserve the change-detection gate.

Test the shipped distribution outside the source tree with no action
`node_modules`, on the host and in a Node.js container. Exercise real default
fixes, caller configuration and ignores, a local custom rule/plugin, values-file
formatting and failures. Reuse the existing change-detection tests. Rebuild and
compare every generated file. The standard dependency-update automation discovers
the package's build/check scripts after merge.

## Consequences

Generation no longer depends on runtime npm availability. The repository download
grows by the generated JavaScript and licenses. Measure the distribution size and
verify isolated operation before claiming workflow savings. Caller-provided
extensions retain their own setup requirements; this change does not package
arbitrary consumer dependencies.

Keep secret scanning enabled on distributions. Gitleaks misidentifies three
bundled Markdownlint/Prettier variable expressions as generic API keys. Allow only
those complete expressions in this bundle, with both path and expression required;
retain the default rules and scanning of all other content.

## Local validation, 2026-11-17

The final source and isolated distribution each pass 67 tests on Node.js 24.
The isolated run has networking disabled and no action `node_modules`; all 11
formatter cases also pass against the isolated distribution on the Node.js 26
host. Caller-owned Textlint rules, Markdownlint rules and CommonJS configuration,
Prettier plugins, terminology dictionaries, hidden files and dependency-directory
exclusions are exercised. The existing 56 change-detection cases run unchanged
against the bundle.

`check:dist` passes on the host. Rebuilding under Node.js 24 at another filesystem
path also produces identical staged files. `index.js` is 8,252,877 bytes
(1,943,949 bytes with gzip); dependency licenses are 148,159 bytes. These are local
distribution checks, not workflow performance measurements or main/release bot
publication evidence.

## References

- [Distribution maintenance](../development/action-distributions.md)
- [Textlint module API](https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md)
- [Prettier API](https://prettier.io/docs/api)
- [esbuild dynamic imports](https://esbuild.github.io/api/#non-analyzable-imports)
- [ncc asset limitations](https://github.com/vercel/ncc#caveats)

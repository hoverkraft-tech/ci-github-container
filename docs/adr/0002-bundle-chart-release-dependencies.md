# Bundle chart release dependencies

Date: 2026-11-08

Status: Proposed

## Context

The chart release action installs Node.js and YAML only to rewrite Chart.lock. The generated distribution can run in the existing github-script runtime. Helm documentation generation is a separate toolchain with consumer-selected configuration and plugins; its compatibility must be assessed separately.

## Decision

Bundle eligible action-owned JavaScript with the locked version of `@vercel/ncc`.
Commit the generated distribution and dependency licenses. Execute it through
`actions/github-script`, removing the action's Node.js setup and npm installation.
Keep caller-project dependency installation and public action contracts unchanged.

CI must rebuild and compare the distribution, run source tests, and exercise the
distribution outside the source tree without `node_modules`. Keep dependency
review and source security analysis enabled. Mark generated files explicitly so
formatters and source analyzers do not rewrite or duplicate bundled dependencies.

Do not distribute host-specific binaries or silently narrow supported plugin
loading to make a bundle compile. Record compatibility findings before deciding
whether a toolchain should use a separate prebuilt distribution.

## Scope and compatibility

Extract the existing lockfile rewrite into an adjacent helper without changing
its digest, version substitution or missing-lockfile behavior. Keep Helm's
packaging, signing and publication steps unchanged.

Keep `helm/generate-docs` unchanged. An isolated ncc build of Textlint reported
"No rules found" with the action's default configuration: rules and plugins are
selected dynamically. The
[cross-repository audit](https://github.com/hoverkraft-tech/ci-github-common/blob/perf/475-p2-report-parser-bundle/docs/adr/0002-audit-action-dependency-distributions.md)
records the plugin-distribution acceptance criteria.

## Automated dependency updates

Adopt the single public distribution workflow and dedicated action from ci-github-common.
Keep only the pull_request and workflow_run event wrappers, App credential wiring,
and explicit workflow inputs in this repository. Both event callers configure package
directories and author rules; no separate configuration file is required. GitHub
rejects a caller listening to its own completion, so the event files stay separate.
The shared builder regenerates affected bundles and licenses without write
credentials; the trusted writer commits them into the same allowed dependency PR after
validating the origin, allowed paths and current head. Existing distribution and
source tests remain required. Generated commits use a Dependabot-specific marker or Renovate
`gitIgnoredAuthors`, and a fixed trailer prevents loops when the updater and writer
share an App. They trigger normal CI through the CI bot App. Existing Renovate
manager coverage is unchanged.

[Common ADR 0002](https://github.com/hoverkraft-tech/ci-github-common/blob/efb976f9ffe34ec5f8b630833dfd7654e408b693/docs/adr/0002-audit-action-dependency-distributions.md)
owns the security contract and alternatives. Automatic publication starts only
once the callers and their policy inputs reach the default branch. Post-rollout
Dependabot and Renovate updates must verify App permissions, CI retrigger and rebasing.

## Alternatives

- Caching npm packages still needs Node.js setup and an install for every call.
- Shipping `node_modules` adds platform and lifecycle-script assumptions.
- A container would change runner requirements and introduce image pull costs.

## Consequences

Dependency updates must include rebuilt distributions. Repository downloads grow,
so measure bundle size and startup before claiming end-to-end CI savings.

## Dated local validation

On 2026-11-08, Node.js 24.22.2 passed 10 checks: five source checks and five isolated-distribution checks.
The distribution rebuild checks passed after moving the repository to a different
container path. Source behavior and action inputs remain covered by the existing
integration workflows; hosted CI is required before review completion.

Five local pairs after priming used `npm ci --omit=dev --offline --ignore-scripts
--no-audit --no-fund` and the existing warm npm cache, then imported the source
entrypoint in a fresh Node.js process. A separate process imported the committed
distribution. Omitting development dependencies excludes the new bundler from
the source installation measurement. The following values are medians:

| Helper          | Runtime installation | Source import | Distribution import | Distribution bytes | Gzip bytes |
| --------------- | -------------------: | ------------: | ------------------: | -----------------: | ---------: |
| `release-chart` |               348 ms |         60 ms |               42 ms |            299,031 |     61,597 |

Import measurements include Node.js startup, not an action workload. Byte counts
include all generated chunks and license notices; gzip describes concatenated
files, not GitHub transfer latency. These measurements exclude runner scheduling,
Node.js setup, remote registry/cache transfer, and action downloads. They do not
establish end-to-end workflow gains. Raw exports remain outside the repository.

### Existing repository lint blocker

The full local `make lint` run failed in Trivy. A comparison against unmodified
`main` at `dc707d83a7cc52414e7d6a7463eb1a879e7c03d5`, using the same database,
found the same 13 findings in `actions/helm/generate-docs/package-lock.json`.
The chart release lockfile had no findings. Source, workflow and documentation
checks passed. Keep this existing security gate enabled; do not describe CI as
fully passing until the documentation dependencies are fixed.

The new read-only distribution job runs alongside lint so host/container
reproducibility and contract tests still execute. Existing publication and signing
integration tests retain their lint dependency.

## References

- [CI optimization issue](https://github.com/cloud-native-aixmarseille/pleey/issues/475)
- [ncc dynamic asset limitations](https://github.com/vercel/ncc#caveats)

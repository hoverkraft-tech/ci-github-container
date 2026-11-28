# ADR 0016: Register native container test reports before execution

- Status: accepted
- Date: 2026-11-28
- Supersedes: [ADR 0015](0015-unified-ci-report-bundles.md)

## Context

The common reporting contract now discovers actual job executions and their
registrations. Consumers no longer build or forward report plans. Container tests
must contribute to the same terminal report as language and repository checks.

## Decision

Resolve the immutable image, then register the expected native JUnit report before
starting the test engine. Record the suite's repository path, engine, observed
platform and resolved local image ID, alongside the original registry reference.

Stage fresh native evidence in the common recorder's private directory and
finalize it after success or failure. The engine's JUnit report remains mandatory,
including when additional reports are selected. Missing additional reports,
malformed results, skipped-only suites and failed commands still fail the action.
The existing validation output is exposed only after reporting and cleanup succeed.

One terminal common `ci-reports` call publishes annotations, a summary and selected
comments. The container action publishes no separate feedback. Diagnostic artifacts
and image-validation outputs retain their existing purpose. Neither diagnostic
artifacts nor report registration establish promotion eligibility.

## Consequences

Remove `report-plan`; callers provide only the tested image and suite directory.
Producer jobs require `actions: read` and `contents: read`. Explicit path mappings
use a JSON object with repository-relative destinations.

Existing Goss and Testcontainers integration cases cover success, retained failure,
timeouts and resource ownership. The kube-certificates-syncer consumer exercises
this producer with the terminal common reporter alongside its Python matrix.

See [the common reporting contract](https://github.com/hoverkraft-tech/ci-github-common/pull/683).

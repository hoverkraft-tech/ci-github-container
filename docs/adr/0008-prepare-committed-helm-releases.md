# Prepare committed Helm release versions

Date: 2026-11-15

Status: Proposed

## Context

Codespace-like, Postal and OVH Snapshoter need manual and scheduled releases with
automatic version planning. Publishing a GitHub release before validation can
advertise a failed release. Updating chart versions after creating its tag also
leaves the tagged source inconsistent with the published chart.

## Decision

Add `helm/prepare-release` and a reusable `prepare-chart-release` workflow.
Use ci-github-publish for version planning. On the default branch, commit only the
root Chart.yaml through GitHub's expected-head API, create its immutable tag and
dispatch the caller at that tag. Only a ready tag run proceeds to validation and
publication. No-change plans perform no writes. Existing releases are complete;
unpublished tags can resume after their version and default-branch ancestry are
checked. Concurrent source changes fail preparation rather than being overwritten.

Preserve independent application versions by default. OVH Snapshoter explicitly
updates appVersion with its chart; charts deploying other applications do not.
Support stable bare and v-prefixed tags. Repository configuration remains owned
by ci-github-publish. Do not introduce a consumer versioning script or dependency.

Allow an OCI namespace override in release-chart to retain existing addresses,
including `ghcr.io/hoverkraft-tech/charts/ovh-snapshoter`. Keep the current namespace
as the default. Exercise the override in an existing publication integration case.

## Consequences

Preparation needs contents/actions write and pull requests read. Consumers supply
an allowed GitHub App where branch protection requires it. This implementation
never changes repository protection. Commit, tag and dispatch are separate API
operations: dispatch failures recover at the prepared tag; source conflicts need
a new default-branch run. Tags are never moved. Version planning cannot downgrade
an already committed chart version.

This source-version lifecycle precedes archive preparation. It does not replace
or bypass the staged artifact contracts in [ADR 0007](0007-separate-helm-pipeline-phases.md).
Consumers continue using published archive actions until those later contracts
are reviewed and released. No production release is needed to validate preparation.

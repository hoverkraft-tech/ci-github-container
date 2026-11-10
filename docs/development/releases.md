# Releases

The repository publishes one version for all actions and reusable workflows.
Versions use Semantic Versioning without a `v` prefix, for example `0.39.0`.

## Prepare a release

Use Conventional Commit pull request titles. The
[preparation workflow](../../.github/workflows/__prepare-release.yml) maintains
release labels when a pull request opens, changes, or is edited. The shared
release configuration calculates a major increment for breaking changes, minor
for features, and patch for other changes. It also generates the changelog.

## Publish a release

The [release workflow](../../.github/workflows/__release.yml) runs on Mondays at
08:25 UTC and can be started manually from the Actions tab. Select `main` when
starting it manually; other branches and tags cannot publish a release.

The workflow runs the full shared CI suite, including action distribution checks,
before planning and publishing a release. Both actions target the exact commit
that passed CI, even if `main` advances while the workflow runs. Concurrent
release runs are serialized, and a running release is never automatically
cancelled by a later run.

No release is created when the planner finds no changes. The optional manual
`force` input bypasses only that no-change decision. It does not bypass CI or
replace an existing tag.

The workflow uses `CI_BOT_APP_CLIENT_ID` and `CI_BOT_APP_PRIVATE_KEY`, which are
also used by documentation automation. Its installation token is limited to
`contents: write` and `pull-requests: read` for this repository. Publishing with
the app token lets the new tag trigger main CI, documentation generation, and
public documentation synchronization.
GitHub release notes come from the shared Conventional Commit configuration;
no additional release secret is required.

## Verify and recover

Check that the release workflow completed, then check the main CI run for the
published tag and any documentation pull request it creates. Documentation
updates use squash merging and the bot's pull-request-only ruleset bypass;
signed commits remain required.

If CI or planning fails, fix the failure and rerun the workflow. If publication
fails, inspect the repository's tags and releases before retrying: a draft may
already exist. Do not move or replace a published tag. Follow the shared
[release guide](https://github.com/hoverkraft-tech/ci-github-publish/blob/3.0.2/docs/usage/release.md)
for release state and recovery behavior.

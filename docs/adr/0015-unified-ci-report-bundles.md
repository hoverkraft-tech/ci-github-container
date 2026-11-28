# ADR 0015: Use the shared CI report bundle contract

- Status: superseded by [ADR 0016](0016-register-native-container-reports.md)
- Date: 2026-11-26
- Supersedes: only report transfer and grouping in [ADR 0014](0014-standardize-container-image-tests.md)

## Decision

Use ci-github-common's record-ci-reports action for native parsing and artifact
transfer. Forward the test action's report-plan output to the common ci-reports
workflow. Calling job names no longer determine artifact discovery.

Keep image digest, resolved image ID, engine, platform and suite in report metadata.
This describes the execution; it is not a promotion result. Only the existing
validation output establishes success, after strict native report checks and
cleanup. Image resolution, engine execution, report freshness, timeouts and
resource ownership stay in the container action.

Copy selected reports into an action-owned publication directory so the shared
recorder can enforce its file boundary. Logs remain a separate diagnostic artifact.

## Consequences

This replaces report-group with report-plan for advanced orchestration. Standalone
jobs forward the action output. Matrix callers create a complete plan before
execution instead of relying on GitHub's last successful matrix output.

Internal repository unit tests retain the released reporting workflow until the
shared reporting release is adopted. Container integration checks exercise the
new action bundle and retain their lifecycle assertions.

See [common reporting ADR and implementation](https://github.com/hoverkraft-tech/ci-github-common/pull/683).

# ADR 0018: Let Goss suites own application startup

Date: 2026-11-28

Status: Accepted. Supersedes the two-mode API and dgoss execution decisions in
[ADR 0017](0017-run-goss-image-checks-directly.md).

## Context

The syncer pilot needs Goss to check its packaged application without starting a
Kubernetes worker. Other applications need HTTP or process checks after startup.
These are concrete test requirements, but retaining dgoss added an execution mode
without an identified consumer requiring that adapter. Consumers can also express
application startup in their own native Goss suites.

## Decision

Keep `engine: auto`, `goss` and `testcontainers-node`. Remove `goss-mode` from the
action, CLI, execution state and report metadata. Always execute the verified
Goss binary directly as the image's command, preserving its user, environment and
working directory. Remove the dgoss download and execution path.

A Goss `command` may invoke a project-owned script that starts an application,
waits for readiness, performs checks and stops its processes. Keep dependent steps
together because Goss can evaluate separate resources concurrently. Bound readiness
and command execution, and retain suite cleanup for success and failure. The
action's overall timeout and owned-container cleanup remain the final boundary.
Do not add another startup input or wrapper convention. Consumers choose their
native suite structure and can keep Goss for service checks.

Reject a separate `goss_wait.yaml` rather than silently dropping readiness checks.
Suites must express that behavior through `goss.yaml` and any scripts it calls.
Keep native JUnit reporting, immutable image identity, security controls and the
Testcontainers adapter unchanged. Reports identify the suite and engine without
classifying it into an execution mode.

## Validation and consequences

Reuse the direct-Goss and Testcontainers success, failure, timeout and ownership
checks. Replace the dgoss HTTP fixture with a native Goss command and a small
script that manages the existing HTTP image. Exercise that example once in the
Goss job, without duplicating the complete lifecycle matrix for a second mode.
The syncer pilot continues using the same suite through CI and `make test-image`.

Consumers own application-specific startup and readiness. Goss does not provide
ordering between separate resources, and the adapter does not start the normal
image entrypoint automatically. Testcontainers remains available for suites that
prefer its lifecycle APIs or provision additional containers; using it is optional.

## References

- [Goss command resources](https://github.com/goss-org/goss/blob/v0.4.10/resource/command.go)
- [Goss concurrent validation](https://github.com/goss-org/goss/blob/v0.4.10/validate.go)
- [Native HTTP suite](../../tests/container-image/goss/goss.yaml)
- [HTTP lifecycle script](../../tests/container-image/goss/check-http.sh)

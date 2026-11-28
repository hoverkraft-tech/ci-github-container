# ADR 0017: Run Goss image checks directly

Date: 2026-11-28

Status: Accepted. Supersedes the Goss execution and compatibility decisions in
[ADR 0014](0014-standardize-container-image-tests.md).

## Context

The kube-certificates-syncer image checks need to verify its installed Python
application, runtime user, read-only filesystem and writable certificate volume.
Starting the normal entrypoint connects to Kubernetes before those checks can run.
The original Goss adapter always used dgoss, which requires the application to
stay running. That unnecessarily restricted packaging checks to Testcontainers.

Goss itself can execute as the container's command, run its native assertions and
exit. It does not need a background application for filesystem or command checks.
Service tests still need the normal application lifecycle and readiness support.

## Decision

Add `goss-mode` with two explicit values:

- `image` is the default. Run the pinned, checksum-verified Goss binary directly
  as the tested container's entrypoint. Mount the binary and suite read-only.
  Preserve the image's user, environment and working directory. No application
  process, idle wrapper or external application service is started by the adapter.
- `service` retains upstream dgoss and the image's normal entrypoint. It supports
  `goss_wait.yaml`, followed by the native assertions in `goss.yaml`.

Reject `goss_wait.yaml` in image mode rather than silently ignoring readiness.
Reject unsupported modes and service mode on a Testcontainers suite. The CLI
exposes the same option as the action. Existing Goss service callers must set
`goss-mode: service`; breaking changes are accepted for this rollout.

A Goss suite may include a `docker-args` file with one complete Docker option per
line. Initially support only the concrete consumer requirements: read-only root,
dropped capabilities, no new privileges and tmpfs mounts. Reject options that
replace the tested image, user, command, platform, ownership labels or reserved
Goss mounts. Do not evaluate shell expressions. Local Make targets can pass the
same file and native assertions to Docker without installing Node.js or Goss on
the host. Testcontainers suites retain native runtime configuration.

Keep the immutable image and observed platform contract. Include the Goss mode
in the report variant and successful validation output, so packaging evidence is
distinguishable from running-service evidence. Retain native JUnit and diagnostics
on failure. Apply the existing timeout, cancellation and owned-resource cleanup
to both modes. Central reporting continues to follow
[ADR 0016](0016-register-native-container-reports.md).

## Consequences and validation

Image mode verifies packaging and commands, not production startup or integration
with external services. Command assertions still require a shell. Use service
mode for HTTP/readiness tests and Testcontainers for provisioned dependencies or
more involved lifecycle scenarios. Avoid adding an arbitrary startup-command API
or a dummy process solely to satisfy dgoss.

Extend the existing action test workflow with a non-root image whose normal
entrypoint exits unsuccessfully. Passing image-mode assertions prove that Goss
runs directly and retains the intended user and security settings. Reuse the
failure, timeout, native-report and caller-owned-resource checks for this mode.
Keep existing Node and Goss service coverage. Unit tests cover invalid options
and readiness/mode conflicts before Docker execution.

Pilot the same Goss suite through kube-certificates-syncer CI and `make test-image`.
This ADR defines acceptance requirements; execution evidence belongs to the PR.

## References

- [Consumer PR #25](https://github.com/hoverkraft-tech/kube-certificates-syncer/pull/25)
- [Goss v0.4.10](https://github.com/goss-org/goss/releases/tag/v0.4.10)
- [Goss command assertions](https://github.com/goss-org/goss/blob/v0.4.10/resource/command.go)
- [dgoss lifecycle](https://github.com/goss-org/goss/blob/v0.4.10/extras/dgoss/dgoss)

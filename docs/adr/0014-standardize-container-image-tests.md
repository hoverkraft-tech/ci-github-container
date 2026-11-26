# ADR 0014: Standardize container image tests

Date: 2026-11-26

Status: Accepted on 2026-11-26. Implementation is included in PR #1002.

## Context

Hoverkraft repositories repeat image selection, test execution, readiness checks,
diagnostics and cleanup. Their assertions cover different requirements: a command
line tool, an HTTP service and a container's filesystem need different tests.

The following evidence was inspected on 2026-11-26. These are observations of the
linked revisions, including one open migration PR, rather than acceptance results
for the action proposed here.

| Repository                                     | Existing approach                                       | Requirement to preserve                                       |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------- |
| [docker-base-images][base-ci]                  | Node.js Testcontainers suites and a shared runner image | Installed tools, runtime configuration and functional tests   |
| [ci-dokumentor][dokumentor-tests]              | CLI smoke tests and action integration                  | Execute the packaged CLI against the supplied candidate       |
| [HTTP Header Authenticator PR #51][http-tests] | Inline Docker, HTTP requests and health checks          | Accepted/rejected authentication, health and runtime user     |
| [kube-certificates-syncer][syncer-tests]       | Locally loaded image and a Python smoke test            | Non-root execution, imports and a writable certificate volume |

The base-image workflow skips images without test files and can fall back to a tag
when selecting a reference. The HTTP proposal builds two platforms but executes
its image tests in one job without a platform matrix. Sharing execution alone
cannot establish that every required image, suite and platform was tested.

[ADR 0006](0006-promote-validated-image-digests.md) already defines the publication
boundary: successful validation jobs forward exactly the candidate metadata they
tested through `validated-images`. This decision preserves that contract.

The [Node.js][node-test], [Go][go-test], [Python][python-test] and [PHP][php-test]
test actions were also inspected on 2026-11-26. They use composite actions,
`working-directory`, native report parsing and retained report artifacts, including
after test failures. Container tests should participate in that existing contract.

## Decision

Introduce `actions/docker/test-image` as a composite action with two supported engines:
`testcontainers-node` and `goss`. Share image identity, execution limits, diagnostics
and result conventions. Keep assertions in repository-owned, native test suites.
An invocation runs one suite against one target image and one platform.

The initial execution environment is a Linux runner with a Docker daemon reachable
through a local Unix socket. Use the existing Docker setup for tooling and registry
authentication. Keep signatures/provenance, Helm installation, image building and
publication in their existing components. Workflow callers own runner selection,
permissions, platform matrices and the inventory of required suites. This decision
adds an action, with its dedicated test workflow, and no public reusable workflow.

### Shared test action conventions

Follow the sibling actions' prepare, execute, report and upload steps, with cleanup
for owned container resources. Reuse `ci-github-common/actions/working-directory`
to resolve and validate the suite directory once. Checkout belongs to the caller.
Use that resolved directory for engine detection, execution and relative report
paths; translate runner-container paths at the adapter boundary.

Keep shared input names and meanings consistent with the Node.js test action:

| Input               | Proposed contract                                                                                                                                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `working-directory` | Suite directory, absolute or relative to the repository root, default `.`. Use this name throughout; no separate `tests-directory` input.                                                                                                 |
| `report-file`       | Optional native test report paths or globs, relative to the working directory or absolute, using the common parser's syntax. Every explicit entry must match. When omitted, use the selected adapter's report files from this invocation. |
| `path-mapping`      | Optional report path mappings forwarded to the common parser, including paths from the test runner container.                                                                                                                             |
| `report-group`      | Calling job ID for consolidated reports, defaulting to `github.job`. Nested reusable workflows supply the outer job ID appearing in the reporting workflow's `needs`.                                                                     |

`image` and `engine` remain the container-specific inputs. Native suites and the
selected adapter define execution. Package-manager commands, source coverage and
Vitest sharding remain concerns of the language actions; add further execution
controls only for a concrete container-test requirement.

### Engine responsibilities

| Engine                | Execution                                                                                | Suite conventions                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `testcontainers-node` | Reuse the [existing Node.js runner][node-runner] and Testcontainers lifecycle primitives | Native Node.js tests use `TESTED_IMAGE_REF` for the target and may provision dependencies |
| `goss`                | Use upstream [dgoss][dgoss-docs] to run Goss inside the target container                 | `goss.yaml` defines assertions; optional `goss_wait.yaml` defines readiness               |

Both engines emit native JUnit results for the shared reporting steps below.
An engine owns its native configuration and
resource lifecycle; the shared action coordinates limits, diagnostics and results.
Support these two implementations directly. Add another engine or Testcontainers
language binding only for a demonstrated consumer requirement.

Upstream [dgoss executes through `sh` in a running container][dgoss-source]. Its
initial adapter therefore requires that environment and a Goss binary matching
the container platform. Shell-less and short-lived CLI images use Testcontainers
unless a separate Goss execution approach is reviewed. Honor the image's default
user and entrypoint. Any intentional suite override must document its narrower
coverage; checking installed tools with an overridden command does not establish
that the production entrypoint works.

### Engine selection

Default `engine` to `auto`; callers may explicitly select `testcontainers-node`
or `goss`. Detect engines from supported suite files directly in `working-directory`,
using the same file conventions for detection and execution:

| Suite files present                | Automatic selection                                                          |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| One or more `*.test.js` files only | `testcontainers-node`, following the [existing suite convention][node-suite] |
| `goss.yaml` only                   | `goss`                                                                       |
| Both kinds                         | Fail as ambiguous; require an explicit engine or separate suite directories  |
| Neither kind                       | Fail with the expected filenames and inspected directory                     |

Read filenames without executing test code or searching outside the selected
directory. `package.json`, installed dependencies and `goss_wait.yaml` alone are
not suite signals. Detection selects an adapter; normal suite validation still
rejects empty or invalid tests.

An explicit engine bypasses detection but still requires its own valid suite.
Never fall back to another engine after validation or execution fails. Running
both engines requires two invocations, each with its required coverage declared
by the caller. Log the resolved engine and matching files, and identify the
resolved engine in results rather than `auto`.

### Image identity and platform

Accept a fully qualified registry reference containing `@sha256:...`, or an
explicit local Docker image ID (`sha256:...`) from the same daemon. Reject tag-only
references. Resolve and inspect the target before execution and make that immutable
identity available to the suite. Testing does not rebuild, retag or publish images.

Registry validation retains the original manifest or index digest. Local image
IDs identify local image configuration, not registry manifests; report the two
forms separately. A local-only success cannot certify a subsequently rebuilt or
pushed candidate. Registry publication requires tests of that candidate's digest
under ADR 0006, independently of any earlier local smoke test.

Default to the daemon's native platform and report the observed OS/architecture.
An explicitly requested platform must match the executed image. A multi-platform
index reference does not mean every member was exercised. Callers declare their
required platform coverage and provide compatible runners or explicitly configured
emulation. The action does not silently install emulation or claim native coverage
for an emulated run.

### Proposed invocation and results

These are proposed inputs, not usage examples for a released action. Both engines
use the same interface; additional engine-specific options require a concrete
consumer need during implementation.

Omitting `engine` uses automatic detection:

```yaml
with:
  image: ${{ fromJSON(needs.build.outputs.built-images).app.images[0] }}
  working-directory: tests/container
```

An explicit selection also works when both suite kinds are present:

```yaml
with:
  engine: goss
  image: ${{ fromJSON(needs.build.outputs.built-images).app.images[0] }}
  working-directory: tests/container
```

Require a resolved engine and an existing, nonempty suite. Unsupported inputs,
missing tests, zero executed test cases, an unsuccessful engine exit, failed tests,
timeouts and missing or invalid result reports all fail the invocation. An
all-skipped suite is not successful validation. Preserve the original failure
when collecting diagnostics; cleanup must not turn a failed test run into a pass.

Return a successful test result only after execution, report checks and required
cleanup succeed. Identify the target, identity kind, engine, suite, observed
platform and current run/attempt, with report and log paths. Failed invocations may
retain diagnostic paths and `report-artifact-id`, but must not expose successful
validation output. A report artifact is diagnostic evidence, not a passing result.
Keep the same suites runnable locally with the pinned engines outside GitHub.

### Native reports and consolidated reporting

Reuse [the common report parser][common-parser] with the resolved working directory,
selected JUnit paths and `path-mapping`. Request `annotations,summary,markdown` and
fail on reported test errors. Keep parsing and artifact upload eligible after test
failures, using `!cancelled()` and guards for successful preparation and actual test
execution, as the sibling actions do. Cleanup remains eligible on cancellation.
Reporting must preserve the test command's failure and the strict missing/empty
report checks above; broad report discovery must not reuse stale files from an
earlier invocation or unrelated project tests.

Upload only the parser's `parsed-files` as native reports, retaining them for seven
days. Use the existing `ci-reports-<run_attempt>-<report-group>-<unique name>` artifact
contract, with distinct names for every invocation and matrix member. Preserve
image, engine and platform identity in suite/report labels. Keep logs and validation
metadata outside these artifacts: the common workflow parses their files as native
reports. Retain other diagnostics separately without the `ci-reports-` prefix.

Expose `report-artifact-id` with the same meaning as the sibling test actions: the
uploaded native report artifact ID, including after failed tests, or empty when no
artifact is available. Keep this reporting output separate from the successful
image-validation result consumed by promotion.

Use the existing [common `ci-reports` workflow][common-reports] once after producer
jobs, with `if: always()`, their job IDs in `needs` and
`job-results: ${{ toJSON(needs) }}`. As in Go and Python, the action publishes job
annotations, summaries and artifacts without individual PR comments. The reporting
workflow owns consolidated comments and their write permissions. Producer jobs
remain required checks; a successful reporting job does not establish image-test
success or replace promotion's validation dependencies.

### Promotion and required checks

The caller declares every required image/engine/platform combination before
scheduling tests. Missing suites must fail selection rather than disappear from
the test matrix. Repositories may use either engine or both when their assertions
cover distinct requirements. An intentional build-only path produces no validation
evidence.

For promotion, a successful validation job maps the successful registry test
result back to the matching producer entry and forwards that entry unchanged as
`validated-images`. Do not echo the complete `built-images` input after testing
only one image, or append platform/test fields to the existing candidate schema.
Keep detailed execution coverage in the test result and reports.

Promotion's `needs` must contain every required validation job, with actual
dependency results supplied through `job-results`. Any caller-side aggregation
must verify the complete expected set and reject failure, cancellation, missing
results or required skips. ADR 0006 permits identical evidence from multiple
validators and rejects conflicting metadata. It does not discover omitted jobs
or enforce the caller's platform policy.

Suite authors and workflow configuration remain trusted. An engine's success and
an image reference are not independent proof that arbitrary test code exercised
that image or checked every application requirement.

### Lifecycle, credentials and tool ownership

Use bounded readiness and overall execution limits. Capture available container
logs and engine diagnostics before teardown, including on failures and timeouts.
On cancellation, attempt teardown through the engine's lifecycle and action cleanup
hooks. Hard termination or runner loss can prevent cleanup; self-hosted runners
need an operational recovery policy for abandoned test resources.

Give each invocation unique resource names or labels and private temporary storage.
Remove only its own containers, networks, volumes and temporary files. Never prune
the daemon or delete caller-owned local images, test sources or unrelated caches.
Keep exported reports available for the caller's existing reporting steps.

Registry credentials stay in the host's authentication setup. Do not automatically
inject them or publication credentials into the tested image. Testcontainers needs
Docker access in its trusted runner; do not mount the Docker socket into the target
by default. Application-specific test credentials remain explicit caller choices.

Pin engine tooling and the test runner image in maintained manifests, with verified
downloads and existing dependency automation. Use an already released runner when
testing a new runner image, keeping test orchestration independent of its candidate.
Avoid a second copy of the Node.js runner or upstream dgoss lifecycle code here.

## Alternatives and consequences

- Standardizing only documentation or copied workflow snippets leaves fixes and
  result semantics distributed across consumers.
- Requiring Testcontainers everywhere simplifies maintenance but forces imperative
  JavaScript suites onto consumers that can express their checks with Goss YAML.
- Requiring Goss everywhere excludes the current dgoss adapter's incompatible
  runtimes and makes complex application scenarios harder to express.
- A public testing workflow would centralize jobs and matrices, but cannot consume
  an image loaded only in the caller's job. Reconsider it when repeated orchestration
  demonstrates a need beyond the action.
- A new assertion language or general plugin API adds another interface to maintain.
  Native suites and two explicit adapters meet the present requirement.

Two engines increase dependency, compatibility and lifecycle testing costs.
Application assertions and completeness policies still require review. The benefit
is a shared execution contract, reproducible local tests and consistent evidence
without forcing all container behavior into one test format.

## Validation and rollout

This ADR defines acceptance requirements; it does not claim an implementation or
runtime validation of the proposed action.

1. Cover input/identity validation, missing and empty suites, result interpretation,
   output suppression and resource ownership at the cheapest reliable layer.
   Cover automatic selection of each engine, ambiguous or absent suite files,
   explicit selection and failure without fallback using filesystem fixtures.
2. Exercise each engine against existing small image fixtures, including a failing
   assertion and cleanup after failure/timeout. Include a pre-existing unrelated
   resource to demonstrate that teardown preserves caller state. Verify both local
   image-ID and registry-digest handling, plus dgoss's incompatible-runtime error.
3. Verify observed platform reporting and that a single-platform execution does not
   certify a whole index. Add real cross-platform execution only where its boundary
   cannot be covered by cheaper checks, and measure its cost.
4. Exercise action outputs and reporting through a dedicated action test workflow.
   Verify native report retention and `report-artifact-id` after a failing test,
   separate artifacts for repeated/matrix invocations and outer-job grouping with
   the existing `ci-reports` workflow. Verify path mapping and missing/stale report
   rejection at the cheapest reliable layer. Reuse the common parser and workflow
   coverage instead of testing their parsing and comment rendering again.
   Reuse the promotion fixture for successful and failed validation gating without
   duplicating the publication tests or adding another application fixture.
5. Pilot existing base-image Testcontainers suites, HTTP runtime checks and a Goss
   suite drawn from existing tool/configuration assertions. Migrate assertions
   instead of duplicating them across engines, and compare runtime and diagnostics.
6. Generate action documentation from metadata with CI Dokumentor. Document native
   local execution and supported runtimes. Release before broad consumer migration;
   coordinated previews use reviewed immutable SHAs with links to the supporting PR.

## References

- [Validated digest promotion](0006-promote-validated-image-digests.md)
- [Helm validation and publication boundaries](0009-compose-helm-validation-and-release-workflows.md)
- [Testcontainers container lifecycle](https://node.testcontainers.org/features/containers/)
- [Testcontainers readiness strategies](https://node.testcontainers.org/features/wait-strategies/)
- [GitHub Actions and reusable workflow boundaries](https://docs.github.com/en/actions/concepts/workflows-and-actions/reusing-workflow-configurations)

[base-ci]: https://github.com/hoverkraft-tech/docker-base-images/blob/4c65ce52fdf8a0889a619abf44d74dfb2f95409a/.github/workflows/continuous-integration.yml#L149
[node-runner]: https://github.com/hoverkraft-tech/docker-base-images/blob/4c65ce52fdf8a0889a619abf44d74dfb2f95409a/images/testcontainers-node/entrypoint.sh
[node-suite]: https://github.com/hoverkraft-tech/docker-base-images/blob/4c65ce52fdf8a0889a619abf44d74dfb2f95409a/images/testcontainers-node/README.md#test-file-structure
[dokumentor-tests]: https://github.com/hoverkraft-tech/ci-dokumentor/blob/9c7cb1345fca1dfd8531f2fbb0d728c8504d41b4/.github/workflows/__test-docker-image.yml
[http-tests]: https://github.com/hoverkraft-tech/http-header-authenticator/blob/30dda26843c86ad4fcbf58f94939651a61d92ee1/.github/workflows/__shared-ci.yml#L68
[syncer-tests]: https://github.com/hoverkraft-tech/kube-certificates-syncer/blob/c77a5bc41fb696f1008f4b63b949a69c998c2bdb/.github/workflows/__shared-ci.yml#L40
[dgoss-docs]: https://github.com/goss-org/goss/blob/dcd065d94e4ebcf8f800eba14d98cc9f326c5131/extras/dgoss/README.md
[dgoss-source]: https://github.com/goss-org/goss/blob/dcd065d94e4ebcf8f800eba14d98cc9f326c5131/extras/dgoss/dgoss
[node-test]: https://github.com/hoverkraft-tech/ci-github-nodejs/blob/840ff8114fd2b2d20ccb82a6dcf41bebb06c8e7b/actions/test/action.yml
[go-test]: https://github.com/hoverkraft-tech/ci-github-go/blob/dcc9e10f1938e4496a40edc4e90eb0a6294a8bb2/actions/test/action.yml
[python-test]: https://github.com/hoverkraft-tech/ci-github-python/blob/9fe07ffb0ede25d9311ca9e3d8c82d1ce38e7d75/actions/test/action.yml
[php-test]: https://github.com/hoverkraft-tech/ci-github-php/blob/a63a2c1951162d625d105ba5a6823312f3809354/actions/test/action.yml
[common-parser]: https://github.com/hoverkraft-tech/ci-github-common/blob/af0bdd6313bd49aaf4a8a7f0de005fb0db856b03/actions/quality/parse-ci-reports/action.yml
[common-reports]: https://github.com/hoverkraft-tech/ci-github-common/blob/af0bdd6313bd49aaf4a8a7f0de005fb0db856b03/.github/workflows/ci-reports.yml

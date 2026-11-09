# Action distributions

Bundled action packages declare `build`, `check:dist` and `test:distribution` in
their own `package.json`. CI discovers these packages at the repository root or
under `actions/`, including nested actions. Adding a package requires no path list
in CI, rebuild callers, linter exclusions or Git attributes.

Packages with maintained JavaScript use ES modules under `src/`, with `*.test.js` beside their
source. Each package owns its lockfile and the `test`, `test:watch` and `test:ci`
scripts. The CI script creates `coverage/` before writing LCOV and JUnit reports. Keep source
tests, bundle checks and public-action integration checks in separate CI jobs.
Follow the Common `parse-ci-reports` CI pattern: use the Node.js
`continuous-integration` workflow for each package's `test:ci`, with explicit job
permissions. Disable build and lint while keeping CodeQL with the repository
config, dependency review and GitHub coverage enabled. Set `test.comment` to false
and `test.report-group` to the outer calling job ID in `__shared-ci.yml`. One
`ci-reports` job runs after the producers, including failures, and updates one
coverage comment with separate figures per action. Test results and lint summaries
are consolidated too; individual producer comments stay disabled.

For source or dependency changes, run these commands in the package directory:

```sh
npm ci --ignore-scripts
npm run build
npm test
```

Commit source, lockfile and the complete generated `dist` directory together.
After staging generated output, `npm run check:dist` rebuilds it and rejects
modified or untracked files. Do not edit bundles or license notices manually.

The shared distribution test workflow runs `check:dist` and isolated bundle
contract tests on a host and in a Node.js container. Each package's
`test:distribution` script selects its own behavior tests. Those tests load
`process.env.ACTION_ENTRYPOINT` when supplied, falling back to source locally.
The shared test action supplies an isolated `dist/index.js`, clears external module
lookup settings, propagates failures and removes the copy after every run.
No repository-level test runner is needed. Keep assertions for errors and
caller-owned files in the action's tests; security checks remain enabled.

Allowed dependency PRs use the shared
[distribution automation](https://github.com/hoverkraft-tech/ci-github-common/blob/main/.github/workflows/action-distributions.md)
to regenerate bundles and licenses in the same PR. Both the
[build caller](../../.github/workflows/__rebuild-action-distributions.yml) and
[commit caller](../../.github/workflows/__commit-action-distributions.yml) use
package discovery from default-branch manifests and configure allowed authors.
The shared guide owns App setup, Renovate author handling and recovery instructions.
New packages must reach the default branch before the writer can update them;
normal distribution CI validates them in their introducing PR.

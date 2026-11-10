# Dependency updates

[Dependabot](../../.github/dependabot.yml) manages dependencies in supported manifests.
[Renovate](../../.github/renovate.json) manages the annotated defaults in
[Docker Setup](../../actions/docker/setup/action.yml):

| Input            | Release source                                  |
| ---------------- | ----------------------------------------------- |
| `docker-version` | Docker Hub tags for the official `docker` image |
| `buildx-version` | GitHub releases for `docker/buildx`             |
| `buildkit-image` | Docker Hub tags for `moby/buildkit`             |

Keep each Renovate annotation immediately above its `default` value so the shared
regex manager can extract it. Docker version updates retain a plain version number;
BuildKit updates retain the `moby/buildkit:` image prefix.

The [Renovate workflow](../../.github/workflows/__renovate.yml) runs
[`renovatebot/github-action`](https://github.com/renovatebot/github-action) on the configured
schedule and supports manual runs through `workflow_dispatch`. It reads the configuration
from the default branch and groups updates into pull requests with the minimum release age
defined in the [Renovate configuration](../../.github/renovate.json).
Updates require review and CI validation before merging.

The workflow uses the `CI_BOT_APP_CLIENT_ID` variable and `CI_BOT_APP_PRIVATE_KEY` secret
from the repository or organization. The CI bot must be installed on this repository with
read access to checks and write access to contents, issues, pull requests, and commit statuses.
Its installation token is scoped to this repository, and Renovate uses GitHub API commits for signing.

Validate configuration changes with a Node.js version supported by Renovate:

```bash
npx --yes --package renovate renovate-config-validator --strict --no-global .github/renovate.json
```

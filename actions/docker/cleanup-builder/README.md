<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItdHJhc2gtMiIgY29sb3I9ImJsdWUiPjxwb2x5bGluZSBwb2ludHM9IjMgNiA1IDIwIDIxIDIwIDIxIDYiPjwvcG9seWxpbmU+PHBhdGggZD0iTTE5IDZWNGExIDEgMCAwIDAtMS0xaC00YTEgMSAwIDAgMC0xIDF2Mk01IDZoMTQiPjwvcGF0aD48cGF0aCBkPSJNMTAgMTF2NiI+PC9wYXRoPjxwYXRoIGQ9Ik0xNCAxMXY2Ij48L3BhdGg+PC9zdmc+) GitHub Action: Docker - Cleanup builder

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Cleanup builder" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Registers a post-job step that removes a Docker Buildx builder after later post-job hooks have finished.
This action exists as a workaround for GitHub Actions post-step ordering behavior with composite actions, where the effective cleanup order may not match the visible reverse order of YAML steps.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/cleanup-builder@main
  with:
    builder: ${{ steps.docker-setup.outputs.buildx-name }}
    enabled: true
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**     | **Description**                                               | **Required** | **Default** |
| ------------- | ------------------------------------------------------------- | ------------ | ----------- |
| **`builder`** | Docker Buildx builder name to remove during post-job cleanup. | **false**    | -           |
| **`enabled`** | Whether cleanup should run during the post-job phase.         | **false**    | `true`      |

<!-- inputs:end -->

## Notes

Use this action before other actions whose post-job hooks still need the builder. It is intended as a workaround for GitHub Actions runner behavior around post-step ordering in composite actions. See [actions/runner#1657](https://github.com/actions/runner/issues/1657).

In practice, this means the built-in `docker/setup-buildx-action` cleanup can run too early for actions such as `docker/build-push-action` or `reproducible-containers/buildkit-cache-dance` that still access the builder during their own post-job hooks.

This action works by registering its cleanup post hook earlier, so the runner executes it later than the post hooks that still need the builder.

<!-- contributing:start -->

## Contributing

Contributions are welcome! Please see the [contributing guidelines](https://github.com/hoverkraft-tech/ci-github-container/blob/main/CONTRIBUTING.md) for more details.

<!-- contributing:end -->
<!-- license:start -->

## License

This project is licensed under the MIT License.

SPDX-License-Identifier: MIT

Copyright © 2026 hoverkraft

For more details, see the [license](http://choosealicense.com/licenses/mit/).

<!-- license:end -->

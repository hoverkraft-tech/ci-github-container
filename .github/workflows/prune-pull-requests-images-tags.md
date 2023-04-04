<!-- start title -->

# GitHub Reusable Workflow: Prune pull requests images tags

<!-- end title -->
<!-- start description -->

Workflow to performs a clean of closed pull requests images tags.
See [../../actions/docker/prune-pull-requests-image-tags/README.md](../../actions/docker/prune-pull-requests-image-tags/README.md) for more information.

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
name: Prune pull requests images tags

on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  main:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-build-images.yml@0.3.0
    # Optional customizations.
    with:
      # Images to clean. Example: ["application-1","application-2"].
      images: ""
```

<!-- start inputs -->

| **Input**               | **Description**                                                          | **Default** | **Required** |
| ----------------------- | ------------------------------------------------------------------------ | ----------- | ------------ |
| **<code>images</code>** | Images to clean. Example: <code>["application-1","application-2"]</code> |             | **true**     |

<!-- end inputs -->

<!-- start outputs -->
<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->
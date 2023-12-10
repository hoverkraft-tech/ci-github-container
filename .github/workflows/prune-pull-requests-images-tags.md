<!-- start branding -->
<!-- end branding -->
<!-- start title -->

# GitHub Reusable Workflow: Prune pull requests images tags

<!-- end title -->
<!-- start badges -->
<!-- end badges -->
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
    uses: hoverkraft-tech/ci-github-container/.github/workflows/prune-pull-requests-images-tags.yml@0.13.2
    # Optional customizations.
    with:
      # Json array of runner(s) to use.
      # See https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job
      # Default: '["ubuntu-latest"]'
      runs-on: '["ubuntu-latest"]'

      # Images to clean. Example: ["application-1","application-2"].
      images: ""
```

<!-- start inputs -->

| **Input**                | **Description**                                                                                                                                                                                | **Default**                    | **Required** |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------ |
| **<code>runs-on</code>** | Json array of runner(s) to use. See [https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job](https://docs.github.com/en/actions/using-jobs/choosing-the-runner-for-a-job) | <code>["ubuntu-latest"]</code> | **false**    |
| **<code>images</code>**  | Images to clean. Example: <code>["application-1","application-2"]</code>                                                                                                                       |                                | **true**     |

<!-- end inputs -->

<!-- start outputs -->
<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

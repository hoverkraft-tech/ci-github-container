<!-- start branding -->
<!-- end branding -->
<!-- start title -->

# GitHub Action: Prune pull requests image tags from GitHub Packages

<!-- end title -->
<!-- start badges -->
<!-- end badges -->
<!-- start description -->

Action to prune existing package versions related to closed pull requests

<!-- end description -->
<!-- start contents -->
<!-- end contents -->

Set permissions to read contents and pull-requests. This is required to get the PR branch.

```yaml
on: issue_comment
permissions:
  contents: read
  pull-requests: read
```

<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/prune-pull-requests-image-tags@v0.11.2
  with:
    # Image name
    image: ""

    # The regular expression to match pull request tags. Must have a capture group for
    # the pull request number.
    # Default: ^pr-([0-9]+)(?:-|$)
    pull-request-tag-filter: ""

    # GitHub token with the packages:read and packages:delete scopes. See
    # <https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries>
    # Default: ${{ github.token }}
    github-token: ""
```

<!-- end usage -->
<!-- start inputs -->

## Inputs

| **Input**                                | **Description**                                                                                                                                                                                                           | **Default**                       | **Required** |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------ |
| **<code>image</code>**                   | Image name                                                                                                                                                                                                                |                                   | **false**    |
| **<code>pull-request-tag-filter</code>** | The regular expression to match pull request tags. Must have a capture group for the pull request number.                                                                                                                 | <code>^pr-([0-9]+)(?:-\|$)</code> | **false**    |
| **<code>github-token</code>**            | GitHub token with the packages:read and packages:delete scopes. See <https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries> | <code>${{ github.token }}</code>  | **false**    |

<!-- end inputs -->
<!-- start outputs -->

## Outputs

| **Output**                      | **Description**                |
| ------------------------------- | ------------------------------ |
| <code>deleted-image-tags</code> | The list of deleted image tags |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

## Contributing

### Lint index.js

```bash
npx standard --fix actions/docker/prune-pull-requests-image-tags/index.js
```

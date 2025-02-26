<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:delete color:gray-dark>" /> GitHub Action: Prune pull requests image tags from GitHub Packages

<!-- end title -->
<!--
// jscpd:ignore-start
-->
<!-- start badges -->

<a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20tag" /></a><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/release-date/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20date" /></a><img src="https://img.shields.io/github/last-commit/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Commit" /><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Fissues"><img src="https://img.shields.io/github/issues/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Open%20Issues" /></a><img src="https://img.shields.io/github/downloads/hoverkraft-tech/ci-github-container/total?logo=github&style=flat-square" alt="Downloads" />

<!-- end badges -->
<!--
// jscpd:ignore-end
-->
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
- uses: hoverkraft-tech/ci-github-container@0.21.0
  with:
    # Description: Image name
    #
    image: ""

    # Description: The regular expression to match pull request tags. Must have a
    # capture group for the pull request number.
    #
    # Default: ^pr-([0-9]+)(?:-|$)
    pull-request-tag-filter: ""

    # Description: GitHub token with the packages:read and packages:delete scopes. See
    # <https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries>.
    #
    # Default: ${{ github.token }}
    github-token: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                            | **Description**                                                                                                                                                                                                                 | **Default**                       | **Required** |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------ |
| <code>image</code>                   | Image name                                                                                                                                                                                                                      |                                   | **false**    |
| <code>pull-request-tag-filter</code> | The regular expression to match pull request tags. Must have a capture group for the pull request number.                                                                                                                       | <code>^pr-([0-9]+)(?:-\|$)</code> | **false**    |
| <code>github-token</code>            | GitHub token with the packages:read and packages:delete scopes.<br />See <https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries>. | <code>${{ github.token }}</code>  | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| **Output**                      | **Description**                                                       |
| ------------------------------- | --------------------------------------------------------------------- |
| <code>deleted-image-tags</code> | The list of deleted tags for given image. Example: ["1.0.0", "1.0.1"] |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

## Contributing

### Lint index.js

```bash
npx standard --fix actions/docker/prune-pull-requests-image-tags/index.js
```

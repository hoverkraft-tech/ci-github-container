<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:book-open color:blue>" /> GitHub Action: Helm - Generate Chart Documentation

<!-- end title -->
<!--
// jscpd:ignore-start
-->
<!-- markdownlint-disable MD013 -->
<!-- start badges -->

<a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20tag" /></a><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/release-date/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20date" /></a><img src="https://img.shields.io/github/last-commit/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Commit" /><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Fissues"><img src="https://img.shields.io/github/issues/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Open%20Issues" /></a><img src="https://img.shields.io/github/downloads/hoverkraft-tech/ci-github-container/total?logo=github&style=flat-square" alt="Downloads" />

<!-- end badges -->
<!-- markdownlint-enable MD013 -->
<!--
// jscpd:ignore-end
-->
<!-- start description -->

Action to generate documentation for a Helm chart.
It will generate the documentation in the `docs/` directory of the chart.
Mainly using [losisin/helm-docs-github-action](https://github.com/losisin/helm-docs-github-action).

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container@0.27.0
  with:
    # Description: Working directory
    #
    # Default: ${{ github.workspace }}
    working-directory: ""

    # Description: Path to the values file to use for generating the documentation. If
    # not provided, it will use the default values file.
    #
    # Default: values.yaml
    values-file: ""

    # Description: GitHub Token to create and merge pull request. Permissions:
    #
    # - contents: write
    # - pull-requests: write
    #
    # Default: ${{ github.token }}
    github-token: ""

    # Description: GitHub App ID to generate GitHub token in place of github-token.
    # See <https://github.com/actions/create-github-app-token>.
    #
    github-app-id: ""

    # Description: GitHub App private key to generate GitHub token in place of
    # github-token. See <https://github.com/actions/create-github-app-token>.
    #
    github-app-key: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                      | **Description**                                                                                                                          | **Default**                          | **Required** |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------ |
| <code>working-directory</code> | Working directory                                                                                                                        | <code>${{ github.workspace }}</code> | **false**    |
| <code>values-file</code>       | Path to the values file to use for generating the documentation.<br />If not provided, it will use the default values file.              | <code>values.yaml</code>             | **false**    |
| <code>github-token</code>      | GitHub Token to create and merge pull request.<br />Permissions:<br /> - contents: write<br /> - pull-requests: write                    | <code>${{ github.token }}</code>     | **false**    |
| <code>github-app-id</code>     | GitHub App ID to generate GitHub token in place of github-token.<br />See <https://github.com/actions/create-github-app-token>.          |                                      | **false**    |
| <code>github-app-key</code>    | GitHub App private key to generate GitHub token in place of github-token.<br />See <https://github.com/actions/create-github-app-token>. |                                      | **false**    |

<!-- end inputs -->
<!-- start outputs -->
<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

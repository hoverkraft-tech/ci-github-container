<!-- start branding -->

<img src=".github/ghadocs/branding.svg" width="15%" align="center" alt="branding<icon:check-circle color:gray-dark>" />

<!-- end branding -->
<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:check-circle color:gray-dark>" /> GitHub Action: Test Helm Chart

<!-- end title -->
<!-- start badges -->

<a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/v/release/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20tag" /></a><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Freleases%2Flatest"><img src="https://img.shields.io/github/release-date/hoverkraft-tech/ci-github-container?display_name=tag&sort=semver&logo=github&style=flat-square" alt="Release%20by%20date" /></a><img src="https://img.shields.io/github/last-commit/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Commit" /><a href="https%3A%2F%2Fgithub.com%2Fhoverkraft-tech%2Fci-github-container%2Fissues"><img src="https://img.shields.io/github/issues/hoverkraft-tech/ci-github-container?logo=github&style=flat-square" alt="Open%20Issues" /></a><img src="https://img.shields.io/github/downloads/hoverkraft-tech/ci-github-container/total?logo=github&style=flat-square" alt="Downloads" />

<!-- end badges -->
<!-- start description -->

Action to test a Helm chart. Mainly using [helm/chart-testing-action](https://github.com/helm/chart-testing-action)

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container@0.17.0
  with:
    # Description: Working directory
    #
    # Default: ${{ github.workspace }}
    working-directory: ""

    # Description: Set values for Helm chart. Multiple values can be set using
    # multiline string. Example: key1=value1 key2=value2
    #
    helm-set: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                      | **Description**                                                                                                                      | **Default**                          | **Required** |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ------------ |
| <code>working-directory</code> | Working directory                                                                                                                    | <code>${{ github.workspace }}</code> | **false**    |
| <code>helm-set</code>          | Set values for Helm chart.<br />Multiple values can be set using multiline string.<br />Example:<br /> key1=value1<br /> key2=value2 |                                      | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| **Output** | **Description** | **Default** | **Required** |
| ---------- | --------------- | ----------- | ------------ |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

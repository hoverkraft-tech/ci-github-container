<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:check-circle color:gray-dark>" /> GitHub Action: Test Helm Chart

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

Action to test a Helm chart. Mainly using [helm/chart-testing-action](https://github.com/helm/chart-testing-action)

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container@0.20.2
  with:
    # Description: Working directory
    #
    # Default: ${{ github.workspace }}
    working-directory: ""

    # Description: Set values for Helm chart. Multiple values can be set using
    # multiline string. Example: key1=value1 key2=value2
    #
    helm-set: ""

    # Description: List of Helm repositories to add before testing charts. See
    # <https://helm.sh/docs/helm/helm_repo_add/>.
    #
    helm-repositories: ""

    # Description: OCI registry where to pull and push images
    #
    # Default: ghcr.io
    oci-registry: ""

    # Description: Username used to log against the OCI registry. See
    # <https://github.com/docker/login-action#usage>.
    #
    # Default: ${{ github.repository_owner }}
    oci-registry-username: ""

    # Description: Password or personal access token used to log against the OCI
    # registry. Can be passed in using "secrets.GITHUB_TOKEN". See
    # <https://github.com/docker/login-action#usage>.
    #
    # Default: ${{ github.token }}
    oci-registry-password: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                          | **Description**                                                                                                                                                                      | **Default**                                 | **Required** |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ------------ |
| <code>working-directory</code>     | Working directory                                                                                                                                                                    | <code>${{ github.workspace }}</code>        | **false**    |
| <code>helm-set</code>              | Set values for Helm chart.<br />Multiple values can be set using multiline string.<br />Example:<br /> key1=value1<br /> key2=value2                                                 |                                             | **false**    |
| <code>helm-repositories</code>     | List of Helm repositories to add before testing charts.<br />See <https://helm.sh/docs/helm/helm_repo_add/>.                                                                         |                                             | **false**    |
| <code>oci-registry</code>          | OCI registry where to pull and push images                                                                                                                                           | <code>ghcr.io</code>                        | **false**    |
| <code>oci-registry-username</code> | Username used to log against the OCI registry.<br />See <https://github.com/docker/login-action#usage>.                                                                              | <code>${{ github.repository_owner }}</code> | **false**    |
| <code>oci-registry-password</code> | Password or personal access token used to log against the OCI registry.<br />Can be passed in using "secrets.GITHUB_TOKEN".<br />See <https://github.com/docker/login-action#usage>. | <code>${{ github.token }}</code>            | **false**    |

<!-- end inputs -->
<!-- start outputs -->

| **Output** | **Description** | **Default** | **Required** |
| ---------- | --------------- | ----------- | ------------ |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

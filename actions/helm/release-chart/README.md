<!-- start title -->

# <img src=".github/ghadocs/branding.svg" width="60px" align="center" alt="branding<icon:upload-cloud color:gray-dark>" /> GitHub Action: Release Helm Chart

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

Action to release a Helm chart to OCI registry

<!-- end description -->
<!-- start contents -->
<!-- end contents -->

## Usage

<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container@0.17.4
  with:
    # Description: OCI registry where to push chart. See
    # <https://github.com/appany/helm-oci-chart-releaser#usage>.
    #
    # Default: ghcr.io
    oci-registry: ""

    # Description: OCI registry username. See
    # <https://github.com/appany/helm-oci-chart-releaser#usage>.
    #
    # Default: ${{ github.repository_owner }}
    oci-registry-username: ""

    # Description: OCI registry password. See
    # <https://github.com/appany/helm-oci-chart-releaser#usage>.
    #
    # Default: ${{ github.token }}
    oci-registry-password: ""

    # Description: Chart name to release
    #
    chart: ""

    # Description: Path to the chart to release
    #
    path: ""

    # Description: Define charts values to be filled. Format:
    # `[{ file, path, value }]`. Example: [ { "file":
    # "charts/application/charts/api/values.yaml", "path": ".image.registry", "value":
    # "ghcr.io" } ]. See <https://mikefarah.gitbook.io/yq/>
    #
    values: ""

    # Description: List of Helm repositories to add before release charts. See
    # <https://helm.sh/docs/helm/helm_repo_add/>.
    #
    helm-repositories: ""

    # Description: The release tag to set to chart
    #
    tag: ""
```

<!-- end usage -->

## Permissions

This action requires the following permissions on the repository:

- `contents: read`: to read the chart files
- `packages: write`: to publish the chart to the OCI registry (required for GitHub Package registry only)

## Inputs

<!-- start inputs -->

| **Input**                          | **Description**                                                                                                                                                                                                                                                                          | **Default**                                 | **Required** |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| <code>oci-registry</code>          | OCI registry where to push chart.<br />See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                                                                    | <code>ghcr.io</code>                        | **true**     |
| <code>oci-registry-username</code> | OCI registry username.<br />See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                                                                               | <code>${{ github.repository_owner }}</code> | **true**     |
| <code>oci-registry-password</code> | OCI registry password.<br />See <https://github.com/appany/helm-oci-chart-releaser#usage>.                                                                                                                                                                                               | <code>${{ github.token }}</code>            | **true**     |
| <code>chart</code>                 | Chart name to release                                                                                                                                                                                                                                                                    |                                             | **true**     |
| <code>path</code>                  | Path to the chart to release                                                                                                                                                                                                                                                             |                                             | **true**     |
| <code>values</code>                | Define charts values to be filled.<br />Format: <code>[{ file, path, value }]</code>.<br />Example: [<br /> {<br /> "file": "charts/application/charts/api/values.yaml",<br /> "path": ".image.registry", "value": "ghcr.io"<br /> }<br />].<br />See <https://mikefarah.gitbook.io/yq/> |                                             | **false**    |
| <code>helm-repositories</code>     | List of Helm repositories to add before release charts.<br />See <https://helm.sh/docs/helm/helm_repo_add/>.                                                                                                                                                                             |                                             | **false**    |
| <code>tag</code>                   | The release tag to set to chart                                                                                                                                                                                                                                                          |                                             | **true**     |

<!-- end inputs -->
<!-- start outputs -->

| **Output**         | **Description**                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| <code>image</code> | Chart image (Default '{registry}/{repository}/{image}:{tag}').<br />See <https://github.com/appany/helm-oci-chart-releaser>. |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

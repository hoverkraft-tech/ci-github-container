<!-- start title -->

# GitHub Action: Release Helm Chart

<!-- end title -->
<!-- start description -->

Action to release a Helm chart to OCI registry

<!-- end description -->
<!-- start contents -->
<!-- end contents -->
<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/helm/release-chart@v0.11.1
  with:
    # OCI registry where to push chart. See [https://github.com/appany/helm-oci-chart-releaser#usage](https://github.com/appany/helm-oci-chart-releaser#usage)
    # Default: ghcr.io
    oci-registry: ""

    # OCI registry username. See [https://github.com/appany/helm-oci-chart-releaser#usage](https://github.com/appany/helm-oci-chart-releaser#usage)
    # Default: ${{ github.repository_owner }}
    oci-registry-username: ""

    # OCI registry password. See [https://github.com/appany/helm-oci-chart-releaser#usage](https://github.com/appany/helm-oci-chart-releaser#usage)
    # Default: ${{ github.token }}
    oci-registry-password: ""

    # Chart name to release
    chart: ""

    # Path to the chart to release
    path: ""

    # Define charts values to be filled. [{ file, path, value }]. Example: [{ "file":
    # "charts/application/charts/api/values.yaml", "path": ".image.registry", "value":
    # "ghcr.io" }]. See [https://mikefarah.gitbook.io/yq/](https://mikefarah.gitbook.io/yq/)
    values: ""

    # List of Helm repositories to add before release charts. See
    # [https://helm.sh/docs/helm/helm_repo_add/](https://helm.sh/docs/helm/helm_repo_add/)
    helm-repositories: ""

    # GitHub token to use latest version of helm. See [https://github.com/Azure/setup-helm](https://github.com/Azure/setup-helm)
    # Default: ${{ github.token }}
    github-token: ""

    # The release tag to set to chart
    tag: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                              | **Description**                                                                                                                                                                                                                                         | **Default**                                 | **Required** |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| **<code>oci-registry</code>**          | OCI registry where to push chart. See [https://github.com/appany/helm-oci-chart-releaser#usage](https://github.com/appany/helm-oci-chart-releaser#usage)                                                                                                | <code>ghcr.io</code>                        | **true**     |
| **<code>oci-registry-username</code>** | OCI registry username. See [https://github.com/appany/helm-oci-chart-releaser#usage](https://github.com/appany/helm-oci-chart-releaser#usage)                                                                                                           | <code>${{ github.repository_owner }}</code> | **true**     |
| **<code>oci-registry-password</code>** | OCI registry password. See [https://github.com/appany/helm-oci-chart-releaser#usage](https://github.com/appany/helm-oci-chart-releaser#usage)                                                                                                           | <code>${{ github.token }}</code>            | **true**     |
| **<code>chart</code>**                 | Chart name to release                                                                                                                                                                                                                                   |                                             | **true**     |
| **<code>path</code>**                  | Path to the chart to release                                                                                                                                                                                                                            |                                             | **true**     |
| **<code>values</code>**                | Define charts values to be filled. [{ file, path, value }]. Example: [{ "file": "charts/application/charts/api/values.yaml", "path": ".image.registry", "value": "ghcr.io" }]. See [https://mikefarah.gitbook.io/yq/](https://mikefarah.gitbook.io/yq/) |                                             | **false**    |
| **<code>helm-repositories</code>**     | List of Helm repositories to add before release charts. See [https://helm.sh/docs/helm/helm_repo_add/](https://helm.sh/docs/helm/helm_repo_add/)                                                                                                        |                                             | **false**    |
| **<code>github-token</code>**          | GitHub token to use latest version of helm. See [https://github.com/Azure/setup-helm](https://github.com/Azure/setup-helm)                                                                                                                              | <code>${{ github.token }}</code>            | **true**     |
| **<code>tag</code>**                   | The release tag to set to chart                                                                                                                                                                                                                         |                                             | **true**     |

<!-- end inputs -->
<!-- start outputs -->

| \***\*Output\*\*** | \***\*Description\*\***                                                                                                                                                   | \***\*Default\*\*** | \***\*Required\*\*** |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------- |
| <code>image</code> | Chart image (Default '{registry}/{repository}/{image}:{tag}'). See [https://github.com/appany/helm-oci-chart-releaser](https://github.com/appany/helm-oci-chart-releaser) | undefined           | undefined            |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

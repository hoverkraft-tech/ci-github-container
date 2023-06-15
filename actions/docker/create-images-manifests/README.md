<!-- start title -->

# GitHub Action: Create images manifests

<!-- end title -->
<!-- start description -->

Action to create built images manifests

<!-- end description -->
<!-- start contents -->
<!-- end contents -->

If default GitHub token is used, the following permissions are required:

```yml
permissions:
  contents: read
  packages: write
```

<!-- start usage -->

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/create-images-manifests@v0.7.0
  with:
    # OCI registry where to pull and push images
    # Default: ghcr.io
    oci-registry: ""

    # Username used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)
    # Default: ${{ github.repository_owner }}
    oci-registry-username: ""

    # Password or personal access token used to log against the OCI registry. Can be
    # passed in using "secrets.GITHUB_TOKEN". See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)
    # Default: ${{ github.token }}
    oci-registry-password: ""

    # Built images names and tags. Example: { "application": { "name": "application",
    # "registry": "ghcr.io", "repository": "my-org/my-repo/application", "tags":
    # ["pr-63", "pr-63-5222075"], "images": ["ghcr.io/my-org/my-repo/application:pr-63","ghcr.io/my-org/my-repo/application:pr-63-5222075"], "platforms":[ {"name":"application","images":["ghcr.io/my-org/my-repo/application:pr-63-linux-arm64"],"tagSuffix":"-linux-arm64","platform":"linux/arm64"}, {"name":"application","images":["ghcr.io/my-org/my-repo/application:pr-63-linux-amd64"],"tagSuffix":"-linux-amd64","platform":"linux/amd64"}] } } }
    built-images: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                              | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | **Default**                                 | **Required** |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| **<code>oci-registry</code>**          | OCI registry where to pull and push images                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | <code>ghcr.io</code>                        | **true**     |
| **<code>oci-registry-username</code>** | Username used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | <code>${{ github.repository_owner }}</code> | **true**     |
| **<code>oci-registry-password</code>** | Password or personal access token used to log against the OCI registry. Can be passed in using "secrets.GITHUB_TOKEN". See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)                                                                                                                                                                                                                                                                                                                                                                                           | <code>${{ github.token }}</code>            | **true**     |
| **<code>built-images</code>**          | Built images names and tags. Example: { "application": { "name": "application", "registry": "ghcr.io", "repository": "my-org/my-repo/application", "tags": ["pr-63", "pr-63-5222075"], "images": ["ghcr.io/my-org/my-repo/application:pr-63","ghcr.io/my-org/my-repo/application:pr-63-5222075"], "platforms":[ {"name":"application","images":["ghcr.io/my-org/my-repo/application:pr-63-linux-arm64"],"tagSuffix":"-linux-arm64","platform":"linux/arm64"}, {"name":"application","images":["ghcr.io/my-org/my-repo/application:pr-63-linux-amd64"],"tagSuffix":"-linux-amd64","platform":"linux/amd64"}] } } } |                                             | **true**     |

<!-- end inputs -->
<!-- start outputs -->

| \***\*Output\*\***      | \***\*Description\*\***                                                                                                                                 | \***\*Default\*\*** | \***\*Required\*\*** |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------- |
| <code>images</code>     | The images tags built. Example: ["ghcr.io/my-org/my-repo/application:pr-63-linux-amd64","ghcr.io/my-org/my-repo/application:pr-63-5222075-linux-amd64"] | undefined           | undefined            |
| <code>tag-suffix</code> | The platform tag suffix. Example: "-linux-amd64"                                                                                                        | undefined           | undefined            |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

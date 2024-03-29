<!-- start branding -->
<!-- end branding -->
<!-- start title -->

# GitHub Action: Create images manifests

<!-- end title -->
<!-- start badges -->
<!-- end badges -->
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
- uses: hoverkraft-tech/ci-github-container/actions/docker/create-images-manifests@v0.11.2
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

    # Built images data. Example: { "application": { "name": "application", "image":
    # "ghcr.io/my-org/my-repo/application", "digest": "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "tags": ["ghcr.io/my-org/my-repo/application:pr-63-5222075","ghcr.io/my-org/my-repo/application:pr-63"] } }
    built-images: ""
```

<!-- end usage -->
<!-- start inputs -->

| **Input**                              | **Description**                                                                                                                                                                                                                                                                                                       | **Default**                                 | **Required** |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------ |
| **<code>oci-registry</code>**          | OCI registry where to pull and push images                                                                                                                                                                                                                                                                            | <code>ghcr.io</code>                        | **true**     |
| **<code>oci-registry-username</code>** | Username used to log against the OCI registry. See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)                                                                                                                                                                       | <code>${{ github.repository_owner }}</code> | **true**     |
| **<code>oci-registry-password</code>** | Password or personal access token used to log against the OCI registry. Can be passed in using "secrets.GITHUB_TOKEN". See [https://github.com/docker/login-action#usage](https://github.com/docker/login-action#usage)                                                                                               | <code>${{ github.token }}</code>            | **true**     |
| **<code>built-images</code>**          | Built images data. Example: { "application": { "name": "application", "image": "ghcr.io/my-org/my-repo/application", "digest": "sha256:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef", "tags": ["ghcr.io/my-org/my-repo/application:pr-63-5222075","ghcr.io/my-org/my-repo/application:pr-63"] } } |                                             | **true**     |

<!-- end inputs -->
<!-- start outputs -->

| \***\*Output\*\***      | \***\*Description\*\***                                                                                                                                 | \***\*Default\*\*** | \***\*Required\*\*** |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | -------------------- |
| <code>images</code>     | The images tags built. Example: ["ghcr.io/my-org/my-repo/application:pr-63-linux-amd64","ghcr.io/my-org/my-repo/application:pr-63-5222075-linux-amd64"] | undefined           | undefined            |
| <code>tag-suffix</code> | The platform tag suffix. Example: "-linux-amd64"                                                                                                        | undefined           | undefined            |

<!-- end outputs -->
<!-- start [.github/ghadocs/examples/] -->
<!-- end [.github/ghadocs/examples/] -->

<!-- header:start -->

# GitHub Reusable Workflow: Docker mirror image

<div align="center">
  <img src="../logo.svg" width="60px" align="center" alt="Docker mirror image" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Mirror a validated immutable image to another registry without rebuilding it.
Require successful source validation or promotion through the calling job's needs.
Pass a digest-qualified source and one explicit destination tag. The workflow
serializes writes to that destination and returns its verified immutable reference.
It preserves image manifests and indices, but does not copy separate signatures
or referrers. Source validation remains the caller's responsibility.

Registry credentials are supplied as secrets. The GitHub job token is used only
for ghcr.io sources; other private source registries require explicit credentials.
No credentials are needed to read public source registries. An optional environment
protects registry publication. No source checkout or application build is performed.

### Permissions

- **`contents`**: `read`
- **`packages`**: `read`

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
name: Docker mirror image
on:
  push:
    branches:
      - main
permissions: {}
jobs:
  docker-mirror-image:
    uses: hoverkraft-tech/ci-github-container/.github/workflows/docker-mirror-image.yml@a3584451e5b6a068b5857a940bd1901a0b203d54 # feat/docker-mirror-image
    permissions:
      contents: read
      packages: read
    secrets:
      # Optional private source registry username; overrides the input.
      source-registry-username: ""

      # Source credential. Defaults to the job token only for ghcr.io sources.
      source-registry-password: ""

      # Optional private destination registry username; overrides the input.
      destination-registry-username: ""

      # Credential authorized to publish the destination image.
      # This input is required.
      destination-registry-password: ""
    with:
      # Validated source image including an immutable SHA-256 digest.
      # This input is required.
      source-image: ""

      # Destination registry, repository and explicit tag.
      # This input is required.
      destination-image: ""

      # Source registry username. Defaults to the GitHub actor for ghcr.io.
      source-registry-username: ""

      # Destination registry username. Use the secret when sensitive.
      destination-registry-username: ""

      # Optional GitHub environment protecting destination publication.
      environment: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

### Workflow Call Inputs

| **Input**                           | **Description**                                                     | **Required** | **Type**   | **Default** |
| ----------------------------------- | ------------------------------------------------------------------- | ------------ | ---------- | ----------- |
| **`source-image`**                  | Validated source image including an immutable SHA-256 digest.       | **true**     | **string** | -           |
| **`destination-image`**             | Destination registry, repository and explicit tag.                  | **true**     | **string** | -           |
| **`source-registry-username`**      | Source registry username. Defaults to the GitHub actor for ghcr.io. | **false**    | **string** | -           |
| **`destination-registry-username`** | Destination registry username. Use the secret when sensitive.       | **false**    | **string** | -           |
| **`environment`**                   | Optional GitHub environment protecting destination publication.     | **false**    | **string** | -           |

<!-- inputs:end -->
<!-- outputs:start -->

## Outputs

| **Output**  | **Description**                                                 |
| ----------- | --------------------------------------------------------------- |
| **`image`** | Published destination qualified by the unchanged source digest. |

<!-- outputs:end -->

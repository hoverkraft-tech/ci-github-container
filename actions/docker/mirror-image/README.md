<!-- header:start -->

# ![Icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItY29weSIgY29sb3I9ImJsdWUiPjxyZWN0IHg9IjkiIHk9IjkiIHdpZHRoPSIxMyIgaGVpZ2h0PSIxMyIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PHBhdGggZD0iTTUgMTVINGEyIDIgMCAwIDEtMi0yVjRhMiAyIDAgMCAxIDItMmg5YTIgMiAwIDAgMSAyIDJ2MSI+PC9wYXRoPjwvc3ZnPg==) GitHub Action: Docker - Mirror image

<div align="center">
  <img src="../../../.github/logo.svg" width="60px" align="center" alt="Docker - Mirror image" />
</div>

---

<!-- header:end -->
<!-- overview:start -->

## Overview

Copy an immutable image to another registry without changing its digest.

Copy an already validated image to one explicit registry tag without rebuilding.
The source must include its immutable SHA-256 digest. Single-platform manifests
and multi-platform indexes retain their digest; a changed digest fails the action.
Registry signatures and referrers are not copied separately. Verify the source
before calling and use the shared mirror workflow to serialize destination writes.
Requires Docker and a Linux runner. Credentials are optional for local test registries.

<!-- overview:end -->
<!-- usage:start -->

## Usage

```yaml
- uses: hoverkraft-tech/ci-github-container/actions/docker/mirror-image@e8bd81eb506404d63f0304b02ff254e5fd2f0ce5 # feat/docker-mirror-image
  with:
    # Fully qualified source image including its SHA-256 digest.
    # This input is required.
    source-image: ""

    # Fully qualified destination image with an explicit tag.
    # This input is required.
    destination-image: ""

    # Source registry username, paired with its password.
    source-registry-username: ""

    # Source registry password or token. Empty skips authentication.
    source-registry-password: ""

    # Destination registry username, paired with its password.
    destination-registry-username: ""

    # Destination registry password or token. Empty skips authentication.
    destination-registry-password: ""
```

<!-- usage:end -->
<!-- inputs:start -->

## Inputs

| **Input**                           | **Description**                                                     | **Required** | **Default** |
| ----------------------------------- | ------------------------------------------------------------------- | ------------ | ----------- |
| **`source-image`**                  | Fully qualified source image including its SHA-256 digest.          | **true**     | -           |
| **`destination-image`**             | Fully qualified destination image with an explicit tag.             | **true**     | -           |
| **`source-registry-username`**      | Source registry username, paired with its password.                 | **false**    | -           |
| **`source-registry-password`**      | Source registry password or token. Empty skips authentication.      | **false**    | -           |
| **`destination-registry-username`** | Destination registry username, paired with its password.            | **false**    | -           |
| **`destination-registry-password`** | Destination registry password or token. Empty skips authentication. | **false**    | -           |

<!-- inputs:end -->
<!-- outputs:start -->

## Outputs

| **Output**  | **Description**                                           |
| ----------- | --------------------------------------------------------- |
| **`image`** | Destination tag qualified by the unchanged source digest. |

<!-- outputs:end -->

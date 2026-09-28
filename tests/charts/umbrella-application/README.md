# test-umbrella-application

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

An umbrella Helm chart for Kubernetes

## Requirements

| Repository                       | Name             | Version |
| -------------------------------- | ---------------- | ------- |
| file://./charts/app              | app              | 0.0.0   |
| <https://valkey.io/valkey-helm/> | database(valkey) | 0.12.0  |

## Values

| Key                                                                                        | Type   | Default                                                                           | Description |
| ------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------- | ----------- |
| app.enabled                                                                                | bool   | `true`                                                                            |             |
| database.auth.enabled                                                                      | bool   | `false`                                                                           |             |
| database.enabled                                                                           | bool   | `true`                                                                            |             |
| database.existingConfigmap                                                                 | string | `"database-custom-config"`                                                        |             |
| database.fullnameOverride                                                                  | string | `"database"`                                                                      |             |
| database.image.pullPolicy                                                                  | string | `"Always"`                                                                        |             |
| database.image.tag                                                                         | string | `"9.1.2@sha256:418652cfb58ef879d4978c33553735d7147016032d5aefaa14c828e611eb9dfd"` |             |
| database.initResources.limits.cpu                                                          | string | `"200m"`                                                                          |             |
| database.initResources.limits.memory                                                       | string | `"256Mi"`                                                                         |             |
| database.initResources.requests.cpu                                                        | string | `"100m"`                                                                          |             |
| database.initResources.requests.memory                                                     | string | `"128Mi"`                                                                         |             |
| database.namespaceOverride                                                                 | string | `"app-system"`                                                                    |             |
| database.networkPolicy.ingress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"app"`                                                                           |             |
| database.networkPolicy.ingress[0].ports[0].port                                            | int    | `6379`                                                                            |             |
| database.networkPolicy.ingress[0].ports[0].protocol                                        | string | `"TCP"`                                                                           |             |
| database.podSecurityContext.fsGroup                                                        | int    | `10001`                                                                           |             |
| database.podSecurityContext.runAsGroup                                                     | int    | `10001`                                                                           |             |
| database.podSecurityContext.runAsUser                                                      | int    | `10001`                                                                           |             |
| database.podSecurityContext.seccompProfile.type                                            | string | `"RuntimeDefault"`                                                                |             |
| database.readinessProbe.enabled                                                            | bool   | `true`                                                                            |             |
| database.resources.limits.cpu                                                              | string | `"200m"`                                                                          |             |
| database.resources.limits.memory                                                           | string | `"256Mi"`                                                                         |             |
| database.resources.requests.cpu                                                            | string | `"100m"`                                                                          |             |
| database.resources.requests.memory                                                         | string | `"128Mi"`                                                                         |             |
| database.securityContext.allowPrivilegeEscalation                                          | bool   | `false`                                                                           |             |
| database.securityContext.capabilities.drop[0]                                              | string | `"ALL"`                                                                           |             |
| database.securityContext.readOnlyRootFilesystem                                            | bool   | `true`                                                                            |             |
| database.securityContext.runAsGroup                                                        | int    | `10001`                                                                           |             |
| database.securityContext.runAsNonRoot                                                      | bool   | `true`                                                                            |             |
| database.securityContext.runAsUser                                                         | int    | `10001`                                                                           |             |
| database.securityContext.seccompProfile.type                                               | string | `"RuntimeDefault"`                                                                |             |
| global.fullnameOverride                                                                    | string | `""`                                                                              |             |
| global.nameOverride                                                                        | string | `""`                                                                              |             |

---

Autogenerated from chart metadata using [helm-docs v1.14.2](https://github.com/norwoodj/helm-docs/releases/v1.14.2)

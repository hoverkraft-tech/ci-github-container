# test-umbrella-application

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

An umbrella Helm chart for Kubernetes

## Requirements

| Repository                         | Name            | Version |
| ---------------------------------- | --------------- | ------- |
| file://./charts/app                | app             | 0.0.0   |
| https://charts.bitnami.com/bitnami | database(mysql) | 13.0.3  |

## Values

| Key                       | Type   | Default                       | Description |
| ------------------------- | ------ | ----------------------------- | ----------- |
| app.enabled               | bool   | `true`                        |             |
| database.auth.database    | string | `"test-umbrella-application"` |             |
| database.auth.username    | string | `"test-umbrella-application"` |             |
| database.enabled          | bool   | `true`                        |             |
| database.fullnameOverride | string | `"database"`                  |             |
| global.fullnameOverride   | string | `""`                          |             |
| global.nameOverride       | string | `""`                          |             |

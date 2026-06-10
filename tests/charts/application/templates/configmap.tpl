# jscpd:ignore-start
---
kind: Secret
apiVersion: v1
metadata:
  name: {{ template "test-application.fullname" . }}-config
  namespace: {{ .Values.namespace | default "app-system" }}
  labels:
    {{- include "test-application.labels" . | nindent 4 }}
type: Opaque
stringData:
  {{- with .Values.application }}
  DB_CONNECTION: {{ .dbConnection | quote }}
  DB_HOST: {{ .dbHost | quote }}
  DB_PORT: {{ .dbPort | quote }}
  DB_DATABASE: {{ .dbDatabase | quote }}
  DB_USERNAME: {{ .dbUsername | quote }}
  DB_PASSWORD: {{ .dbPassword | quote }}
  {{- end }}

# jscpd:ignore-end
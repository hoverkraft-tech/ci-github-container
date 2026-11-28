#!/bin/sh
set -eu

work=$(mktemp -d)
service_pid=
cleanup() {
	status=$?
	trap - EXIT
	if [ -n "$service_pid" ]; then
		kill "$service_pid" 2>/dev/null || true
		wait "$service_pid" 2>/dev/null || true
	fi
	if [ "$status" -ne 0 ]; then cat "$work/service.log" >&2; fi
	rm -rf "$work"
	exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# Keep startup, readiness and HTTP checks together; Goss checks can run concurrently.
/docker-entrypoint.sh nginx -g 'daemon off;' >"$work/service.log" 2>&1 &
service_pid=$!
curl --fail --silent --show-error --max-time 2 \
	--retry 10 --retry-connrefused --retry-delay 1 --retry-max-time 10 \
	--write-out '\nHTTP_STATUS=%{http_code}\n' \
	"${1:-http://127.0.0.1:8080/health/check/}"

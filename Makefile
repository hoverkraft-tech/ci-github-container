.PHONY: help

help: ## Display help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

lint: ## Execute linting
	$(call run_linter,)

lint-fix: ## Execute linting and fix
	$(call run_linter, \
		-e FIX_SPELL_CODESPELL=true \
		-e FIX_MARKDOWN=true \
		-e FIX_MARKDOWN_PRETTIER=true \
		-e FIX_NATURAL_LANGUAGE=true \
		-e FIX_SHELL_SHFMT=true \
		-e FIX_BIOME_LINT=true \
		-e FIX_BIOME_FORMAT=true \
	)

npm-audit-fix: ## Execute npm audit fix
	@set -uo pipefail; \
	overall_status=0; \
	packages="$$(find actions -type f -name package.json -not -path '*/node_modules/*' -print | sort)"; \
	echo "Running npm audit fix for package.json files under actions/ ..."; \
	for pkg in $$packages; do \
		pkg_dir="$$(dirname "$$pkg")"; \
		echo "---"; \
		npm install --prefix "$$pkg_dir"; \
		echo "npm audit fix in $$pkg_dir"; \
		if ! npm --prefix "$$pkg_dir" audit fix; then \
			overall_status=1; \
		fi; \
	done; \
	exit $$overall_status

ci: ## Execute CI tasks
	$(MAKE) npm-audit-fix || true
	$(MAKE) lint-fix

test-build-application: ## Build the test application image
	@docker buildx build \
		--push --platform linux/amd64,linux/arm64 \
		--target prod \
		-t ghcr.io/hoverkraft-tech/ci-github-container/application-test:0.1.0 ./tests/application

test-ct-install: ## Run ct install to install the test application
	@set -eu; \
	for command in ct helm kind kubectl docker; do \
		if ! command -v "$$command" >/dev/null 2>&1; then \
			echo "Error: '$$command' is required for Kind-based chart install tests"; \
			exit 1; \
		fi; \
	done; \
	KIND_CLUSTER="test-chart-$$(date +%s)"; \
	NAMESPACE="test-chart-$$(date +%s)"; \
	APP_IMAGE="ghcr.io/hoverkraft-tech/ci-github-container/application-test:0.1.0"; \
	trap 'exit_code=$$?; kubectl delete namespace "$$NAMESPACE" --ignore-not-found >/dev/null 2>&1 || true; if [ "$${TEST_CT_KEEP_KIND:-0}" != "1" ]; then kind delete cluster --name "$$KIND_CLUSTER" >/dev/null 2>&1 || true; else echo "Keeping Kind cluster $$KIND_CLUSTER for debugging"; fi; exit $$exit_code' EXIT; \
	echo "Building test image $$APP_IMAGE..."; \
	DOCKER_BUILDKIT=1 docker build --target prod --file tests/application/Dockerfile --tag "$$APP_IMAGE" tests/application; \
	echo "Creating Kind cluster '$$KIND_CLUSTER'..."; \
	kind create cluster --name "$$KIND_CLUSTER" >/dev/null; \
	echo "Loading image into Kind cluster..."; \
	kind load docker-image --name "$$KIND_CLUSTER" "$$APP_IMAGE" >/dev/null; \
	kubectl config use-context "kind-$$KIND_CLUSTER" >/dev/null; \
	kubectl create namespace "$$NAMESPACE" >/dev/null; \
	echo "Running ct install..."; \
	helm repo remove valkey-io >/dev/null 2>&1 || true; \
	ct install --config ct.yaml --namespace "$$NAMESPACE" --helm-extra-set-args "--set=namespace=$$NAMESPACE,image.registry=ghcr.io,image.repository=hoverkraft-tech/ci-github-container/application-test,image.tag=0.1.0,image.digest=,image.pullPolicy=IfNotPresent,application.healthCheckPath=/health/check"

define run_linter
	DEFAULT_WORKSPACE="$(CURDIR)"; \
	LINTER_IMAGE="linter:latest"; \
	VOLUME="$$DEFAULT_WORKSPACE:$$DEFAULT_WORKSPACE"; \
	docker build --build-arg UID=$(shell id -u) --build-arg GID=$(shell id -g) --tag $$LINTER_IMAGE .; \
	docker run \
		-e DEFAULT_WORKSPACE="$$DEFAULT_WORKSPACE" \
		-e FILTER_REGEX_INCLUDE="$(filter-out $@,$(MAKECMDGOALS))" \
		$(1) \
		-v $$VOLUME \
		--rm \
		$$LINTER_IMAGE
endef

#############################
# Argument fix workaround
#############################
%:
	@:
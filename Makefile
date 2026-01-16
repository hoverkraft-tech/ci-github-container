.PHONY: help

help: ## Display help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

lint: ## Execute linting
	$(call run_linter,)

lint-fix: ## Execute linting and fix
	$(call run_linter, \
		-e FIX_JSON_PRETTIER=true \
		-e FIX_JAVASCRIPT_PRETTIER=true \
		-e FIX_YAML_PRETTIER=true \
		-e FIX_MARKDOWN=true \
		-e FIX_MARKDOWN_PRETTIER=true \
		-e FIX_NATURAL_LANGUAGE=true)

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
	$(MAKE) npm-audit-fix
	$(MAKE) lint

test-build-application: ## Build the test application image
	@docker buildx build \
		--push --platform linux/amd64,linux/arm64 \
		--target prod \
		-t ghcr.io/hoverkraft-tech/ci-github-container/application-test:0.1.0 ./tests/application

test-ct-install: ## Run ct install to install the test application
	@ct install --config ct.yaml --helm-extra-set-args '--set=image.tag=0.1.0'

define run_linter
	DEFAULT_WORKSPACE="$(CURDIR)"; \
	LINTER_IMAGE="linter:latest"; \
	VOLUME="$$DEFAULT_WORKSPACE:$$DEFAULT_WORKSPACE"; \
	docker build --build-arg UID=$(shell id -u) --build-arg GID=$(shell id -g) --tag $$LINTER_IMAGE .; \
	docker run \
		-e DEFAULT_WORKSPACE="$$DEFAULT_WORKSPACE" \
		-e FILTER_REGEX_INCLUDE="$(filter-out $@,$(MAKECMDGOALS))" \
		-e IGNORE_GITIGNORED_FILES=true \
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
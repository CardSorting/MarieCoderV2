.PHONY: install build start dev test clean setup

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

build: ## Build the project
	npm run build

start: ## Start the production server
	npm start

dev: ## Start development server with hot reload
	npm run dev

test: ## Run tests
	npm test

lint: ## Run linter
	npm run lint

type-check: ## Run TypeScript type checking
	npm run type-check

clean: ## Clean build artifacts
	npm run clean
	rm -rf dist
	rm -rf logs
	rm -rf workspaces
	rm -rf .cline

setup: ## Initial setup (copy .env.example to .env)
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example"; \
		echo "Please edit .env with your configuration"; \
	else \
		echo ".env already exists"; \
	fi

docker-build: ## Build Docker image
	docker build -f docker/Dockerfile -t cline-backend:latest .

docker-run: ## Run Docker container
	docker-compose -f docker/docker-compose.yml up

docker-stop: ## Stop Docker containers
	docker-compose -f docker/docker-compose.yml down

# Cloud Run deployment targets
cloud-build: ## Submit build to Google Cloud Build
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID environment variable is required"; \
		echo "Usage: PROJECT_ID=your-project-id make cloud-build"; \
		exit 1; \
	fi
	gcloud builds submit --config=cloudbuild.yaml \
		--substitutions=_REGION=$${REGION:-us-central1}

cloud-deploy: ## Deploy to Cloud Run (requires PROJECT_ID and REGION env vars)
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID environment variable is required"; \
		echo "Usage: PROJECT_ID=your-project-id REGION=us-central1 make cloud-deploy"; \
		exit 1; \
	fi
	gcloud run deploy cline-backend \
		--image gcr.io/$(PROJECT_ID)/cline-backend:latest \
		--region $${REGION:-us-central1} \
		--platform managed \
		--allow-unauthenticated \
		--memory 2Gi \
		--cpu 2 \
		--timeout 300 \
		--max-instances 10 \
		--min-instances 0 \
		--port 8080 \
		--set-env-vars "NODE_ENV=production,PORT=8080,HOST=0.0.0.0"

cloud-logs: ## View Cloud Run logs
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID environment variable is required"; \
		exit 1; \
	fi
	gcloud run services logs read cline-backend \
		--region $${REGION:-us-central1} \
		--limit 50

cloud-url: ## Get Cloud Run service URL
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID environment variable is required"; \
		exit 1; \
	fi
	@gcloud run services describe cline-backend \
		--region $${REGION:-us-central1} \
		--format 'value(status.url)'


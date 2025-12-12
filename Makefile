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


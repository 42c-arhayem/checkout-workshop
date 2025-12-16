# Makefile for 42C Banking API

.PHONY: help check-openapi validate install clean start stop

help:
	@echo "42C Banking API - Available Commands"
	@echo "====================================="
	@echo "make check-openapi    - Check and generate OpenAPI spec if missing"
	@echo "make validate         - Validate OpenAPI spec structure"
	@echo "make install          - Install dependencies"
	@echo "make start            - Start the application"
	@echo "make stop             - Stop the application"
	@echo "make clean            - Clean generated files"

check-openapi:
	@echo "Checking OpenAPI specification..."
	@python3 scripts/check-openapi.py

validate: check-openapi
	@echo "OpenAPI validation complete"

install:
	@echo "Installing dependencies..."
	@cd backend/app && npm install

start:
	@echo "Starting 42C Banking API..."
	@cd backend/app && npm start

stop:
	@echo "Stopping Docker containers..."
	@docker-compose -f backend/docker/42c-bank.yaml down

clean:
	@echo "Cleaning generated files..."
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -delete
	@echo "Clean complete"

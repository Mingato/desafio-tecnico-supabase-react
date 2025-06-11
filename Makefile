# Makefile para Desafio Técnico
# Simplifica comandos Docker e desenvolvimento

.PHONY: help build up down logs clean dev prod install test lint

# Configurações
DOCKER_COMPOSE = docker-compose
DOCKER = docker
PROJECT_NAME = desafio-tecnico

# Ajuda
help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Desenvolvimento
dev: ## Inicia ambiente de desenvolvimento
	$(DOCKER_COMPOSE) --profile dev up app-dev

dev-bg: ## Inicia ambiente de desenvolvimento em background
	$(DOCKER_COMPOSE) --profile dev up -d app-dev

# Produção
prod: ## Inicia ambiente de produção
	$(DOCKER_COMPOSE) up -d

prod-logs: ## Inicia produção e segue logs
	$(DOCKER_COMPOSE) up

# Build
build: ## Faz build das imagens
	$(DOCKER_COMPOSE) build

build-no-cache: ## Faz build sem cache
	$(DOCKER_COMPOSE) build --no-cache

# Controle
up: ## Inicia todos os serviços
	$(DOCKER_COMPOSE) up -d

down: ## Para todos os serviços
	$(DOCKER_COMPOSE) down

restart: ## Reinicia todos os serviços
	$(DOCKER_COMPOSE) restart

# Logs
logs: ## Mostra logs de todos os serviços
	$(DOCKER_COMPOSE) logs -f

logs-app: ## Mostra logs do app
	$(DOCKER_COMPOSE) logs -f app

# Utilitários
ps: ## Lista containers
	$(DOCKER_COMPOSE) ps

shell: ## Acessa shell do container
	$(DOCKER_COMPOSE) exec app sh

# Limpeza
clean: ## Para containers e remove volumes
	$(DOCKER_COMPOSE) down -v

clean-all: ## Remove tudo (containers, volumes, imagens)
	$(DOCKER_COMPOSE) down -v --rmi all

prune: ## Limpa recursos Docker não utilizados
	$(DOCKER) system prune -a -f

# Desenvolvimento local
install: ## Instala dependências localmente
	npm install

start: ## Inicia aplicação localmente
	npm start

test: ## Executa testes
	npm test

lint: ## Executa linting
	npm run lint

lint-fix: ## Corrige problemas de linting
	npm run lint:fix

# Status
status: ## Mostra status dos containers
	@echo "=== Status dos Containers ==="
	$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "=== Uso de Recursos ==="
	$(DOCKER) stats --no-stream

# Deploy
deploy-prod: build prod ## Build e deploy em produção
	@echo "Aplicação deployada em: http://localhost:3000"

deploy-dev: dev ## Deploy em desenvolvimento
	@echo "Aplicação de desenvolvimento em: http://localhost:3001" 
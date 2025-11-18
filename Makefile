.PHONY: help install up down logs deploy clean test

help:
	@echo "Mini-AMM 项目管理命令"
	@echo ""
	@echo "使用方式: make [命令]"
	@echo ""
	@echo "可用命令:"
	@echo "  help       - 显示此帮助信息"
	@echo "  install    - 安装所有依赖"
	@echo "  up         - 启动所有服务"
	@echo "  down       - 停止所有服务"
	@echo "  logs       - 查看所有日志"
	@echo "  deploy     - 部署智能合约"
	@echo "  test       - 运行合约测试"
	@echo "  clean      - 清理所有数据"
	@echo "  restart    - 重启所有服务"
	@echo "  status     - 查看服务状态"

install:
	@echo "📦 安装依赖..."
	cd contracts && npm install
	cd subgraph && npm install
	cd frontend && npm install
	@echo "✅ 依赖安装完成"

up:
	@echo "🚀 启动服务..."
	docker-compose up -d
	@echo "✅ 服务启动完成"
	@echo "等待服务初始化..."
	sleep 10
	@make status

down:
	@echo "⏹️  停止服务..."
	docker-compose down
	@echo "✅ 服务已停止"

logs:
	@echo "📋 查看日志..."
	docker-compose logs -f

logs-bot:
	@echo "📋 查看 Bot 日志..."
	docker-compose logs -f bot

logs-hardhat:
	@echo "📋 查看 Hardhat 日志..."
	docker-compose logs -f hardhat

deploy:
	@echo "📝 部署智能合约..."
	cd contracts && npx hardhat run scripts/deploy.js --network localhost
	@echo "✅ 合约部署完成"
	@echo ""
	@echo "请更新 .env 文件中的合约地址"

deploy-subgraph:
	@echo "📊 部署 Subgraph..."
	cd subgraph && npm run codegen && npm run build
	cd subgraph && npm run create-local || true
	cd subgraph && npm run deploy-local
	@echo "✅ Subgraph 部署完成"

test:
	@echo "🧪 运行合约测试..."
	cd contracts && npx hardhat test
	@echo "✅ 测试完成"

clean:
	@echo "🧹 清理数据..."
	docker-compose down -v
	rm -rf data/
	rm -rf contracts/cache contracts/artifacts
	rm -rf subgraph/build subgraph/generated
	@echo "✅ 清理完成"

restart:
	@echo "🔄 重启服务..."
	docker-compose restart
	@echo "✅ 服务已重启"

restart-bot:
	@echo "🔄 重启 Bot..."
	docker-compose restart bot
	@echo "✅ Bot 已重启"

status:
	@echo "📊 服务状态:"
	@docker-compose ps

shell-bot:
	@echo "进入 Bot 容器..."
	docker-compose exec bot sh

shell-hardhat:
	@echo "进入 Hardhat 容器..."
	docker-compose exec hardhat sh

console:
	@echo "打开 Hardhat 控制台..."
	cd contracts && npx hardhat console --network localhost

format:
	@echo "🎨 格式化代码..."
	cd contracts && npx prettier --write .
	cd frontend && npm run format || true
	@echo "✅ 格式化完成"

setup: install
	@echo "⚙️  初始化项目..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ 创建 .env 文件"; \
	else \
		echo "⚠️  .env 文件已存在"; \
	fi
	@echo ""
	@echo "✅ 项目初始化完成"
	@echo ""
	@echo "下一步:"
	@echo "1. 运行 'make up' 启动服务"
	@echo "2. 运行 'make deploy' 部署合约"
	@echo "3. 更新 .env 文件中的合约地址"
	@echo "4. 运行 'make deploy-subgraph' 部署 Subgraph"
	@echo "5. 访问 http://localhost:3000"

dev: up deploy
	@echo "🎉 开发环境就绪！"
	@echo ""
	@echo "前端: http://localhost:3000"
	@echo "GraphQL: http://localhost:8001/subgraphs/name/mini-amm-subgraph"
	@echo "Hardhat: http://localhost:8545"

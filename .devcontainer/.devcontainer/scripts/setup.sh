#!/bin/bash

echo "🚀 Setting up Product Scout Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running in Codespaces
if [ "$CODESPACES" = "true" ]; then
    echo -e "${GREEN}✅ Running in GitHub Codespaces${NC}"
    
    # Set up environment variables for Codespaces
    export N8N_HOST="${CODESPACE_NAME}-5678.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    export WEBHOOK_URL="https://${CODESPACE_NAME}-5678.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/"
    
    echo -e "${BLUE}🌐 n8n will be available at: https://${N8N_HOST}${NC}"
    echo -e "${BLUE}🗄️ pgAdmin will be available at: https://${CODESPACE_NAME}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}${NC}"
else
    echo -e "${YELLOW}⚠️ Running locally${NC}"
    echo -e "${BLUE}🌐 n8n will be available at: http://localhost:5678${NC}"
    echo -e "${BLUE}🗄️ pgAdmin will be available at: http://localhost:8080${NC}"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from template...${NC}"
    cp .env.example .env
    
    # Generate random passwords
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    PGADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
    N8N_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    # Update .env file
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASSWORD}/" .env
    sed -i "s/PGADMIN_PASSWORD=.*/PGADMIN_PASSWORD=${PGADMIN_PASSWORD}/" .env
    sed -i "s/N8N_ENCRYPTION_KEY=.*/N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}/" .env
    
    echo -e "${GREEN}🔑 Generated secure passwords in .env file${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
npm install

# Make scripts executable
chmod +x scripts/*.sh

# Start services
echo -e "${YELLOW}🐳 Starting Docker services...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 45

# Check service health
echo -e "${BLUE}🔍 Checking service health...${NC}"

# Check PostgreSQL
if docker-compose -f docker-compose.dev.yml exec -T postgres pg_isready -U n8n > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
fi

# Check Redis
if docker-compose -f docker-compose.dev.yml exec -T redis redis-cli ping | grep -q "PONG" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis is not ready${NC}"
fi

# Check n8n
sleep 15
if curl -s "http://localhost:5678" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ n8n is ready${NC}"
else
    echo -e "${RED}❌ n8n is not ready - this is normal, it might take a few more seconds${NC}"
fi

# Install custom scripts dependencies
echo -e "${YELLOW}📦 Setting up custom scripts...${NC}"
cd custom-scripts
npm init -y > /dev/null 2>&1
npm install puppeteer axios cheerio pg redis dotenv > /dev/null 2>&1
cd ..

echo ""
echo -e "${GREEN}🎉 Setup complete! Your development environment is ready.${NC}"
echo ""
echo -e "${BLUE}📱 Access points:${NC}"
if [ "$CODESPACES" = "true" ]; then
    echo -e "${BLUE}   🌐 n8n Editor: https://${CODESPACE_NAME}-5678.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}${NC}"
    echo -e "${BLUE}   🗄️ pgAdmin: https://${CODESPACE_NAME}-8080.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}${NC}"
    echo -e "${BLUE}   📊 Database: ${CODESPACE_NAME}-5432.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}${NC}"
else
    echo -e "${BLUE}   🌐 n8n Editor: http://localhost:5678${NC}"
    echo -e "${BLUE}   🗄️ pgAdmin: http://localhost:8080${NC}"
    echo -e "${BLUE}   📊 Database: localhost:5432${NC}"
fi
echo -e "${BLUE}   🔌 PostgreSQL: localhost:5432 (user: n8n)${NC}"
echo -e "${BLUE}   🔴 Redis: localhost:6379${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "${YELLOW}   1. Configure your API keys in .env file${NC}"
echo -e "${YELLOW}   2. Open n8n editor and start creating workflows${NC}"
echo -e "${YELLOW}   3. Run 'npm run test-scrapers' to test custom scripts${NC}"
echo -e "${YELLOW}   4. Check the docs/ folder for detailed documentation${NC}"
echo ""
echo -e "${GREEN}🚀 Ready to build your Product Scout system!${NC}"

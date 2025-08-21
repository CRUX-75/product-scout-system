FROM mcr.microsoft.com/devcontainers/typescript-node:18

# Install additional tools
RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    curl \
    jq \
    vim \
    git \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages for development
RUN npm install -g \
    nodemon \
    pm2 \
    typescript \
    ts-node \
    @types/node \
    prettier

# Set up workspace
WORKDIR /workspace

# Set environment for development
ENV NODE_ENV=development
ENV CODESPACES=true

# Install Chrome for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    && rm -rf /var/lib/apt/lists/*

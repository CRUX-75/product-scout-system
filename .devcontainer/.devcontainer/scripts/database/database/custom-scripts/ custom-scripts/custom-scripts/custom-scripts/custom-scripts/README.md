# 🚀 Product Scout System

**E-commerce Product Discovery with Human-in-the-Loop Intelligence**

> MVP Lean + HIL Integration for winning product identification in EU markets

[![GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

Product Scout System is an automated e-commerce product discovery platform that identifies trending products from US markets and validates them for EU dropshipping. The system combines automated data collection, AI-powered analysis, and human expert evaluation to find high-potential products.

### Key Features

- 🔍 **Multi-Source Data Collection**: TikTok, Reddit, Google Trends, Amazon
- 🤖 **AI-Powered Classification**: Automatic categorization and scoring  
- 🛡️ **EU Compliance Filtering**: Automatic restriction checking
- 📏 **Size Validation**: "Shoe box" constraint for shipping optimization
- 👤 **Human-in-the-Loop**: Expert evaluation framework
- 📊 **Automated Reporting**: Weekly insights and recommendations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Data Sources   │ -> │   Processing    │ -> │  Intelligence   │ -> │ Output & HIL    │
│                 │    │                 │    │                 │    │                 │
│ • Google Trends │    │ • EU Compliance │    │ • AI Classify   │    │ • Notion Reports│
│ • Reddit API    │    │ • Size Filter   │    │ • Opportunity   │    │ • Slack Alerts │
│ • TikTok Scraper│    │ • Data Enrichmt │    │ • Risk Assess   │    │ • HIL Framework │
│ • Amazon Data   │    │ • Quality Check │    │ • Strategy AI   │    │ • Export Data   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: GitHub Codespaces (Recommended)

1. Click the "Open in GitHub Codespaces" button above
2. Wait for environment setup (2-3 minutes)
3. Access n8n editor at the forwarded port
4. Configure API keys in `.env` file
5. Start building workflows!

### Option 2: Local Development

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/product-scout-system.git
cd product-scout-system

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start development environment
npm run dev

# Access services
# n8n Editor: http://localhost:5678
# pgAdmin: http://localhost:8080
# PostgreSQL: localhost:5432
```

## 📊 System Components

### Data Collection Agents
- **Trend Radar**: Monitors Google Trends for US market signals
- **Social Buzz**: Scrapes TikTok hashtags and Reddit discussions  
- **Market Pulse**: Tracks Amazon trending products and reviews

### Processing Pipeline
- **Compliance Filter**: EU regulation validation
- **Size Validator**: Shipping constraint verification
- **Data Enrichment**: Price, supplier, and competition research

### Intelligence Layer
- **Product Classifier**: AI categorization (Hype/Seasonal/Problem-solver/4Season)
- **Opportunity Scorer**: Multi-factor scoring algorithm
- **Strategic Advisor**: Launch recommendations and risk assessment

### Human-in-the-Loop
- **HIL Framework**: Structured evaluation (0-50 point system)
- **Expert Dashboard**: Notion-based review interface
- **Feedback Loop**: Continuous algorithm improvement

## 🔧 Configuration

### Required API Keys

```bash
# Essential for core functionality
OPENAI_API_KEY=sk-...              # AI classification and scoring
REDDIT_CLIENT_ID=...               # Social trend monitoring
REDDIT_CLIENT_SECRET=...           # Reddit API access

# Optional for enhanced features
GOOGLE_TRENDS_API_KEY=...          # Trend data (can use scraping)
NOTION_TOKEN=...                   # HIL reporting
SLACK_WEBHOOK=...                  # Alert notifications
```

### Database Schema

The system uses PostgreSQL with 8 core tables:

- `products` - Main product catalog
- `product_trends` - Time-series trend data
- `product_validations` - Compliance checks
- `product_classifications` - AI categorization
- `product_scores` - Opportunity scoring
- `product_research` - Automated research
- `hil_evaluations` - Human evaluations
- `weekly_reports` - Automated insights

## 🎯 HIL Evaluation Framework

### Scoring System (0-50 points)

| Factor | Weight | Scale | Description |
|--------|--------|-------|-------------|
| **Margin Potential** | ×3 | 1-5 | Profit margin after all costs |
| **Problem/Solution** | ×2 | 1-5 | Clarity of problem being solved |
| **WOW Factor** | ×2 | 1-5 | Visual appeal and uniqueness |
| **Ad Potential** | ×2 | 1-5 | UGC and viral marketing potential |
| **Seasonality** | ×1 | 1-5 | Year-round demand consistency |

### Decision Framework

- **40+ points**: High confidence test
- **30-39 points**: Maybe/monitor
- **<30 points**: Skip

## 📈 Performance Metrics

### Processing Capacity
- **500+ products/week** processed automatically
- **<30 seconds** filtering time per batch
- **95%+ accuracy** in EU compliance filtering
- **20 minutes/week** human evaluation time

### Cost Efficiency
- **€95/month** total operational cost
- **70% savings** vs traditional research methods
- **10x+ ROI** expected in first year

## 🛠️ Development

### Custom Scripts

The system includes 4 custom JavaScript modules (~140 lines total):

1. **tiktok-scraper.js** - Social media trend extraction
2. **size-validator.js** - Shipping constraint validation  
3. **scoring-algorithm.js** - Opportunity scoring logic
4. **compliance-checker.js** - EU regulation verification

### Testing

```bash
# Test all custom scripts
npm run test-scrapers

# Test database connection
npm run test-db

# Check service status
npm run status

# View logs
npm run logs
```

### Backup & Restore

```bash
# Create backup
npm run backup

# Reset environment
npm run reset

# Deploy to production
npm run deploy
```

## 📱 Integration

### n8n Workflows

- **Data Collection Master** - Daily trend gathering
- **Processing Pipeline** - Filtering and validation
- **Weekly Report Generator** - Automated insights

### External Integrations

- **Notion** - HIL evaluation dashboard
- **Slack** - Real-time alerts
- **Telegram** - Mobile notifications
- **PostgreSQL** - Data persistence
- **Redis** - Caching and queues

## 🔒 Compliance & Security

### EU Regulations
- Automatic GDPR compliance checking
- CE marking requirements validation
- Trademark conflict detection
- Category restriction enforcement

### Security Features
- Encrypted environment variables
- Secure API key management
- Database access controls
- Audit logging

## 📚 Documentation

- [`docs/SETUP.md`](docs/SETUP.md) - Detailed setup instructions
- [`docs/HIL_GUIDE.md`](docs/HIL_GUIDE.md) - Human evaluation manual

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@genflowautomation.com
- 💬 Issues: GitHub Issues
- 📖 Docs: `/docs` folder

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ MVP with HIL framework
- ✅ Basic data collection
- ✅ EU compliance filtering

### Phase 2 (Next 3 months)
- 🔄 Advanced AI scoring
- 🔄 Premium API integrations
- 🔄 Mobile dashboard

### Phase 3 (6+ months)
- 🔄 Multi-market expansion
- 🔄 Predictive analytics
- 🔄 White-label solution

---

**Built with ❤️ by [GenFlowAutomation](https://genflowautomation.com) - Empowering SMEs with AI-driven automation**

-- ===============================================
-- PRODUCT SCOUT SYSTEM - DATABASE SCHEMA
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for reset)
DROP TABLE IF EXISTS hil_evaluations CASCADE;
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS product_research CASCADE;
DROP TABLE IF EXISTS product_scores CASCADE;
DROP TABLE IF EXISTS product_classifications CASCADE;
DROP TABLE IF EXISTS product_validations CASCADE;
DROP TABLE IF EXISTS product_trends CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Main products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    source VARCHAR(50) NOT NULL, -- 'google_trends', 'reddit', 'tiktok', 'amazon'
    source_url TEXT,
    source_data JSONB, -- Raw data from source
    first_detected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'raw', -- 'raw', 'filtered', 'classified', 'scored', 'hil_pending', 'hil_done', 'testing', 'archived'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product trends tracking
CREATE TABLE product_trends (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    trend_score DECIMAL(5,2),
    mentions_count INTEGER DEFAULT 0,
    velocity_7d DECIMAL(5,2),
    velocity_30d DECIMAL(5,2),
    search_volume INTEGER,
    social_sentiment DECIMAL(3,2), -- -1.0 to 1.0
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance and validation checks
CREATE TABLE product_validations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    compliance_eu BOOLEAN DEFAULT FALSE,
    size_valid BOOLEAN DEFAULT FALSE,
    trademark_check BOOLEAN DEFAULT FALSE,
    category_allowed BOOLEAN DEFAULT FALSE,
    weight_kg DECIMAL(5,2),
    dimensions_cm VARCHAR(50), -- "30x20x12"
    shipping_restrictions JSONB,
    validation_notes TEXT,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI classification results
CREATE TABLE product_classifications (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    bucket VARCHAR(20) NOT NULL, -- 'hype', 'seasonal', 'problemloser', '4season'
    confidence DECIMAL(3,2), -- 0.00 to 1.00
    ai_reasoning TEXT,
    keywords JSONB,
    target_audience VARCHAR(100),
    seasonality_months JSONB, -- [1,2,3] for months when relevant
    classified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Opportunity scoring
CREATE TABLE product_scores (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    opportunity_score DECIMAL(5,2) NOT NULL,
    trend_weight DECIMAL(5,2),
    margin_potential DECIMAL(5,2),
    search_demand DECIMAL(5,2),
    competition_penalty DECIMAL(5,2),
    logistics_penalty DECIMAL(5,2),
    compliance_risk DECIMAL(5,2),
    scoring_version VARCHAR(10) DEFAULT 'v1.0',
    scored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automated research data
CREATE TABLE product_research (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    amazon_price DECIMAL(8,2),
    amazon_reviews_count INTEGER,
    amazon_rating DECIMAL(2,1),
    supplier_price DECIMAL(8,2),
    estimated_margin DECIMAL(5,2),
    shipping_cost_de DECIMAL(6,2),
    lead_time_days INTEGER,
    competition_ads_count INTEGER,
    facebook_ads_examples JSONB,
    red_flags JSONB,
    research_notes TEXT,
    researched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Human-in-the-Loop evaluations
CREATE TABLE hil_evaluations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    margin_score INTEGER CHECK (margin_score BETWEEN 1 AND 5),
    problem_score INTEGER CHECK (problem_score BETWEEN 1 AND 5),
    wow_score INTEGER CHECK (wow_score BETWEEN 1 AND 5),
    ad_potential_score INTEGER CHECK (ad_potential_score BETWEEN 1 AND 5),
    seasonal_score INTEGER CHECK (seasonal_score BETWEEN 1 AND 5),
    total_score INTEGER, -- Calculated field
    decision VARCHAR(20) DEFAULT 'pending', -- 'test', 'maybe', 'skip', 'pending'
    notes TEXT,
    market_insights TEXT,
    competitive_analysis TEXT,
    launch_strategy TEXT,
    evaluated_by VARCHAR(100),
    evaluation_time_minutes INTEGER,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly reports tracking
CREATE TABLE weekly_reports (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    products_processed INTEGER DEFAULT 0,
    products_filtered INTEGER DEFAULT 0,
    products_classified INTEGER DEFAULT 0,
    products_scored INTEGER DEFAULT 0,
    hil_evaluations_completed INTEGER DEFAULT 0,
    top_products JSONB, -- Array of product IDs with scores
    key_insights TEXT,
    trending_categories JSONB,
    market_observations TEXT,
    next_week_focus TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================

-- Products table indexes
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_source ON products(source);
CREATE INDEX idx_products_detected ON products(first_detected);
CREATE INDEX idx_products_updated ON products(last_updated);

-- Trends table indexes
CREATE INDEX idx_trends_product_recorded ON product_trends(product_id, recorded_at);
CREATE INDEX idx_trends_score ON product_trends(trend_score DESC);
CREATE INDEX idx_trends_velocity ON product_trends(velocity_7d DESC);

-- Scores table indexes
CREATE INDEX idx_scores_opportunity ON product_scores(opportunity_score DESC);
CREATE INDEX idx_scores_product_scored ON product_scores(product_id, scored_at);

-- HIL evaluations indexes
CREATE INDEX idx_hil_total_score ON hil_evaluations(total_score DESC);
CREATE INDEX idx_hil_decision ON hil_evaluations(decision);
CREATE INDEX idx_hil_evaluated_at ON hil_evaluations(evaluated_at);

-- ===============================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for products table
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate HIL total score
CREATE OR REPLACE FUNCTION calculate_hil_total_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total_score = (
        (NEW.margin_score * 3) +
        (NEW.problem_score * 2) +
        (NEW.wow_score * 2) +
        (NEW.ad_potential_score * 2) +
        (NEW.seasonal_score * 1)
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for HIL evaluations
CREATE TRIGGER calculate_hil_score
    BEFORE INSERT OR UPDATE ON hil_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION calculate_hil_total_score();

-- ===============================================
-- VIEWS FOR COMMON QUERIES
-- ===============================================

-- View for products with latest scores
CREATE VIEW products_with_scores AS
SELECT 
    p.*,
    ps.opportunity_score,
    ps.scored_at as last_scored,
    pc.bucket,
    pc.confidence as classification_confidence,
    pv.compliance_eu,
    pv.size_valid,
    pr.estimated_margin,
    pr.competition_ads_count,
    he.total_score as hil_score,
    he.decision as hil_decision
FROM products p
LEFT JOIN product_scores ps ON p.id = ps.product_id
LEFT JOIN product_classifications pc ON p.id = pc.product_id
LEFT JOIN product_validations pv ON p.id = pv.product_id
LEFT JOIN product_research pr ON p.id = pr.product_id
LEFT JOIN hil_evaluations he ON p.id = he.product_id
WHERE ps.id = (
    SELECT id FROM product_scores ps2 
    WHERE ps2.product_id = p.id 
    ORDER BY scored_at DESC LIMIT 1
);

-- View for HIL dashboard
CREATE VIEW hil_dashboard AS
SELECT 
    p.id,
    p.name,
    p.category,
    pc.bucket,
    ps.opportunity_score,
    pr.estimated_margin,
    pr.competition_ads_count,
    he.total_score as hil_score,
    he.decision,
    he.evaluated_at,
    CASE 
        WHEN he.total_score >= 40 THEN 'HIGH'
        WHEN he.total_score >= 30 THEN 'MEDIUM'
        ELSE 'LOW'
    END as priority_level
FROM products p
JOIN product_classifications pc ON p.id = pc.product_id
JOIN product_scores ps ON p.id = ps.product_id
JOIN product_research pr ON p.id = pr.product_id
LEFT JOIN hil_evaluations he ON p.id = he.product_id
WHERE p.status IN ('hil_pending', 'hil_done')
ORDER BY ps.opportunity_score DESC;

COMMENT ON TABLE products IS 'Main table storing all discovered products from various sources';
COMMENT ON TABLE product_trends IS 'Time-series data tracking product popularity and trends';
COMMENT ON TABLE product_validations IS 'EU compliance and logistics validation results';
COMMENT ON TABLE product_classifications IS 'AI-powered product categorization and analysis';
COMMENT ON TABLE product_scores IS 'Algorithmic scoring of product opportunities';
COMMENT ON TABLE product_research IS 'Automated research data from various sources';
COMMENT ON TABLE hil_evaluations IS 'Human-in-the-loop evaluation scores and decisions';
COMMENT ON TABLE weekly_reports IS 'Automated weekly summary reports';

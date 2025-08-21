/**
 * Product Opportunity Scoring Algorithm
 * Calculates weighted opportunity scores for product evaluation
 */

class OpportunityScorer {
    constructor(weights = null) {
        // Default weights (must sum to 1.0)
        this.weights = weights || {
            trendVelocity: 0.30,    // How fast is it trending
            marginPotential: 0.25,  // Profit margin potential
            searchDemand: 0.20,     // Search volume and demand
            saturation: -0.15,      // Competition level (penalty)
            logisticsPenalty: -0.05, // Size/shipping issues (penalty)
            complianceRisk: -0.05   // EU compliance risks (penalty)
        };

        // Validation
        const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
        if (Math.abs(sum) > 0.01) { // Allow small floating point errors
            console.warn(`Warning: Weights sum to ${sum}, should be close to 0`);
        }
    }

    /**
     * Calculate trend velocity score (0-100)
     */
    calculateTrendVelocity(data) {
        const {
            velocity7d = 0,
            velocity30d = 0,
            mentionsCount = 0,
            socialSentiment = 0
        } = data;

        // Base score from velocity (7-day weighted more heavily)
        const velocityScore = Math.max(0, (velocity7d * 0.7 + velocity30d * 0.3));
        
        // Mentions volume bonus (logarithmic scale)
        const mentionsBonus = Math.min(30, Math.log10(mentionsCount + 1) * 10);
        
        // Sentiment bonus/penalty
        const sentimentBonus = socialSentiment * 10;

        const score = Math.min(100, velocityScore + mentionsBonus + sentimentBonus);
        return Math.max(0, score);
    }

    /**
     * Calculate margin potential score (0-100)
     */
    calculateMarginPotential(data) {
        const {
            supplierPrice = 0,
            estimatedRetailPrice = 0,
            shippingCost = 0,
            platformFees = 0
        } = data;

        if (supplierPrice <= 0 || estimatedRetailPrice <= 0) {
            return 0;
        }

        const totalCost = supplierPrice + shippingCost + platformFees;
        const margin = (estimatedRetailPrice - totalCost) / estimatedRetailPrice;
        const marginPercentage = margin * 100;

        // Score mapping:
        // 70%+ margin = 100 points
        // 50% margin = 80 points  
        // 35% margin = 60 points
        // 20% margin = 30 points
        // <20% margin = 0 points

        if (marginPercentage >= 70) return 100;
        if (marginPercentage >= 50) return 60 + (marginPercentage - 50) * 2;
        if (marginPercentage >= 35) return 40 + (marginPercentage - 35) * 1.33;
        if (marginPercentage >= 20) return 10 + (marginPercentage - 20) * 2;
        
        return Math.max(0, marginPercentage * 0.5);
    }

    /**
     * Calculate search demand score (0-100)
     */
    calculateSearchDemand(data) {
        const {
            searchVolume = 0,
            cpc = 0,
            keywordDifficulty = 50,
            seasonalTrend = 1
        } = data;

        // Base score from search volume (logarithmic)
        const volumeScore = Math.min(60, Math.log10(searchVolume + 1) * 15);
        
        // CPC indicates commercial value
        const cpcScore = Math.min(20, cpc * 10);
        
        // Lower keyword difficulty is better
        const difficultyPenalty = (keywordDifficulty - 50) * 0.2;
        
        // Seasonal adjustment
        const seasonalBonus = (seasonalTrend - 1) * 20;

        const score = volumeScore + cpcScore - difficultyPenalty + seasonalBonus;
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate saturation penalty (0-100, higher = more saturated)
     */
    calculateSaturation(data) {
        const {
            competitorCount = 0,
            adsDensity = 0,
            marketMaturity = 50,
            topPlayerDominance = 0
        } = data;

        // More competitors = higher saturation
        const competitorScore = Math.min(40, competitorCount * 2);
        
        // High ad density indicates saturated market
        const adsScore = Math.min(30, adsDensity * 3);
        
        // Market maturity penalty
        const maturityScore = (marketMaturity - 50) * 0.4;
        
        // Top player dominance
        const dominanceScore = topPlayerDominance * 0.3;

        const saturation = competitorScore + adsScore + maturityScore + dominanceScore;
        return Math.max(0, Math.min(100, saturation));
    }

    /**
     * Calculate logistics penalty (0-100)
     */
    calculateLogisticsPenalty(data) {
        const {
            sizeValid = true,
            weight = 0,
            shippingComplexity = 1,
            leadTimeDays = 7,
            returnRate = 0.05
        } = data;

        let penalty = 0;

        // Size penalty
        if (!sizeValid) penalty += 40;
        
        // Weight penalty (>1kg gets penalty)
        if (weight > 1) penalty += (weight - 1) * 15;
        
        // Shipping complexity
        penalty += (shippingComplexity - 1) * 20;
        
        // Lead time penalty (>14 days)
        if (leadTimeDays > 14) penalty += (leadTimeDays - 14) * 2;
        
        // Return rate penalty
        penalty += returnRate * 100;

        return Math.max(0, Math.min(100, penalty));
    }

    /**
     * Calculate compliance risk penalty (0-100)
     */
    calculateComplianceRisk(data) {
        const {
            euCompliant = true,
            trademarkRisk = false,
            categoryRestricted = false,
            certificationRequired = false,
            brandingIssues = false
        } = data;

        let risk = 0;

        if (!euCompliant) risk += 50;
        if (trademarkRisk) risk += 30;
        if (categoryRestricted) risk += 40;
        if (certificationRequired) risk += 25;
        if (brandingIssues) risk += 20;

        return Math.max(0, Math.min(100, risk));
    }

    /**
     * Calculate final opportunity score
     */
    calculateOpportunityScore(productData) {
        const scores = {
            trendVelocity: this.calculateTrendVelocity(productData.trends || {}),
            marginPotential: this.calculateMarginPotential(productData.economics || {}),
            searchDemand: this.calculateSearchDemand(productData.demand || {}),
            saturation: this.calculateSaturation(productData.competition || {}),
            logisticsPenalty: this.calculateLogisticsPenalty(productData.logistics || {}),
            complianceRisk: this.calculateComplianceRisk(productData.compliance || {})
        };

        // Calculate weighted score
        let finalScore = 0;
        for (const [factor, weight] of Object.entries(this.weights)) {
            finalScore += scores[factor] * weight;
        }

        // Ensure score is between 0-100
        finalScore = Math.max(0, Math.min(100, finalScore));

        return {
            finalScore: Math.round(finalScore * 100) / 100,
            componentScores: scores,
            weights: this.weights,
            grade: this.getGrade(finalScore)
        };
    }

    /**
     * Get letter grade for score
     */
    getGrade(score) {
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    /**
     * Batch score multiple products
     */
    scoreProducts(products) {
        return products.map(product => ({
            ...product,
            opportunityScore: this.calculateOpportunityScore(product)
        }));
    }
}

module.exports = { OpportunityScorer };

// CLI usage
if (require.main === module) {
    const scorer = new OpportunityScorer();
    
    const testProduct = {
        trends: { velocity7d: 25, velocity30d: 15, mentionsCount: 450, socialSentiment: 0.7 },
        economics: { supplierPrice: 8.5, estimatedRetailPrice: 29.99, shippingCost: 4.2 },
        demand: { searchVolume: 8500, cpc: 1.2, keywordDifficulty: 45 },
        competition: { competitorCount: 12, adsDensity: 8, marketMaturity: 60 },
        logistics: { sizeValid: true, weight: 0.3, leadTimeDays: 12 },
        compliance: { euCompliant: true, trademarkRisk: false }
    };

    const result = scorer.calculateOpportunityScore(testProduct);
    console.log('Opportunity Score Result:', result);
}

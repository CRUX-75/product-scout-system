class ScoringAlgorithm {
    constructor() {
        this.weights = {
            size_validation: 0.30,  // 30% - Muy importante para envío
            viral_potential: 0.25,  // 25% - Potencial TikTok
            profit_margin: 0.25,    // 25% - Rentabilidad
            market_demand: 0.20     // 20% - Demanda general
        };
    }

    calculateTotalScore(product, sizeValidation) {
        console.log(`🎯 Calculando score total para: ${product.name}`);
        
        const scores = {
            size_validation: sizeValidation.score,
            viral_potential: this.calculateViralScore(product),
            profit_margin: this.calculateProfitScore(product),
            market_demand: this.calculateDemandScore(product)
        };

        // Calcular score ponderado
        let totalScore = 0;
        for (const [metric, score] of Object.entries(scores)) {
            totalScore += score * this.weights[metric];
        }

        const result = {
            totalScore: Math.round(totalScore),
            breakdown: scores,
            recommendation: this.getRecommendation(totalScore),
            priority: this.getPriority(totalScore)
        };

        return result;
    }

    calculateViralScore(product) {
        if (!product.tiktok_data) return 50;
        
        let score = 0;
        const tiktok = product.tiktok_data;
        
        // Score basado en engagement rate
        score += Math.min(tiktok.engagement_rate * 500, 40);
        
        // Score basado en viral score
        score += Math.min(tiktok.viral_score * 0.6, 60);
        
        return Math.min(score, 100);
    }

    calculateProfitScore(product) {
        // Simulación de margen de beneficio
        const estimatedCost = product.price * 0.4; // 40% del precio
        const margin = ((product.price - estimatedCost) / product.price) * 100;
        
        if (margin >= 60) return 100;
        if (margin >= 50) return 85;
        if (margin >= 40) return 70;
        if (margin >= 30) return 50;
        return 30;
    }

    calculateDemandScore(product) {
        if (!product.tiktok_data) return 50;
        
        const views = product.tiktok_data.views;
        const viewsNum = this.parseViews(views);
        
        if (viewsNum >= 2000000) return 90;      // 2M+
        if (viewsNum >= 1000000) return 75;      // 1M+
        if (viewsNum >= 500000) return 60;       // 500K+
        if (viewsNum >= 100000) return 45;       // 100K+
        return 30;
    }

    parseViews(viewsString) {
        if (!viewsString) return 0;
        const num = parseFloat(viewsString.replace(/[^0-9.]/g, ''));
        if (viewsString.includes('M')) return num * 1000000;
        if (viewsString.includes('K')) return num * 1000;
        return num;
    }

    getRecommendation(score) {
        if (score >= 80) return "🔥 ALTA PRIORIDAD - Producto excelente";
        if (score >= 65) return "✅ BUENA OPCIÓN - Considerar seriamente";
        if (score >= 50) return "⚠️ EVALUAR - Analizar más detalles";
        return "❌ DESCARTAR - No recomendado";
    }

    getPriority(score) {
        if (score >= 80) return "ALTA";
        if (score >= 65) return "MEDIA";
        if (score >= 50) return "BAJA";
        return "DESCARTAR";
    }

    showResults(result, product) {
        console.log("\n🏆 SCORE FINAL:");
        console.log(`Producto: ${product.name}`);
        console.log(`Score Total: ${result.totalScore}/100`);
        console.log(`Prioridad: ${result.priority}`);
        console.log(`Recomendación: ${result.recommendation}`);
        
        console.log("\n📊 Desglose:");
        for (const [metric, score] of Object.entries(result.breakdown)) {
            const weight = Math.round(this.weights[metric] * 100);
            console.log(`  ${metric}: ${Math.round(score)}/100 (peso ${weight}%)`);
        }
    }
}

module.exports = ScoringAlgorithm;
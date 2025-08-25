const TikTokScraper = require('./tiktok-scraper');
const SizeValidator = require('./size-validator');
const ScoringAlgorithm = require('./scoring-algorithm');
const AgentBrain = require('./agent-brain');

class ProductScoutPipeline {
    constructor() {
        this.scraper = new TikTokScraper();
        this.validator = new SizeValidator();
        this.scorer = new ScoringAlgorithm();
        this.agent = new AgentBrain(); // 🧠 NUEVO: Agent Brain
    }

    async runFullPipeline() {
        console.log("🚀 INICIANDO PIPELINE CON AGENT BRAIN\n");
        console.log("=".repeat(50));
        
        try {
            // 1. Obtener productos
            await this.scraper.init();
            console.log("\n📡 FASE 1: Obtener productos trending");
            const products = await this.scraper.getTrendingProducts();
            
            // 2. Análisis técnico (como antes)
            console.log("\n🔍 FASE 2: Análisis técnico");
            const technicalResults = [];
            
            for (let product of products) {
                const sizeValidation = this.validator.validate(product);
                const totalScore = this.scorer.calculateTotalScore(product, sizeValidation);
                
                technicalResults.push({
                    product,
                    sizeValidation,
                    scoring: totalScore
                });
            }
            
            // 3. 🧠 DECISIÓN INTELIGENTE DEL AGENT
            console.log("\n🧠 FASE 3: ANÁLISIS INTELIGENTE DEL AGENT");
            const agentDecision = await this.agent.makeDecision(products, this.agent.getMemory());
            
            // 4. Resultado final combinado
            const finalResult = {
                timestamp: new Date().toISOString(),
                execution_mode: "Agent-Powered",
                technical_analysis: technicalResults,
                agent_decision: agentDecision,
                summary: {
                    total_products: products.length,
                    agent_top_pick: agentDecision.top_recommendation || technicalResults[0].product.name,
                    confidence_level: agentDecision.confidence_level || 75,
                    needs_human_review: agentDecision.human_review_required,
                    recommended_actions: agentDecision.recommended_actions || []
                }
            };
            
            // 5. Mostrar resultado final
            this.showAgentResults(finalResult);
            
            await this.scraper.close();
            console.log("\n✅ PIPELINE CON AGENT COMPLETADO");
            return finalResult;
            
        } catch (error) {
            console.error("❌ ERROR EN PIPELINE:", error.message);
            await this.scraper.close();
            throw error;
        }
    }

    showAgentResults(result) {
        console.log("\n" + "=".repeat(60));
        console.log("🧠 REPORTE INTELIGENTE DEL AGENT");
        console.log("=".repeat(60));
        
        console.log(`⏰ Timestamp: ${result.timestamp}`);
        console.log(`🎯 Producto Recomendado: ${result.summary.agent_top_pick}`);
        console.log(`📊 Confianza del Agent: ${result.summary.confidence_level}%`);
        console.log(`🤔 Requiere Revisión: ${result.summary.needs_human_review ? 'SÍ' : 'NO'}`);
        
        console.log("\n📋 ACCIONES RECOMENDADAS:");
        if (result.summary.recommended_actions.length > 0) {
            result.summary.recommended_actions.forEach((action, i) => {
                console.log(`${i + 1}. ${action}`);
            });
        } else {
            console.log("  - Continuar monitoreo automático");
        }
        
        console.log("\n💭 RAZONAMIENTO DEL AGENT:");
        console.log(`${result.agent_decision.reasoning}`);
        
        console.log("\n📊 PRODUCTOS TÉCNICOS ANALIZADOS:");
        result.technical_analysis.forEach((analysis, i) => {
            const product = analysis.product;
            const score = analysis.scoring.totalScore;
            console.log(`${i + 1}. ${product.name} - Score: ${score}/100`);
        });
    }
}

// Exportar para n8n
async function runForN8n(inputData = {}) {
    const pipeline = new ProductScoutPipeline();
    return await pipeline.runFullPipeline();
}

// Test directo
if (require.main === module) {
    (async () => {
        const pipeline = new ProductScoutPipeline();
        await pipeline.runFullPipeline();
    })();
}

module.exports = { ProductScoutPipeline, runForN8n };
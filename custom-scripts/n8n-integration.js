const ProductScoutPipeline = require('./main-pipeline');

class N8nIntegration {
    constructor() {
        this.pipeline = new ProductScoutPipeline();
    }

    // Función principal que n8n llamará
    async processProducts(inputData = {}) {
        console.log("🔗 N8N Integration iniciada");
        console.log("Input recibido:", JSON.stringify(inputData, null, 2));

        try {
            // Ejecutar pipeline completo
            const results = await this.pipeline.runFullPipeline();
            
            // Formatear respuesta para n8n
            const n8nResponse = this.formatForN8n(results);
            
            console.log("✅ Respuesta preparada para n8n");
            return n8nResponse;
            
        } catch (error) {
            console.error("❌ Error en integración n8n:", error.message);
            throw error;
        }
    }

    formatForN8n(results) {
        // Formatear datos para que n8n los pueda usar fácilmente
        const formatted = {
            timestamp: new Date().toISOString(),
            total_products_analyzed: results.length,
            top_product: null,
            all_products: [],
            summary: {
                high_priority_count: 0,
                medium_priority_count: 0,
                valid_size_count: 0
            }
        };

        // Procesar cada resultado
        results.forEach((result, index) => {
            const product = result.product;
            const scoring = result.scoring;
            const sizeValidation = result.sizeValidation;

            const productData = {
                rank: index + 1,
                name: product.name,
                price: product.price,
                score: scoring.totalScore,
                priority: scoring.priority,
                recommendation: scoring.recommendation,
                size_valid: sizeValidation.isValid,
                tiktok_views: product.tiktok_data.views,
                engagement_rate: product.tiktok_data.engagement_rate,
                viral_score: product.tiktok_data.viral_score,
                hashtags: product.tiktok_data.hashtags.join(", "),
                dimensions: `${product.dimensions.width}x${product.dimensions.height}x${product.dimensions.depth}cm`,
                weight: `${product.dimensions.weight}kg`,
                breakdown: scoring.breakdown
            };

            formatted.all_products.push(productData);

            // Actualizar contadores
            if (scoring.priority === 'ALTA') formatted.summary.high_priority_count++;
            if (scoring.priority === 'MEDIA') formatted.summary.medium_priority_count++;
            if (sizeValidation.isValid) formatted.summary.valid_size_count++;

            // Establecer top product (el primero ya está ordenado)
            if (index === 0) {
                formatted.top_product = productData;
            }
        });

        return formatted;
    }

    // Función para testing individual
    async testN8nIntegration() {
        console.log("🧪 TESTING N8N INTEGRATION\n");
        
        const testInput = {
            source: "n8n_test",
            parameters: {
                limit: 3,
                category: "tech"
            }
        };

        try {
            const result = await this.processProducts(testInput);
            
            console.log("\n📊 RESULTADO PARA N8N:");
            console.log("=".repeat(50));
            console.log(`⏰ Timestamp: ${result.timestamp}`);
            console.log(`📈 Productos analizados: ${result.total_products_analyzed}`);
            console.log(`🏆 Producto top: ${result.top_product.name} (${result.top_product.score}/100)`);
            console.log(`🔥 Alta prioridad: ${result.summary.high_priority_count} productos`);
            console.log(`📏 Tamaño válido: ${result.summary.valid_size_count} productos`);
            
            console.log("\n✅ INTEGRACIÓN N8N LISTA");
            return result;
            
        } catch (error) {
            console.error("❌ Test falló:", error.message);
            throw error;
        }
    }
}

// Función exportada que n8n puede llamar directamente
async function runForN8n(inputData = {}) {
    const integration = new N8nIntegration();
    return await integration.processProducts(inputData);
}

// Test si se ejecuta directamente
if (require.main === module) {
    (async () => {
        const integration = new N8nIntegration();
        await integration.testN8nIntegration();
    })();
}

module.exports = { N8nIntegration, runForN8n };
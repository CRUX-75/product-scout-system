const AgentBrain = require('./agent-brain');
const TikTokScraper = require('./tiktok-scraper');

async function testAgentBrain() {
    console.log('🧪 TESTING AGENT BRAIN\n');
    
    // Inicializar componentes
    const agent = new AgentBrain(); // API key se lee automáticamente
    const scraper = new TikTokScraper();
    
    try {
        // Obtener productos
        await scraper.init();
        const products = await scraper.getTrendingProducts();
        
        // Agent toma decisión
        const decision = await agent.makeDecision(products);
        
        // Mostrar resultados
        console.log('\n🧠 DECISIÓN DEL AGENT:');
        console.log('='.repeat(50));
        console.log(`🎯 Top Recomendación: ${decision.top_recommendation || 'No definido'}`);
        console.log(`📊 Confianza: ${decision.confidence_level || 0}%`);
        console.log(`🤔 Necesita revisión humana: ${decision.human_review_required ? 'SÍ' : 'NO'}`);
        
        console.log('\n📋 ACCIONES RECOMENDADAS:');
        if (decision.recommended_actions && decision.recommended_actions.length > 0) {
            decision.recommended_actions.forEach((action, i) => {
                console.log(`${i + 1}. ${action}`);
            });
        } else {
            console.log('No hay acciones definidas');
        }
        
        console.log('\n💭 RAZONAMIENTO:');
        console.log(`${decision.reasoning || 'Sin razonamiento disponible'}`);
        
        console.log('\n📊 PRODUCTOS ANALIZADOS:');
        products.forEach((product, i) => {
            console.log(`${i + 1}. ${product.name} - $${product.price} (Score: ${product.tiktok_data.viral_score})`);
        });
        
        await scraper.close();
        console.log('\n✅ TEST COMPLETADO');
        
    } catch (error) {
        console.error('❌ Error en test:', error.message);
    }
}

testAgentBrain();
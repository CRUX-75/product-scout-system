require('dotenv').config();
const https = require('https');
const DatabaseManager = require('./database-manager');

class AgentBrain {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
        this.memory = [];
        this.db = new DatabaseManager();
        this.criteria = {
            min_viral_score: 70,
            max_price: 200,
            min_engagement: 0.05,
            preferred_categories: ['tech', 'lifestyle', 'fitness']
        };
    }

    async makeDecision(productData, historicalData = []) {
        console.log('🧠 Agent Brain con memoria analizando productos...');
        
        try {
            // 1. Obtener datos históricos de la base de datos
            const dbHistory = await this.db.getHistoricalData(5);
            console.log(`📊 Consultando ${dbHistory.length} decisiones previas`);
            
            // 2. Obtener patrones de éxito
            const successPatterns = await this.db.getSuccessPatterns();
            console.log(`📈 Aplicando ${successPatterns.length} patrones de éxito`);
            
            // 3. Mejorar criterios basado en patrones
            await this.improveCriteriaFromPatterns(successPatterns);
            
            if (!this.apiKey) {
                console.log('⚠️ API Key no configurada - usando modo simulado mejorado');
                return this.simulatedAnalysisWithMemory(productData, dbHistory);
            }

            // 4. Análisis con Claude usando contexto histórico
            const analysis = await this.analyzeWithClaude(productData, dbHistory, successPatterns);
            
            const decision = {
                timestamp: new Date().toISOString(),
                products_analyzed: productData,
                top_recommendation: analysis.topProduct,
                confidence_level: analysis.confidence,
                reasoning: analysis.reasoning,
                recommended_actions: analysis.actions,
                human_review_required: analysis.needsHumanReview,
                execution_id: Date.now().toString(),
                patterns_used: successPatterns.length
            };

            // 5. Guardar decisión en base de datos
            const decisionId = await this.db.saveDecision(decision);
            decision.database_id = decisionId;

            this.memory.push(decision);
            console.log(`✅ Decisión tomada con confianza: ${decision.confidence_level}% (ID: ${decisionId})`);
            
            return decision;
            
        } catch (error) {
            console.error('❌ Error en análisis con memoria:', error.message);
            return this.simulatedAnalysisWithMemory(productData, []);
        }
    }

    async improveCriteriaFromPatterns(patterns) {
        console.log('🔄 Mejorando criterios basado en patrones históricos...');
        
        const viralHighPattern = patterns.find(p => p.pattern_value === 'viral_score_high');
        if (viralHighPattern && viralHighPattern.success_rate > 80) {
            this.criteria.min_viral_score = 80;
            console.log('📈 Subiendo viral score mínimo a 80 (éxito histórico: ' + viralHighPattern.success_rate + '%)');
        }
        
        // Más criterios pueden añadirse aquí basado en otros patrones
    }

    async analyzeWithClaude(products, historical, patterns) {
        console.log('🤖 Consultando con Claude usando memoria histórica...');
        
        const prompt = this.buildHistoricalPrompt(products, historical, patterns);
        const claudeResponse = await this.callClaudeAPI(prompt);
        return this.parseClaudeResponse(claudeResponse);
    }

    buildHistoricalPrompt(products, historical, patterns) {
        const historicalContext = historical.length > 0 ? 
            `DECISIONES HISTÓRICAS EXITOSAS:\n${JSON.stringify(historical.slice(0, 3), null, 2)}\n\n` : '';
        
        const patternsContext = patterns.length > 0 ?
            `PATRONES DE ÉXITO IDENTIFICADOS:\n${patterns.map(p => `${p.pattern_type}: ${p.pattern_value} (${p.success_rate}% éxito)`).join('\n')}\n\n` : '';

        return `Como experto en product scouting con memoria histórica, analiza estos productos:

${historicalContext}${patternsContext}PRODUCTOS ACTUALES:
${JSON.stringify(products, null, 2)}

CRITERIOS MEJORADOS (basados en éxito histórico):
- Viral score mínimo: ${this.criteria.min_viral_score}
- Precio máximo: $${this.criteria.max_price}
- Engagement mínimo: ${this.criteria.min_engagement}

IMPORTANTE: Usa el contexto histórico y patrones para mejorar tu análisis. Si un patrón tuvo 90% éxito, dale más peso.

RESPONDE SOLO JSON:
{
  "topProduct": "nombre del mejor producto",
  "confidence": 85,
  "reasoning": "análisis detallado considerando historial y patrones",
  "actions": ["acción 1", "acción 2", "acción 3"],
  "needsHumanReview": false,
  "historical_influence": "cómo el historial influyó en la decisión"
}`;
    }

    simulatedAnalysisWithMemory(products, historical) {
        console.log('🎭 Usando análisis simulado con memoria');
        
        let adjustedConfidence = 75;
        let reasoning = "Análisis simulado";
        
        if (historical.length > 0) {
            adjustedConfidence += historical.length * 2; // Más confianza con más historial
            reasoning = `Análisis simulado mejorado con ${historical.length} decisiones históricas como contexto`;
        }
        
        return {
            topProduct: products.length > 0 ? products[0].name : "No products",
            confidence: Math.min(adjustedConfidence, 95),
            reasoning: reasoning,
            actions: [
                "Investigar producto top (con contexto histórico)",
                "Aplicar patrones de éxito identificados", 
                "Validar con criterios mejorados"
            ],
            needsHumanReview: false,
            patterns_used: 0
        };
    }

    async addHumanFeedback(decisionId, feedback) {
        console.log('👤 Recibiendo feedback humano para aprendizaje...');
        
        try {
            await this.db.saveHumanFeedback(decisionId, feedback);
            console.log('🎓 Agent aprendió de feedback humano');
        } catch (error) {
            console.error('❌ Error procesando feedback:', error.message);
        }
    }

    // Métodos existentes (callClaudeAPI, parseClaudeResponse, etc.)
    async callClaudeAPI(prompt) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            });

            const options = {
                hostname: 'api.anthropic.com',
                port: 443,
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                }
            };

            const req = https.request(options, (res) => {
                let responseBody = '';
                
                res.on('data', (chunk) => {
                    responseBody += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(responseBody);
                        resolve(response);
                    } catch (error) {
                        reject(new Error('Error parsing Claude response'));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(data);
            req.end();
        });
    }

    parseClaudeResponse(response) {
        try {
            if (response.content && response.content[0]) {
                const text = response.content[0].text;
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
            
            throw new Error('No valid JSON in Claude response');
        } catch (error) {
            console.error('❌ Error parsing Claude response:', error.message);
            return this.simulatedAnalysisWithMemory([], []);
        }
    }

    async close() {
        await this.db.close();
    }

    getMemory() {
        return this.memory;
    }

    updateCriteria(newCriteria) {
        this.criteria = { ...this.criteria, ...newCriteria };
        console.log('🔄 Criterios actualizados:', this.criteria);
    }
}

module.exports = AgentBrain;
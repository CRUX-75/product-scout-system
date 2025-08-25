require('dotenv').config();
const { Pool } = require('pg');

class DatabaseManager {
    constructor() {
        this.pool = new Pool({
            user: 'n8n',
            host: 'localhost',
            database: 'n8n',
            password: 'n8n_secure_password_change_me',
            port: 5432,
        });
    }

    async saveDecision(decision) {
        console.log('💾 Guardando decisión en base de datos...');
        
        try {
            const query = `
                INSERT INTO agent_decisions 
                (products_analyzed, agent_recommendation, confidence_level, reasoning, actions, execution_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `;
            
            const values = [
                JSON.stringify(decision.products_analyzed || []),
                decision.top_recommendation || decision.agent_recommendation,
                decision.confidence_level,
                decision.reasoning,
                JSON.stringify(decision.recommended_actions || []),
                decision.execution_id || Date.now().toString()
            ];
            
            const result = await this.pool.query(query, values);
            const decisionId = result.rows[0].id;
            
            console.log(`✅ Decisión guardada con ID: ${decisionId}`);
            return decisionId;
            
        } catch (error) {
            console.error('❌ Error guardando decisión:', error.message);
            throw error;
        }
    }

    async getHistoricalData(limit = 10) {
        console.log('📊 Obteniendo datos históricos...');
        
        try {
            const query = `
                SELECT * FROM agent_decisions 
                ORDER BY timestamp DESC 
                LIMIT $1
            `;
            
            const result = await this.pool.query(query, [limit]);
            console.log(`📈 Encontrados ${result.rows.length} registros históricos`);
            
            return result.rows;
            
        } catch (error) {
            console.error('❌ Error obteniendo histórico:', error.message);
            return [];
        }
    }

    async saveHumanFeedback(decisionId, feedback) {
        console.log('👤 Guardando feedback humano...');
        
        try {
            const query = `
                INSERT INTO human_feedback 
                (decision_id, human_decision, actual_outcome, roi_percentage, lessons_learned)
                VALUES ($1, $2, $3, $4, $5)
            `;
            
            const values = [
                decisionId,
                feedback.decision, // APPROVED, REJECTED, MODIFIED
                feedback.outcome,
                feedback.roi_percentage,
                feedback.lessons_learned
            ];
            
            await this.pool.query(query, values);
            console.log('✅ Feedback guardado exitosamente');
            
            // Actualizar patrones de éxito
            await this.updateSuccessPatterns();
            
        } catch (error) {
            console.error('❌ Error guardando feedback:', error.message);
            throw error;
        }
    }

    async updateSuccessPatterns() {
        console.log('🔄 Actualizando patrones de éxito...');
        
        try {
            // Calcular success rate por viral score
            const viralQuery = `
                SELECT 
                    CASE 
                        WHEN (products_analyzed::jsonb->0->'tiktok_data'->>'viral_score')::int >= 80 THEN 'viral_score_high'
                        WHEN (products_analyzed::jsonb->0->'tiktok_data'->>'viral_score')::int >= 70 THEN 'viral_score_medium'
                        ELSE 'viral_score_low'
                    END as pattern_value,
                    COUNT(*) as total,
                    COUNT(CASE WHEN hf.human_decision = 'APPROVED' THEN 1 END) as approved
                FROM agent_decisions ad
                LEFT JOIN human_feedback hf ON ad.id = hf.decision_id
                WHERE hf.human_decision IS NOT NULL
                GROUP BY pattern_value
            `;
            
            const viralResult = await this.pool.query(viralQuery);
            
            for (const row of viralResult.rows) {
                const successRate = row.total > 0 ? (row.approved / row.total) * 100 : 0;
                
                await this.pool.query(`
                    INSERT INTO success_patterns (pattern_type, pattern_value, success_rate, sample_size)
                    VALUES ('viral_score', $1, $2, $3)
                    ON CONFLICT (pattern_type, pattern_value) 
                    DO UPDATE SET 
                        success_rate = $2,
                        sample_size = $3,
                        last_updated = CURRENT_TIMESTAMP
                `, [row.pattern_value, successRate, parseInt(row.total)]);
            }
            
            console.log('✅ Patrones actualizados');
            
        } catch (error) {
            console.error('❌ Error actualizando patrones:', error.message);
        }
    }

    async getSuccessPatterns() {
        try {
            const result = await this.pool.query(`
                SELECT * FROM success_patterns 
                ORDER BY success_rate DESC
            `);
            
            return result.rows;
            
        } catch (error) {
            console.error('❌ Error obteniendo patrones:', error.message);
            return [];
        }
    }

    async close() {
        await this.pool.end();
        console.log('🔒 Conexión a base de datos cerrada');
    }
}

module.exports = DatabaseManager;
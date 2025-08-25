// Estructura de datos estándar del sistema
const ProductData = {
    // Información básica
    id: "string",
    name: "string", 
    description: "string",
    price: 0,
    category: "string",
    
    // Dimensiones físicas
    dimensions: {
        width: 0,   // cm
        height: 0,  // cm
        depth: 0,   // cm
        weight: 0   // kg
    },
    
    // Datos de TikTok
    tiktok_data: {
        engagement_rate: 0,
        viral_score: 0,
        views: "string",
        hashtags: []
    },
    
    // Scoring
    scores: {
        size_validation: 0,
        viral_potential: 0,
        total_score: 0
    },
    
    // Compliance
    compliance: {
        is_compliant: true,
        violations: [],
        warnings: []
    }
};

module.exports = ProductData;
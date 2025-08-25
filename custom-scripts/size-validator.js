class SizeValidator {
    constructor() {
        // Límites máximos permitidos
        this.limits = {
            width: 30,   // cm
            height: 30,  // cm
            depth: 30,   // cm
            weight: 5    // kg
        };
    }

    validate(product) {
        console.log(`📏 Validando: ${product.name}`);
        
        const result = {
            isValid: true,
            violations: [],
            score: 100,
            recommendations: []
        };

        // Verificar dimensiones
        if (product.dimensions) {
            const d = product.dimensions;
            
            if (d.width > this.limits.width) {
                result.violations.push(`Ancho: ${d.width}cm (máx: ${this.limits.width}cm)`);
                result.isValid = false;
                result.score -= 25;
            }
            
            if (d.height > this.limits.height) {
                result.violations.push(`Alto: ${d.height}cm (máx: ${this.limits.height}cm)`);
                result.isValid = false;
                result.score -= 25;
            }
            
            if (d.depth > this.limits.depth) {
                result.violations.push(`Profundo: ${d.depth}cm (máx: ${this.limits.depth}cm)`);
                result.isValid = false;
                result.score -= 25;
            }
            
            if (d.weight > this.limits.weight) {
                result.violations.push(`Peso: ${d.weight}kg (máx: ${this.limits.weight}kg)`);
                result.isValid = false;
                result.score -= 25;
            }
        }

        // Generar recomendaciones
        if (result.isValid) {
            result.recommendations.push("✅ Producto cumple dimensiones");
        } else {
            result.recommendations.push("❌ Buscar producto más compacto");
        }

        return result;
    }

    showResults(validation, product) {
        console.log("\n📊 RESULTADOS:");
        console.log(`Producto: ${product.name}`);
        console.log(`Válido: ${validation.isValid ? "SÍ" : "NO"}`);
        console.log(`Score: ${validation.score}/100`);
        
        if (validation.violations.length > 0) {
            console.log("Problemas:");
            validation.violations.forEach(v => console.log(`  - ${v}`));
        }
        
        console.log("Recomendación:");
        validation.recommendations.forEach(r => console.log(`  ${r}`));
    }
}

module.exports = SizeValidator;
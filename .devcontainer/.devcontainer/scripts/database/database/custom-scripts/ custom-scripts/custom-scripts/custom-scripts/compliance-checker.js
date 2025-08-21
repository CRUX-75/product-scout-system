/**
 * EU Compliance Checker
 * Validates products against EU regulations and restrictions
 */

class ComplianceChecker {
    constructor() {
        this.restrictedCategories = [
            'electronics',
            'cosmetics', 
            'toys',
            'medical',
            'pharmaceutical',
            'food',
            'supplements',
            'weapons',
            'automotive-parts'
        ];

        this.restrictedKeywords = [
            // Electronics
            'battery', 'charger', 'usb', 'bluetooth', 'wifi', 'electronic',
            'led', 'lcd', 'screen', 'speaker', 'headphone', 'cable',
            
            // Cosmetics
            'cream', 'serum', 'lotion', 'makeup', 'skincare', 'beauty',
            'cosmetic', 'foundation', 'lipstick', 'moisturizer',
            
            // Toys/Kids
            'toy', 'kids', 'children', 'baby', 'infant', 'toddler',
            'plush', 'doll', 'game', 'puzzle',
            
            // Medical/Health
            'medical', 'health', 'medicine', 'supplement', 'vitamin',
            'treatment', 'therapy', 'cure', 'diagnosis',
            
            // Kitchen with licenses
            'knife', 'blade', 'cutter', 'slicer', 'pressure cooker',
            
            // Prohibited items
            'weapon', 'gun', 'knife', 'blade', 'explosive'
        ];

        this.requiresCertification = [
            'CE', 'RoHS', 'REACH', 'FCC', 'FDA'
        ];

        this.brandKeywords = [
            'apple', 'samsung', 'nike', 'adidas', 'sony', 'microsoft',
            'google', 'amazon', 'facebook', 'tesla', 'bmw', 'mercedes',
            'louis vuitton', 'gucci', 'prada', 'rolex', 'omega'
        ];
    }

    /**
     * Check if product category is restricted
     */
    checkCategory(category) {
        if (!category) return { valid: true, reason: '' };

        const categoryLower = category.toLowerCase();
        const restricted = this.restrictedCategories.some(cat => 
            categoryLower.includes(cat)
        );

        return {
            valid: !restricted,
            reason: restricted ? `Category "${category}" is restricted in EU` : ''
        };
    }

    /**
     * Check for restricted keywords in product name/description
     */
    checkKeywords(text) {
        if (!text) return { valid: true, flaggedKeywords: [] };

        const textLower = text.toLowerCase();
        const flaggedKeywords = this.restrictedKeywords.filter(keyword =>
            textLower.includes(keyword)
        );

        return {
            valid: flaggedKeywords.length === 0,
            flaggedKeywords,
            reason: flaggedKeywords.length > 0 
                ? `Contains restricted keywords: ${flaggedKeywords.join(', ')}`
                : ''
        };
    }

    /**
     * Check for trademark/brand issues
     */
    checkTrademarks(text) {
        if (!text) return { valid: true, flaggedBrands: [] };

        const textLower = text.toLowerCase();
        const flaggedBrands = this.brandKeywords.filter(brand =>
            textLower.includes(brand)
        );

        return {
            valid: flaggedBrands.length === 0,
            flaggedBrands,
            reason: flaggedBrands.length > 0
                ? `Potential trademark issues: ${flaggedBrands.join(', ')}`
                : ''
        };
    }

    /**
     * Check certification requirements
     */
    checkCertifications(product) {
        const { category = '', description = '' } = product;
        const text = (category + ' ' + description).toLowerCase();
        
        const requiredCerts = [];
        
        // CE marking required for many products
        if (text.includes('electronic') || text.includes('electrical')) {
            requiredCerts.push('CE', 'RoHS');
        }
        
        if (text.includes('toy') || text.includes('children')) {
            requiredCerts.push('CE', 'EN71');
        }
        
        if (text.includes('medical') || text.includes('health')) {
            requiredCerts.push('CE', 'FDA');
        }

        return {
            required: requiredCerts,
            complexity: requiredCerts.length > 0 ? 'high' : 'low',
            reason: requiredCerts.length > 0 
                ? `Requires certifications: ${requiredCerts.join(', ')}`
                : 'No special certifications required'
        };
    }

    /**
     * Comprehensive compliance check
     */
    checkCompliance(product) {
        const {
            name = '',
            description = '',
            category = '',
            source_url = ''
        } = product;

        const fullText = `${name} ${description}`.trim();

        // Run all checks
        const categoryCheck = this.checkCategory(category);
        const keywordCheck = this.checkKeywords(fullText);
        const trademarkCheck = this.checkTrademarks(fullText);
        const certificationCheck = this.checkCertifications(product);

        // Calculate overall compliance score
        let complianceScore = 100;
        const issues = [];

        if (!categoryCheck.valid) {
            complianceScore -= 50;
            issues.push(categoryCheck.reason);
        }

        if (!keywordCheck.valid) {
            complianceScore -= 30;
            issues.push(keywordCheck.reason);
        }

        if (!trademarkCheck.valid) {
            complianceScore -= 40;
            issues.push(trademarkCheck.reason);
        }

        if (certificationCheck.required.length > 0) {
            complianceScore -= 20;
            issues.push(certificationCheck.reason);
        }

        const isCompliant = complianceScore >= 70;

        return {
            compliant: isCompliant,
            score: Math.max(0, complianceScore),
            riskLevel: this.getRiskLevel(complianceScore),
            issues,
            details: {
                category: categoryCheck,
                keywords: keywordCheck,
                trademarks: trademarkCheck,
                certifications: certificationCheck
            },
            recommendations: this.getRecommendations(issues)
        };
    }

    /**
     * Get risk level based on compliance score
     */
    getRiskLevel(score) {
        if (score >= 90) return 'low';
        if (score >= 70) return 'medium';
        if (score >= 50) return 'high';
        return 'critical';
    }

    /**
     * Get recommendations based on issues
     */
    getRecommendations(issues) {
        const recommendations = [];

        if (issues.some(issue => issue.includes('Category'))) {
            recommendations.push('Consider switching to a non-restricted category');
        }

        if (issues.some(issue => issue.includes('trademark'))) {
            recommendations.push('Remove brand references or get proper licensing');
        }

        if (issues.some(issue => issue.includes('certification'))) {
            recommendations.push('Verify supplier has required certifications');
        }

        if (issues.some(issue => issue.includes('keywords'))) {
            recommendations.push('Modify product description to avoid restricted terms');
        }

        return recommendations;
    }

    /**
     * Batch check multiple products
     */
    checkBatch(products) {
        return products.map(product => ({
            ...product,
            complianceCheck: this.checkCompliance(product)
        }));
    }
}

module.exports = { ComplianceChecker };

// CLI usage
if (require.main === module) {
    const checker = new ComplianceChecker();
    
    const testProducts = [
        {
            name: 'Portable Phone Stand',
            description: 'Adjustable aluminum stand for smartphones',
            category: 'Electronics Accessories'
        },
        {
            name: 'Apple iPhone Charger',
            description: 'USB charging cable for Apple devices',
            category: 'Electronics'
        },
        {
            name: 'Yoga Mat',
            description: 'Non-slip exercise mat for yoga practice',
            category: 'Fitness'
        }
    ];

    testProducts.forEach(product => {
        const result = checker.checkCompliance(product);
        console.log(`${product.name}: ${result.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'} (${result.score}/100)`);
        if (result.issues.length > 0) {
            console.log(`  Issues: ${result.issues.join('; ')}`);
        }
    });
}

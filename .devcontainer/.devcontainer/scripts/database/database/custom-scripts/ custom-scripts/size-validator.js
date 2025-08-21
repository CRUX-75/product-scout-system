/**
 * Product Size Validator
 * Validates products against "shoe box" size constraints for EU shipping
 */

class SizeValidator {
    constructor() {
        // Standard shoe box dimensions in cm (reference)
        this.maxDimensions = {
            length: 30,
            width: 20,
            height: 12
        };
        
        // Maximum weight in kg for cost-effective shipping
        this.maxWeight = 2.0;
        
        // Volume limit in cubic cm
        this.maxVolume = this.maxDimensions.length * this.maxDimensions.width * this.maxDimensions.height; // 7200 cm³
    }

    /**
     * Parse dimension string into numbers
     * Supports formats: "30x20x12", "30 x 20 x 12", "30cm x 20cm x 12cm"
     */
    parseDimensions(dimensionString) {
        if (!dimensionString) return null;

        // Clean and normalize the string
        const cleaned = dimensionString
            .toLowerCase()
            .replace(/cm|mm|in|inch/g, '')
            .replace(/\s+/g, '')
            .trim();

        // Extract numbers
        const numbers = cleaned.match(/\d+(?:\.\d+)?/g);
        
        if (!numbers || numbers.length < 3) {
            return null;
        }

        return {
            length: parseFloat(numbers[0]),
            width: parseFloat(numbers[1]),
            height: parseFloat(numbers[2])
        };
    }

    /**
     * Validate if product fits within size constraints
     */
    validateSize(product) {
        const result = {
            valid: false,
            reason: '',
            dimensions: null,
            volume: 0,
            penalties: [],
            score: 0
        };

        // Parse dimensions
        const dimensions = this.parseDimensions(product.dimensions);
        if (!dimensions) {
            result.reason = 'Invalid or missing dimensions';
            return result;
        }

        result.dimensions = dimensions;
        result.volume = dimensions.length * dimensions.width * dimensions.height;

        // Check each dimension
        const exceedsLength = dimensions.length > this.maxDimensions.length;
        const exceedsWidth = dimensions.width > this.maxDimensions.width;
        const exceedsHeight = dimensions.height > this.maxDimensions.height;
        const exceedsVolume = result.volume > this.maxVolume;

        // Weight check
        const weight = parseFloat(product.weight) || 0;
        const exceedsWeight = weight > this.maxWeight;

        // Calculate penalties
        if (exceedsLength) {
            const excess = ((dimensions.length - this.maxDimensions.length) / this.maxDimensions.length * 100).toFixed(1);
            result.penalties.push(`Length exceeds by ${excess}%`);
        }

        if (exceedsWidth) {
            const excess = ((dimensions.width - this.maxDimensions.width) / this.maxDimensions.width * 100).toFixed(1);
            result.penalties.push(`Width exceeds by ${excess}%`);
        }

        if (exceedsHeight) {
            const excess = ((dimensions.height - this.maxDimensions.height) / this.maxDimensions.height * 100).toFixed(1);
            result.penalties.push(`Height exceeds by ${excess}%`);
        }

        if (exceedsWeight) {
            const excess = ((weight - this.maxWeight) / this.maxWeight * 100).toFixed(1);
            result.penalties.push(`Weight exceeds by ${excess}%`);
        }

        // Determine validity
        result.valid = !exceedsLength && !exceedsWidth && !exceedsHeight && !exceedsWeight;

        // Calculate penalty score (0-100, lower is better)
        if (result.valid) {
            // Calculate efficiency score (higher is better for smaller products)
            const volumeEfficiency = (this.maxVolume - result.volume) / this.maxVolume;
            const weightEfficiency = weight > 0 ? (this.maxWeight - weight) / this.maxWeight : 1;
            result.score = Math.round((volumeEfficiency + weightEfficiency) / 2 * 100);
        } else {
            // Penalty increases with how much it exceeds limits
            const volumePenalty = exceedsVolume ? (result.volume / this.maxVolume - 1) * 50 : 0;
            const weightPenalty = exceedsWeight ? (weight / this.maxWeight - 1) * 30 : 0;
            result.score = Math.max(0, 100 - volumePenalty - weightPenalty);
        }

        // Set reason
        if (result.valid) {
            result.reason = 'Fits within shoe box constraints';
        } else {
            result.reason = `Exceeds limits: ${result.penalties.join(', ')}`;
        }

        return result;
    }

    /**
     * Estimate shipping cost impact based on size
     */
    estimateShippingImpact(product) {
        const validation = this.validateSize(product);
        
        if (validation.valid) {
            return {
                costMultiplier: 1.0,
                shippingTier: 'standard',
                notes: 'Standard shipping rates apply'
            };
        }

        // Calculate cost multiplier for oversized items
        const volumeRatio = validation.volume / this.maxVolume;
        const weight = parseFloat(product.weight) || 0;
        const weightRatio = weight / this.maxWeight;

        let costMultiplier = 1.0;
        let shippingTier = 'standard';

        if (volumeRatio > 1.5 || weightRatio > 1.5) {
            costMultiplier = 2.5;
            shippingTier = 'oversized';
        } else if (volumeRatio > 1.2 || weightRatio > 1.2) {
            costMultiplier = 1.8;
            shippingTier = 'large';
        } else if (volumeRatio > 1.0 || weightRatio > 1.0) {
            costMultiplier = 1.4;
            shippingTier = 'medium-plus';
        }

        return {
            costMultiplier,
            shippingTier,
            notes: `${shippingTier} shipping required (${costMultiplier}x cost)`
        };
    }

    /**
     * Batch validate multiple products
     */
    validateBatch(products) {
        return products.map(product => ({
            ...product,
            sizeValidation: this.validateSize(product),
            shippingImpact: this.estimateShippingImpact(product)
        }));
    }
}

module.exports = { SizeValidator };

// CLI usage
if (require.main === module) {
    const validator = new SizeValidator();
    
    const testProducts = [
        { name: 'Phone Stand', dimensions: '20x15x10', weight: '0.3' },
        { name: 'Large Pillow', dimensions: '50x40x15', weight: '1.2' },
        { name: 'Tiny Gadget', dimensions: '5x3x2', weight: '0.1' }
    ];

    testProducts.forEach(product => {
        const result = validator.validateSize(product);
        console.log(`${product.name}: ${result.valid ? 'VALID' : 'INVALID'} - ${result.reason}`);
    });
}

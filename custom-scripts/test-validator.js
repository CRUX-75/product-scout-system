const SizeValidator = require('./size-validator');

console.log("🧪 TESTING SIZE VALIDATOR\n");

const validator = new SizeValidator();

// Test 1: Producto VÁLIDO
const goodProduct = {
    name: "Auriculares Bluetooth",
    dimensions: {
        width: 15,
        height: 10,
        depth: 5,
        weight: 0.2
    }
};

console.log("=== TEST 1: Producto Válido ===");
const result1 = validator.validate(goodProduct);
validator.showResults(result1, goodProduct);

// Test 2: Producto INVÁLIDO
const badProduct = {
    name: "Escritorio Gaming",
    dimensions: {
        width: 120,
        height: 75,
        depth: 60,
        weight: 25
    }
};

console.log("\n=== TEST 2: Producto Inválido ===");
const result2 = validator.validate(badProduct);
validator.showResults(result2, badProduct);

console.log("\n✅ TESTS COMPLETADOS");
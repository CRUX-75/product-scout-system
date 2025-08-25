console.log("Test basico funcionando");
console.log("Node version:", process.version);

try {
    const axios = require('axios');
    console.log("Axios - OK");
} catch (error) {
    console.log("ERROR:", error.message);
}
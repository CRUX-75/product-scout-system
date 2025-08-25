require('dotenv').config();

console.log('🔍 Testing environment variables...');
console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('API Key starts with sk-ant:', process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant'));
console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);

// Test constructor del Agent
const AgentBrain = require('./agent-brain');
const agent = new AgentBrain();
console.log('Agent has API key:', !!agent.apiKey);
console.log('Agent API key length:', agent.apiKey?.length || 0);
// multichain-example.js

require('dotenv').config();
const logger = require('./logger');
const { getProvider } = require('./llm-providers');

async function runChain(providerName) {
  const provider = getProvider(providerName);
  const prompts = [
    "Generate a creative idea for a mysterious newscast from the future of AI causing an existential crisis!",
    "Based on that idea, create a newscaster character to relay the information.",
    "Write a short newsclip introducing the existential crisis to the viewers.",
  ];

  try {
    for (const promptText of prompts) {
      logger.log(`Prompt: ${promptText}`, 'PROMPT');
      const response = await provider.generateResponse(promptText);
      logger.log(`Full Response: ${response}`, 'RESPONSE');
      logger.log("---");
    }
  } catch (error) {
    logger.log(`An error occurred: ${error.message}`, 'ERROR');
  }
}

const providerName = process.argv[2] || 'ollama';
logger.log(`Starting multichain example with ${providerName}...`);
runChain(providerName).then(() => {
  logger.log("Multichain example completed.");
  logger.close();
});
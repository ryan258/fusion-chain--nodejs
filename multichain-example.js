// multichain-example.js

require('dotenv').config();
const http = require('http');
const logger = require('./logger');

async function prompt(model, promptText) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: process.env.MODEL_NAME || 'llama2',
      prompt: promptText,
    });

    const options = {
      hostname: 'localhost',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    let fullResponse = '';

    const req = http.request(options, (res) => {
      res.on('data', (chunk) => {
        try {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          lines.forEach(line => {
            const jsonChunk = JSON.parse(line);
            if (jsonChunk.response) {
              process.stdout.write(jsonChunk.response);
              fullResponse += jsonChunk.response;
            }
          });
        } catch (e) {
          logger.log(`Error processing chunk: ${e}`, 'ERROR');
        }
      });

      res.on('end', () => {
        logger.log("--- End of response ---");
        resolve(fullResponse);
      });
    });

    req.on('error', (error) => {
      logger.log(`Request error: ${error}`, 'ERROR');
      reject(error);
    });

    req.write(requestBody);
    req.end();
  });
}

async function runChain() {
  const prompts = [
    "Generate a creative idea for a mystery in a futuristic city.",
    "Based on that idea, create a detective character to solve the mystery.",
    "Write a short opening scene introducing the detective and the mystery.",
  ];

  try {
    for (const promptText of prompts) {
      logger.log(`Prompt: ${promptText}`, 'PROMPT');
      const response = await prompt(null, promptText);
      logger.log(`Full Response: ${response}`, 'RESPONSE');
      logger.log("---");
    }
  } catch (error) {
    logger.log(`An error occurred: ${error.message}`, 'ERROR');
  }
}

logger.log("Starting multichain example...");
runChain().then(() => {
  logger.log("Multichain example completed.");
  logger.close();
});
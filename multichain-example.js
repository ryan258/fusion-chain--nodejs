// multichain-example.js

require('dotenv').config();
const http = require('http');

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
          console.error("Error processing chunk:", e);
        }
      });

      res.on('end', () => {
        console.log("\n--- End of response ---");
        resolve(fullResponse);
      });
    });

    req.on('error', (error) => {
      console.error("Request error:", error);
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
      console.log("\nPrompt:", promptText);
      const response = await prompt(null, promptText);
      console.log("\nFull Response:", response);
      console.log("---");
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

runChain();
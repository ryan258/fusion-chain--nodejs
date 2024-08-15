// llm-providers.js

const http = require('http');
const https = require('https');
const logger = require('./logger');

class LLMProvider {
  async generateResponse(prompt) {
    throw new Error('Method not implemented');
  }
}

class OllamaProvider extends LLMProvider {
  async generateResponse(prompt) {
    return new Promise((resolve, reject) => {
      const requestBody = JSON.stringify({
        model: process.env.OLLAMA_MODEL_NAME || 'llama2',
        prompt: prompt,
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
          logger.log("--- End of Ollama response ---");
          resolve(fullResponse);
        });
      });

      req.on('error', (error) => {
        logger.log(`Ollama request error: ${error}`, 'ERROR');
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  }
}

class OpenAIProvider extends LLMProvider {
  async generateResponse(prompt) {
    return new Promise((resolve, reject) => {
      const requestBody = JSON.stringify({
        model: process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini-2024-07-18',
        messages: [{ role: 'user', content: prompt }],
      });

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.choices && response.choices.length > 0) {
              const generatedText = response.choices[0].message.content;
              process.stdout.write(generatedText);
              logger.log("--- End of OpenAI response ---");
              resolve(generatedText);
            } else {
              reject(new Error('Invalid OpenAI API response'));
            }
          } catch (error) {
            logger.log(`Error parsing OpenAI response: ${error}`, 'ERROR');
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        logger.log(`OpenAI request error: ${error}`, 'ERROR');
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });
  }
}

function getProvider(providerName) {
  switch (providerName.toLowerCase()) {
    case 'ollama':
      return new OllamaProvider();
    case 'openai':
      return new OpenAIProvider();
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
}

module.exports = { getProvider };
// index.js

require('dotenv').config();
const https = require('https');

async function runAgentChain(initialPrompt) {
  const agents = [
    { role: 'Task Planner', promptTemplate: 'Plan the necessary steps to fulfill the user request: {userRequest}' },
    { role: 'Information Retriever', promptTemplate: 'Retrieve relevant information for step: {step}' },
    { role: 'Task Executor', promptTemplate: 'Execute the task based on the information: {information}' },
  ];
  let currentOutput = initialPrompt;
  for (const agent of agents) {
    const prompt = agent.promptTemplate
      .replace('{userRequest}', currentOutput)
      .replace('{step}', currentOutput)
      .replace('{information}', currentOutput);

    const requestBody = JSON.stringify({
      model: 'gpt-4o-mini-2024-07-18',
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

    currentOutput = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const response = JSON.parse(data);
          resolve(response.choices[0].message.content);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(requestBody);
      req.end();
    });

    console.log(`${agent.role}: ${currentOutput}`);
  }

  return currentOutput;
}

runAgentChain('Write a short story about a cat who goes on an adventure.')
  .then(finalOutput => console.log(`Final Output: ${finalOutput}`))
  .catch(error => console.error('Error:', error));
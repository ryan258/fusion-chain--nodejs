// index.js

require('dotenv').config(); // Load environment variables from .env file
const https = require('https'); // Import the https module for making HTTP requests
const { MinimalChainable } = require('./chain'); // Import the MinimalChainable class from chain.js

// Function to send a prompt to the OpenAI API and get a response
async function prompt(model, promptText) {
  const requestBody = JSON.stringify({
    model: 'gpt-4o-mini-2024-07-18', // Specify the desired OpenAI model
    messages: [{ role: 'user', content: promptText }], // Send the prompt as a user message
  });

  const options = {
    hostname: 'api.openai.com', // OpenAI API hostname
    path: '/v1/chat/completions', // API endpoint path
    method: 'POST', // HTTP method
    headers: {
      'Content-Type': 'application/json', // Content type header
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Authorization header with API key
    },
  };

  // Use a Promise to handle the asynchronous HTTP request
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk; // Accumulate response data
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data); // Parse the response as JSON

          // Check if choices exist and have at least one element
          if (response.choices && response.choices.length > 0) {
            resolve(response.choices[0].message.content); // Resolve with the model's response content
          } else {
            console.error('OpenAI API response missing choices or empty choices array:', response);
            reject(new Error('Invalid OpenAI API response')); // Reject with an error message
          }
        } catch (parseError) {
          console.error('Error parsing OpenAI API response:', parseError);
          reject(parseError); // Reject with the parsing error
        }
      });
    });

    req.on('error', (error) => {
      reject(error); // Reject the Promise if there's an error with the request
    });

    req.write(requestBody); // Write the request body
    req.end(); // End the request
  });
}

// Function to run the agent chain
async function runChain() {
  const initialContext = { topic: 'AI Agents' }; // Initial context for the chain
  const prompts = [
    "Generate one blog post title about: {{topic}}. Respond in strictly in JSON in this format: {'title': '<title>'}",
    "Generate one hook for the blog post title: {{{output[-1]}}}", // Correct the reference to the previous output
    // Add more prompts as needed
  ];

  // Run the MinimalChainable with the prompt function and initial context
  const [result, contextFilledPrompts] = await MinimalChainable.run(
    initialContext,
    null, // No specific model object needed for direct HTTP requests
    prompt, // Pass the prompt function as the callable
    prompts
  );

  console.log('Chain Results:', result); // Log the chain results
  console.log('Context Filled Prompts:', contextFilledPrompts); // Log the context-filled prompts
}

runChain(); // Execute the chain
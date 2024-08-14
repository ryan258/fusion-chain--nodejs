// multichain-example.js

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

// Function to run the multi-agent chain
async function runMultiChain() {
  const goal = "Write a short story about a detective solving a mystery in a futuristic city."; // Define the overall goal

  const initialContext = { goal: goal }; // Initial context with the goal

  let story = ""; // Initialize an empty string to store the story

  const prompts = [
    "Generate 3 creative ideas for a mystery that could take place in a futuristic city. Return as a JSON list: ['idea1', 'idea2', 'idea3']", // Idea generation agent
    "Choose the best mystery idea from this list: {{{output[-1]}}}. Briefly explain your reasoning.", // Idea selection agent
    "Based on the chosen mystery idea, create 3 potential detective characters. Return as a JSON list with names and brief descriptions: [{'name': 'Name1', 'description': 'Description1'}, ...]", // Character creation agent
    "Choose the best detective from this list: {{{output[-1]}}}. Briefly explain your reasoning.", // Character selection agent
    "Write a short story opening scene based on the chosen idea and detective. Set the scene and introduce the mystery.", // Story opening scene agent
    "Continue the story by developing the plot, introducing conflicts, and building suspense.", // Plot development agent
    "Write the climax of the story where the detective confronts the suspect and solves the mystery.", // Climax agent
    "Write the ending of the story, resolving any loose ends and providing a satisfying conclusion.", // Ending agent

    // Accumulate the story parts
    (previousOutput) => {
      story += previousOutput; // Add the previous output to the story string
      return "Story so far: " + story; // Return the accumulated story for the next prompt
    },

    "You are a story editor. Review the story and provide feedback on the plot, characters, and overall flow.", // Story editor agent

    // Accumulate the story with editor's feedback
    (previousOutput) => { 
      story += "\n\nEditor's feedback: " + previousOutput; // Add the feedback to the story string
      return "Story with feedback: " + story; // Return the story with feedback for the next prompt
    },

    "Based on the editor's feedback, revise the story to improve its quality and coherence.", // Story revision agent
  ];

  // Run the MinimalChainable with the prompt function, initial context, and prompts
  const [result, contextFilledPrompts] = await MinimalChainable.run(
    initialContext,
    null, // No specific model object needed for direct HTTP requests
    prompt, // Pass the prompt function as the callable
    prompts
  );

  console.log('Multi-Chain Results:', result); // Log the chain results
  console.log('Context Filled Prompts:', contextFilledPrompts); // Log the context-filled prompts
}

runMultiChain(); // Execute the chain
// chain.js

const { logConversation } = require('./utility');

// Class to represent the result of a fusion chain
const FusionChainResult = class {
  constructor(topResponse, allPromptResponses, allContextFilledPrompts, performanceScores, modelNames) {
    this.topResponse = topResponse;
    this.allPromptResponses = allPromptResponses;
    this.allContextFilledPrompts = allContextFilledPrompts;
    this.performanceScores = performanceScores;
    this.modelNames = modelNames;
  }
};

// Class to handle fusion chain operations
const FusionChain = class {
  static async run(context, models, callable, prompts, evaluator, getModelName) {
    const allOutputs = [];
    const allContextFilledPrompts = [];

    // Run the chain for each model
    for (const model of models) {
      const [outputs, contextFilledPrompts] = await MinimalChainable.run(context, model, callable, prompts);
      allOutputs.push(outputs);
      allContextFilledPrompts.push(contextFilledPrompts);
    }

    // Get the last outputs from each model
    const lastOutputs = allOutputs.map(outputs => outputs[outputs.length - 1]);

    // Evaluate the outputs
    const [topResponse, performanceScores] = evaluator(lastOutputs);

    // Get model names
    const modelNames = models.map(getModelName || (model => model.toString()));

    // Return the FusionChainResult
    return new FusionChainResult(topResponse, allOutputs, allContextFilledPrompts, performanceScores, modelNames);
  }

  // Method to run the fusion chain in parallel
  static async run_parallel(context, models, callable, prompts, evaluator, getModelName) {
    const runPromises = models.map(model => MinimalChainable.run(context, model, callable, prompts));
    
    const results = await Promise.all(runPromises);
    
    const allOutputs = results.map(result => result[0]);
    const allContextFilledPrompts = results.map(result => result[1]);
    
    const lastOutputs = allOutputs.map(outputs => outputs[outputs.length - 1]);
    
    const [topResponse, performanceScores] = evaluator(lastOutputs);
    
    const modelNames = models.map(getModelName || (model => model.toString()));
    
    return new FusionChainResult(topResponse, allOutputs, allContextFilledPrompts, performanceScores, modelNames);
  }
};

// Class to handle the main chain of prompts and responses
const MinimalChainable = class {
  static async run(context, model, callable, prompts) {
    const output = [];
    const contextFilledPrompts = [];

    for (let i = 0; i < prompts.length; i++) {
      let prompt = prompts[i];
      let turn = i + 1;

      // Handle function prompts
      if (typeof prompt === 'function') {
        prompt = await prompt({ ...context, output: output[i - 1] });
        logConversation(turn, "Chain", prompt, context);
      }

      // Replace context variables in string prompts
      if (typeof prompt === 'string') {
        for (const [key, value] of Object.entries(context)) {
          prompt = prompt.replace(`{{${key}}}`, value);
        }
        logConversation(turn, "Chain", prompt, context);
      }

      // Replace output references in the prompt
      for (let j = i; j > 0; j--) {
        const previousOutput = output[i - j];

        if (typeof previousOutput === 'object') {
          prompt = prompt.replace(`{{{output[-${j}]}}}`, JSON.stringify(previousOutput));
          for (const [key, value] of Object.entries(previousOutput)) {
            prompt = prompt.replace(`{{{output[-${j}].${key}}}}`, value);
          }
        } else {
          prompt = prompt.replace(`{{{output[-${j}]}}}`, previousOutput);
        }
      }

      contextFilledPrompts.push(prompt);

      // Call the model with the prepared prompt
      const result = await callable(model, prompt);
      logConversation(turn, "Model", result);

      // Attempt to parse the result as JSON
      try {
        const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/);
        output.push(jsonMatch ? JSON.parse(jsonMatch[1]) : result);
      } catch (e) {
        output.push(result);
      }
    }

    return [output, contextFilledPrompts];
  }

  // Method to format the chain results into a delimited text file
  static to_delim_text_file(name, content) {
    let resultString = "";
    for (let i = 0; i < content.length; i++) {
      let item = content[i];
      if (typeof item === 'object') {
        item = JSON.stringify(item);
      }
      if (Array.isArray(item)) {
        item = JSON.stringify(item);
      }
      const chainTextDelim = `{'🔗' * (i + 1)} -------- Prompt Chain Result #${i + 1} -------------\n\n`;
      resultString += chainTextDelim + item + "\n\n";
    }
    return resultString;
  }
};

module.exports = { MinimalChainable, FusionChain, FusionChainResult };
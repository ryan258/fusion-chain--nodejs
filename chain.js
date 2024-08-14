// chain.js

const FusionChainResult = class {
    constructor(topResponse, allPromptResponses, allContextFilledPrompts, performanceScores, modelNames) {
      this.topResponse = topResponse;
      this.allPromptResponses = allPromptResponses;
      this.allContextFilledPrompts = allContextFilledPrompts;
      this.performanceScores = performanceScores;
      this.modelNames = modelNames;
    }
  };
  
  const FusionChain = class {
    static async run(context, models, callable, prompts, evaluator, getModelName) {
      const allOutputs = [];
      const allContextFilledPrompts = [];
  
      for (const model of models) {
        const [outputs, contextFilledPrompts] = await MinimalChainable.run(context, model, callable, prompts);
        allOutputs.push(outputs);
        allContextFilledPrompts.push(contextFilledPrompts);
      }
  
      const lastOutputs = allOutputs.map(outputs => outputs[outputs.length - 1]);
      const [topResponse, performanceScores] = evaluator(lastOutputs);
  
      const modelNames = models.map(getModelName || (model => model.toString()));
  
      return new FusionChainResult(topResponse, allOutputs, allContextFilledPrompts, performanceScores, modelNames);
    }
  
    // Add run_parallel method if needed, using Promise.all for parallel execution
  };
  
  const MinimalChainable = class {
    static async run(
      context, model, callable, prompts
    ) {
      const output = []; // Initialize an empty array to store the outputs of each prompt
      const contextFilledPrompts = []; // Initialize an empty array to store the prompts after context variables are filled
  
      // Loop through each prompt in the prompts array
      for (let i = 0; i < prompts.length; i++) {
        let prompt = prompts[i]; // Get the current prompt from the array
  
        // Check if the prompt is a function (accumulator function)
        if (typeof prompt === 'function') {
          prompt = await prompt(output[i - 1], context); // Call the accumulator function to get the prompt string
        }
  
        // Replace context variables in the prompt (e.g., {{topic}}) only if it's a string
        if (typeof prompt === 'string') { 
          for (const [key, value] of Object.entries(context)) {
            prompt = prompt.replace(`{{${key}}}`, value);
          }
        }
  
        // Replace output references (e.g., {{{output[-1]}}}) in the prompt
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
  
        contextFilledPrompts.push(prompt); // Add the filled prompt to the contextFilledPrompts array
        
        const result = await callable(model, prompt); // Call the API with the processed prompt
  
        // Attempt to parse the result as JSON
        try {
          const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[1]);
          } else {
            result = JSON.parse(result);
          }
        } catch (e) {
          // Not JSON, keep as is
        }
  
        output.push(result); // Add the result to the output array
      }
  
      return [output, contextFilledPrompts]; // Return the output and contextFilledPrompts arrays
    }
  
    static to_delim_text_file(name, content) {
      let resultString = "";
      // NOTE: this is stubbed - would need to import fs module
      // and implement file writing logic
      // with open(f"{name}.txt", "w") as outfile:
      for (let i = 0; i < content.length; i++) {
        let item = content[i];
        if (typeof item === 'object') {
          item = JSON.stringify(item);
        }
        if (Array.isArray(item)) {
          item = JSON.stringify(item);
        }
        const chainTextDelim = `{'🔗' * (i + 1)} -------- Prompt Chain Result #${i + 1} -------------\n\n`;
        // outfile.write(chainTextDelim);
        // outfile.write(item);
        // outfile.write("\n\n");
  
        resultString += chainTextDelim + item + "\n\n";
      }
      return resultString;
    }
  };
  
  module.exports = { MinimalChainable, FusionChain, FusionChainResult };
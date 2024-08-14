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
    static async run(context, model, callable, prompts) {
      const output = [];
      const contextFilledPrompts = [];
  
      for (let i = 0; i < prompts.length; i++) {
        let prompt = prompts[i];
  
        for (const [key, value] of Object.entries(context)) {
          prompt = prompt.replace(`{{${key}}}`, value);
        }
  
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
  
        let result = await callable(model, prompt);
  
        try {
          // Attempt to parse as JSON, handling potential markdown wrapping
          const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[1]);
          } else {
            result = JSON.parse(result);
          }
        } catch (e) {
          // Not JSON, keep as is
        }
  
        output.push(result);
      }
  
      return [output, contextFilledPrompts];
    }
  
    // Add to_delim_text_file method if needed
  };
  
  module.exports = { MinimalChainable, FusionChain, FusionChainResult };
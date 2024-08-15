# Fusion Chain - NodeJS

This project demonstrates the use of various Language Model providers (including Ollama and OpenAI) with a Node.js application, implementing a chain of prompts to generate creative content.

## Project Overview

The Fusion Chain project consists of several components:

1. `multichain-example.js`: The main script that interacts with the chosen LLM provider to generate responses based on a series of prompts.
2. `llm-providers.js`: Contains classes for different LLM providers (Ollama and OpenAI).
3. `chain.js`: Contains utility classes for chaining multiple prompts and handling responses.
4. `utility.js`: Provides utility functions for formatting and logging.
5. `logger.js`: A custom logging utility to record conversations and debug information.

## Prerequisites

- Node.js (v12.0.0 or higher)
- Ollama installed and running locally (if using Ollama provider)
- OpenAI API key (if using OpenAI provider)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/fusion-chain-nodejs.git
   cd fusion-chain-nodejs
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root with the following content:
   ```
   OLLAMA_MODEL_NAME=llama3.1:latest
   OPENAI_MODEL_NAME=gpt-4o-mini-2024-07-18
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

To run the multichain example with Ollama (default):

```
node multichain-example.js
```

To run with OpenAI:

```
node multichain-example.js openai
```

This will execute a series of prompts, generating creative content based on the responses from the chosen LLM provider.

## Logging

The project includes a custom logging utility that saves conversation logs in the `logs` directory. Each run of the script creates a new timestamped log file.

## Components

### multichain-example.js

This is the main script that demonstrates the use of chained prompts with the chosen LLM provider. It sends a series of prompts to generate a creative story idea, a detective character, and an opening scene.

### llm-providers.js

Contains classes for different LLM providers (currently Ollama and OpenAI). This allows easy switching between providers and addition of new providers in the future.

### chain.js

Contains the `MinimalChainable` and `FusionChain` classes, which handle the logic for chaining multiple prompts and processing responses.

### utility.js

Provides utility functions such as `formatJSON` and `logConversation` for formatting and logging purposes.

### logger.js

A custom logging utility that writes logs to both the console and a file, creating timestamped log files for each run.

## Customization

You can modify the prompts in `multichain-example.js` to generate different types of content or solve various problems. Experiment with different models by changing the `OLLAMA_MODEL_NAME` or `OPENAI_MODEL_NAME` in your `.env` file.

## Troubleshooting

If you encounter any issues:

1. Ensure Ollama is running locally on the default port (11434) if using the Ollama provider.
2. Check the `.env` file for correct configuration, especially the OpenAI API key if using the OpenAI provider.
3. Review the logs in the `logs` directory for detailed error messages.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
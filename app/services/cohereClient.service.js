const { CohereClientV2 } = require('cohere-ai');
//  import { CohereClientV2 } from 'cohere-ai';

//  Cohere API key is stored in an environment variable.
//  Cohere website:  https://cohere.com/
const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

async function generateText(prompt) {

    //  Generate text response from prompt
    const response = await cohere.generate({
        model: 'command',
        prompt: prompt,
        maxTokens: 1000,    //  Increased maxTokens from 50 to allow for larger response.
        temperature: 0.2,   // Low temperature for deterministic output
    });

    //  Per the Cohere documentation, this is where the response is located:
    return response.generations[0].text;
}

module.exports = { generateText };

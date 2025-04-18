import dotenv from 'dotenv';
dotenv.config();

import { LLMEngine } from './engine';

export async function chat_completer(messages) {
    /*
    @param {messages} is of type array of objects
    Example input:
    [
        { role: "user" or "assistant", content: "Hey, how are you?" }
    ]
    */

    // Ensure messages is a valid array before proceeding
    if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Invalid messages format. Expecting a non-empty array.');
    }

    // Remove any extra fields (like 'timestamp') before sending to the API
    const formattedMessages = messages.map(msg => ({
        role: msg.role,  // Ensure role is one of: 'user', 'assistant', 'system'
        content: msg.content  // Only send the content, no extra fields like 'timestamp'
    }));

    const user_query = formattedMessages.pop().content
    const chat_history = formattedMessages

    // LLM endpoint at Runpod
    //const URL_Runpod = `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/openai/v1/chat/completions`;

    try {

        // Sending a request to Runpod with the chat to complete
        var result = await LLMEngine("/ask", user_query, chat_history, "")
        console.log("Full RunPod response:", result)
        
        // Extract the body from the output property
        if (result && result.output && result.output.body) {
            var response = result.output.body
            
            // Log the extracted API response for debugging
            console.log('Extracted RunSync API response:', response);
            
            return response;
        } else {
            console.error('Unexpected response format:', JSON.stringify(result));
            throw new Error('Unexpected response format from Runpod API.');
        }

    } catch (error) {
        console.error('Error calling RunSync API:', error.message);

        // Log the full error response for further debugging
        if (error.response) {
            console.error('RunSync API error response:', JSON.stringify(error.response.data));
        }

        throw new Error('Failed to complete the chat. Please try again later.');
    }
};

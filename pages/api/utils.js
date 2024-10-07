import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

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

    // LLM endpoint at Runpod
    const URL_Runpod = `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/openai/v1/chat/completions`;

    try {
        // Sending a request to Runpod with the chat to complete
        const response = await axios.post(URL_Runpod, {
            "messages": formattedMessages,  // Ensure this is in correct format
            "model": "MinervaBotTeam/Phi-3-medium-MathDial"
        }, {
            headers: {
                Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`
            }
        });

        // Log the full API response for debugging
        console.log('Runpod API response:', response.data);

        // Check if 'choices' exist and has content
        if (response.status === 200 && response.data.choices && response.data.choices.length > 0) {
            return response.data.choices[0].message.content;
        } else {
            console.error('Unexpected response format:', JSON.stringify(response.data));
            throw new Error('Unexpected response format from Runpod API.');
        }

    } catch (error) {
        console.error('Error calling Runpod API:', error.message);

        // Log the full error response for further debugging
        if (error.response) {
            console.error('Runpod API error response:', JSON.stringify(error.response.data));
        }

        throw new Error('Failed to complete the chat. Please try again later.');
    }
};

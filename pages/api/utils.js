// loading .env
import dotenv from 'dotenv'
dotenv.config()
// loading needed modules
import axios from 'axios'



export async function chat_completer(messages){
    /*
    @param{messages} is of type arrays of objects
    example input:
    [
    {role:"user"or"assistant", content:"Hey, how are you"}
    ]

    */
    
    // LLM endpoint at Runpod
    const URL_Runpod = `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/openai/v1/chat/completions`
    
    // sending a request to Runpod with the chat to complete
    const response = await axios.post(URL_Runpod, {"messages":messages, "model":"MinervaBotTeam/Phi-3-medium-MathDial"}, {"headers":{"Authorization":`Bearer ${process.env.RUNPOD_API_KEY}`}});
    
    // send LLM response
    if (response.status === 200) {
        return response.data.choices[0].message.content;
    } else {
        throw new Error(`Request failed with status code: ${response.status}`);
    }
};
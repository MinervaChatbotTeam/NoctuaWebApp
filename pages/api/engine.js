// Function to invoke the engine function
export const LLMEngine = async (command, query, chat_history, image_url) => {
  const payload = {
    "input": {
      //"pipeline": command,  /ask is default
      "query": query,
      "user": "testuser",
      "messages": chat_history
    }
  };
  console.log(payload);

  // Remove image_url from payload if it's empty
  if (image_url) {
    payload.input.image_url = image_url;
  }

  try {
    const response = await fetch(`https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/runsync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`RunSync API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error invoking RunSync API:', error);
    throw error;
  }
};

/*
    Sample call
    // Call the function
    const trial =async ()=>{

    console.log((await LLMEngine("/ask", "What is the capital of France?", [], "")).body);

    }
    trial()
*/
export const LLMEngine = async (command, query, chat_history, image_url) => {
  // Get configuration from environment variables
  const ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;
  const API_KEY = process.env.RUNPOD_API_KEY;

  // Validate configuration
  if (!ENDPOINT_ID || !API_KEY) {
    throw new Error('RunPod configuration is incomplete. Please check environment variables.');
  }

  // Remove sensitive logging
  console.log('RunPod Configuration:', {
    hasApiKey: !!API_KEY,
    endpointId: ENDPOINT_ID,
    messageLength: query?.length,
    historyLength: chat_history?.length || 0
  });

  const payload = {
    "input": {
      "query": query,
      "user": "testuser",
      "messages": chat_history || []
    }
  };

  if (image_url) {
    payload.input.image_url = image_url;
  }

  try {
    const response = await fetch(`https://api.runpod.ai/v2/${ENDPOINT_ID}/runsync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('RunPod Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RunPod Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`RunSync API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('RunPod API Error:', error);
    throw error;
  }
};
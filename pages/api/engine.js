const { Lambda } = require("aws-sdk");

// Initialize the Lambda client
const lambda = new Lambda({
  region: 'us-west-2'
});

// Function to invoke the engine function
export const LLMEngine = async (command, query, chat_history, image_url) => {
  const params = {
    FunctionName: 'webapp_engine',
    InvocationType: 'RequestResponse',         
    Payload: JSON.stringify({
      "pipeline": command, 
      "query": query,
      "user": "user1234",
      "chat_history": chat_history,  
      "image_url": image_url,
      "channel": "channel_id",  
      "ts": "timestamp_here"
    })    
  };

  try {
    const result = await lambda.invoke(params).promise();
    return JSON.parse(result.Payload);
  } catch (error) {
    console.error('Error invoking Lambda:', error);
  }
};

/*
    Sample call
    // Call the function
    const trial =async ()=>{

    console.log((await LLMEngine({
      "pipeline": "/ask", 
      "query": "What is the capital of France?",
      "user": "user1234",
      "chat_history": [],  
      "image_url": "https://example.com/image.jpg",
      "channel": "channel_id",  
      "ts": "timestamp_here"  
    })).body[0].text.text);

    }
    trial()
  
*/
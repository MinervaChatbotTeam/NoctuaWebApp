if (!global.chatHistories) {
  global.chatHistories = {};
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { chatId, message } = req.body;

    // Add the user message to the chat history
    const userMessage = { text: message, sender: 'user' };
    if (!global.chatHistories[chatId]) {
      global.chatHistories[chatId] = [];
    }
    global.chatHistories[chatId].push(userMessage);

    // Simulate an echo response from the API
    setTimeout(() => {
      const randomResponses = [
        "That's interesting!",
        "Can you tell me more?",
        "Thanks for sharing!",
        "I see what you mean!",
      ];
      const apiMessage = {
        text: randomResponses[Math.floor(Math.random() * randomResponses.length)],
        sender: 'api',
      };
      global.chatHistories[chatId].push(apiMessage);

      // Return the updated chat history
      res.status(200).json({ messages: global.chatHistories[chatId] });
    }, 1000);  // Simulated delay for the response
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

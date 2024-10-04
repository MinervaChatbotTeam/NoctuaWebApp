import { chat_completer } from "../utils";

if (!global.chatHistories) {
  global.chatHistories = {};
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { chatId, message } = req.body;

    // Add the user message to the chat history
    const userMessage = { content: message, role: 'user' };
    if (!global.chatHistories[chatId]) {
      global.chatHistories[chatId] = [];
    }
    global.chatHistories[chatId].push(userMessage);

    // Simulate an echo response from the API
    
      const apiMessage = {
        content: (await chat_completer(global.chatHistories[chatId])),
        role: 'assistant',
      };
      global.chatHistories[chatId].push(apiMessage);

      // Return the updated chat history
      res.status(200).json({ messages: global.chatHistories[chatId] });
    
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

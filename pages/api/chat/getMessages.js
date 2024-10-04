if (!global.chatHistories) {
  global.chatHistories = {};
}

export default function handler(req, res) {
  const { chatId } = req.query;
  const messages = global.chatHistories[chatId] || [];
  res.status(200).json({ messages });
}

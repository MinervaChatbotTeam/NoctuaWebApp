export const loadMessages = async (chatId) => {
    const res = await fetch(`/api/chat/getMessages?chatId=${chatId}`);
    const data = await res.json();
    return data.messages;
  };
  
  export const sendMessage = async (chatId, message) => {
    const res = await fetch('/api/chat/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    });
    const data = await res.json();
    return data.messages;
  };


/*
POSSIBLE SCHEMA I AM THINKING
{
  chatId: '1',
  messages: [
    { text: "Hello!", sender: "user" },
    { text: "How can I help you?", sender: "api" }
  ]
}

*/
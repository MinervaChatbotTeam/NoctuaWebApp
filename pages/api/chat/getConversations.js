export default async function handler(req, res) {
  const conversations = [
    { id: '1', title: 'Chat 1' },
    { id: '2', title: 'Chat 2' },
  ]; 
  res.status(200).json({ conversations });
}

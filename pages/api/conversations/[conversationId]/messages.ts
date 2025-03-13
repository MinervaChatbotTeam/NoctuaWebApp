import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from "next-auth/jwt";
import { db } from '../../../../database/firebase';
import { LLMEngine } from '../../engine';

const secret = process.env.NEXTAUTH_SECRET;

if (!global.chatHistories) {
    global.chatHistories = {};
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { conversationId } = req.query;

    const token = await getToken({ req, secret });
    if (!token) {
        return res.status(401).json({ error: "Unauthorized. Invalid session token." });
    }

    if (req.method === 'POST') {
        try {
            const { message } = req.body;
            
            // Validate message
            if (!message || typeof message !== 'string' || message.trim() === '') {
                return res.status(400).json({ error: 'Message is required' });
            }

            // Check if conversation exists and user has access
            const userDocRef = doc(db, "Users", token.email);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                return res.status(404).json({ error: "User not found." });
            }

            const userData = userDocSnap.data();
            if (!userData.conversation_ids || !userData.conversation_ids.includes(conversationId)) {
                return res.status(403).json({ error: "You do not have access to this conversation." });
            }

            // Get conversation to retrieve chat history
            const conversationDocRef = doc(db, "Conversations", conversationId as string);
            const conversationDocSnap = await getDoc(conversationDocRef);

            if (!conversationDocSnap.exists()) {
                return res.status(404).json({ error: "Conversation not found." });
            }

            const conversationData = conversationDocSnap.data();
            const chatHistory = conversationData.messages || [];

            // Add user message to chat history
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            };

            console.log('chatHistory')
            console.log(chatHistory)

            // Call LLM Engine
            const llmResponse = await LLMEngine('ask', message, chatHistory, null);
            
            if (!llmResponse || !llmResponse.output || !llmResponse.output.body) {
                throw new Error('Invalid response from LLM Engine');
            }

            // Parse the LLM response
            const assistantMessage = {
                role: 'assistant',
                content: llmResponse.output.body.answer,
                timestamp: new Date().toISOString(),
                metadata: {
                    resources: llmResponse.output.body.resources || [],
                    images: llmResponse.output.body.images || [],
                    grounding: llmResponse.output.body.metadata?.grounding || false
                }
            };

            // Update conversation with both messages
            await updateDoc(conversationDocRef, {
                messages: arrayUnion(userMessage, assistantMessage),
                updated_at: new Date()
            });

            res.status(201).json(assistantMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    } else if (req.method === 'GET') {
        try {
            // Check if conversation exists and user has access
            const userDocRef = doc(db, "Users", token.email);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                return res.status(404).json({ error: "User not found." });
            }

            const userData = userDocSnap.data();
            if (!userData.conversation_ids || !userData.conversation_ids.includes(conversationId)) {
                return res.status(403).json({ error: "You do not have access to this conversation." });
            }

            // Get conversation messages
            const conversationDocRef = doc(db, "Conversations", conversationId as string);
            const conversationDocSnap = await getDoc(conversationDocRef);

            if (!conversationDocSnap.exists()) {
                return res.status(404).json({ error: "Conversation not found." });
            }

            const conversationData = conversationDocSnap.data();
            res.status(200).json({ messages: conversationData.messages || [] });
        } catch (error) {
            console.error('Error getting messages:', error);
            res.status(500).json({ error: 'Failed to get messages' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

    console.log("Processing request for conversation:", conversationId);

    try {
        // Validate authentication
        const token = await getToken({ req, secret });
        console.log("Authentication token:", {
            exists: !!token,
            email: token?.email
        });

        if (!token || !token.email) {
            return res.status(401).json({ error: "Unauthorized. Invalid session token." });
        }

        if (req.method === 'POST') {
            try {
                const { message } = req.body;
                
                // Validate message
                if (!message || typeof message !== 'string' || message.trim() === '') {
                    return res.status(400).json({ error: 'Message is required and must be non-empty' });
                }

                // Get user document
                const userDocRef = doc(db, "Users", token.email);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    console.error("User document not found for email:", token.email);
                    return res.status(404).json({ error: "User not found." });
                }

                const userData = userDocSnap.data();

                // Create or verify conversation access
                if (!userData.conversation_ids?.includes(conversationId)) {
                    console.log("Adding conversation access for user");
                    await updateDoc(userDocRef, {
                        conversation_ids: arrayUnion(conversationId)
                    });

                    // Create new conversation document if it doesn't exist
                    const conversationDocRef = doc(db, "Conversations", conversationId as string);
                    const conversationSnap = await getDoc(conversationDocRef);
                    
                    if (!conversationSnap.exists()) {
                        await setDoc(conversationDocRef, {
                            created_at: new Date(),
                            updated_at: new Date(),
                            user_id: token.email,
                            messages: []
                        });
                    }
                }

                // Get conversation to retrieve chat history
                const conversationDocRef = doc(db, "Conversations", conversationId as string);
                const conversationDocSnap = await getDoc(conversationDocRef);

                if (!conversationDocSnap.exists()) {
                    return res.status(404).json({ error: "Conversation not found." });
                }

                const conversationData = conversationDocSnap.data();
                const chatHistory = conversationData.messages || [];

                // Create user message
                const userMessage = {
                    role: 'user',
                    content: message,
                    timestamp: new Date().toISOString()
                };

                console.log('Processing message with chat history length:', chatHistory.length);

                // Call LLM Engine
                let llmResponse;
                try {
                    llmResponse = await LLMEngine('ask', message, chatHistory, null);
                    
                    if (!llmResponse || !llmResponse.output || !llmResponse.output.body) {
                        throw new Error('Invalid response from LLM Engine');
                    }
                } catch (llmError) {
                    console.error('LLM Engine Error:', llmError);
                    return res.status(500).json({ 
                        error: 'Failed to process message with AI engine',
                        details: process.env.NODE_ENV === 'development' ? llmError.message : undefined
                    });
                }

                // Create assistant message
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
                try {
                    await updateDoc(conversationDocRef, {
                        messages: arrayUnion(userMessage, assistantMessage),
                        updated_at: new Date()
                    });
                } catch (dbError) {
                    console.error('Database Update Error:', dbError);
                    return res.status(500).json({ error: 'Failed to save conversation' });
                }

                return res.status(201).json(assistantMessage);

            } catch (error) {
                console.error('Message Processing Error:', error);
                return res.status(500).json({ 
                    error: 'Failed to process message',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                });
            }
        } else if (req.method === 'GET') {
            try {
                // Get user document
                const userDocRef = doc(db, "Users", token.email);
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    return res.status(404).json({ error: "User not found" });
                }

                const userData = userDocSnap.data();

                // Add conversation access if it doesn't exist
                if (!userData.conversation_ids?.includes(conversationId)) {
                    await updateDoc(userDocRef, {
                        conversation_ids: arrayUnion(conversationId)
                    });
                }

                // Get conversation messages
                const conversationDocRef = doc(db, "Conversations", conversationId as string);
                const conversationDocSnap = await getDoc(conversationDocRef);

                if (!conversationDocSnap.exists()) {
                    return res.status(404).json({ error: "Conversation not found" });
                }

                const conversationData = conversationDocSnap.data();
                return res.status(200).json({ messages: conversationData.messages || [] });

            } catch (error) {
                console.error('Error retrieving messages:', error);
                return res.status(500).json({ error: 'Failed to retrieve messages' });
            }
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }

    } catch (error) {
        console.error('Request Handler Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
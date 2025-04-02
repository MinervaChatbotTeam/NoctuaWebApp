# Noctua Web App API Documentation

This document provides comprehensive documentation for the Noctua Web App API endpoints.

## Authentication

All API endpoints require authentication using NextAuth.js. Users must be signed in with a valid session token to access these endpoints.

### Authentication Endpoint

#### `POST /api/auth/[...nextauth]`

Handles authentication using NextAuth.js with Google provider.

- **Access Control**: Only users with allowed email addresses can sign in.
- **Response**: Returns authentication tokens and session information.

## Conversations API

### Create a New Conversation

#### `POST /api/conversations`

Creates a new conversation for the authenticated user.

- **Authentication**: Requires a valid session token.
- **Request Body**: Empty object `{}`.
- **Response**:
  - **Status Code**: 201 (Created)
  - **Body**:
    ```json
    {
      "conversationId": "string"
    }
    ```
- **Error Responses**:
  - 401: Unauthorized (Invalid session token)
  - 500: Failed to create conversation

### Get User Conversations

#### `GET /api/conversations`

Retrieves all conversations for the authenticated user.

- **Authentication**: Requires a valid session token.
- **Response**:
  - **Status Code**: 200 (OK)
  - **Body**:
    ```json
    {
      "conversations": [
        {
          "id": "string",
          "messages": [],
          "created_at": "timestamp",
          "updated_at": "timestamp",
          "title": "string",
          "user_id": "string"
        }
      ]
    }
    ```
- **Error Responses**:
  - 401: Unauthorized (Invalid session token)
  - 404: User not found
  - 500: Failed to get conversations

### Delete a Conversation

#### `DELETE /api/conversations/[conversationId]`

Deletes a specific conversation.

- **Authentication**: Requires a valid session token.
- **URL Parameters**:
  - `conversationId`: ID of the conversation to delete
- **Response**:
  - **Status Code**: 200 (OK)
  - **Body**:
    ```json
    {
      "message": "Conversation deleted successfully"
    }
    ```
- **Error Responses**:
  - 401: Unauthorized (Invalid session token)
  - 403: You do not have access to this conversation
  - 404: User not found or Conversation not found
  - 500: Failed to delete conversation

## Messages API

### Send a Message

#### `POST /api/conversations/[conversationId]/messages`

Sends a message to a specific conversation and gets a response from the LLM Engine.

- **Authentication**: Requires a valid session token.
- **URL Parameters**:
  - `conversationId`: ID of the conversation
- **Request Body**:
  ```json
  {
    "message": "string"
  }
  ```
- **Response**:
  - **Status Code**: 201 (Created)
  - **Body**:
    ```json
    {
      "role": "assistant",
      "content": "string",
      "timestamp": "ISO string",
      "metadata": {
        "resources": [],
        "images": [],
        "grounding": boolean
      }
    }
    ```
- **Error Responses**:
  - 400: Message is required
  - 401: Unauthorized (Invalid session token)
  - 403: You do not have access to this conversation
  - 404: User not found or Conversation not found
  - 500: Failed to send message

### Get Messages from a Conversation

#### `GET /api/conversations/[conversationId]/messages`

Retrieves all messages from a specific conversation.

- **Authentication**: Requires a valid session token.
- **URL Parameters**:
  - `conversationId`: ID of the conversation
- **Response**:
  - **Status Code**: 200 (OK)
  - **Body**:
    ```json
    {
      "messages": [
        {
          "role": "user" | "assistant",
          "content": "string",
          "timestamp": "ISO string",
          "metadata": {
            "resources": [],
            "images": [],
            "grounding": boolean
          }
        }
      ]
    }
    ```
- **Error Responses**:
  - 401: Unauthorized (Invalid session token)
  - 403: You do not have access to this conversation
  - 404: User not found or Conversation not found
  - 500: Failed to get messages

## LLM Engine API

The LLM Engine is used internally by the Messages API to generate responses.

### LLM Engine Function

The `LLMEngine` function is used to interact with the RunPod AI API.

- **Parameters**:
  - `command`: The command to execute (e.g., "ask")
  - `query`: The user's message
  - `chat_history`: Array of previous messages
  - `image_url`: Optional URL of an image to process

- **Request Format**:
  ```json
  {
    "input": {
      "query": "string",
      "user": "string",
      "messages": [],
      "image_url": "string" // Optional
    }
  }
  ```

- **Response Format**:
  ```json
  {
    "output": {
      "body": {
        "answer": "string",
        "resources": [],
        "images": [],
        "metadata": {
          "grounding": boolean
        }
      }
    }
  }
  ```

## Client API Utilities

The `ApiClient.js` file provides utility functions for interacting with the API from the frontend:

- `createConversation()`: Creates a new conversation
- `getConversations(userId)`: Gets all conversations for a user
- `deleteConversation(conversationId)`: Deletes a specific conversation
- `sendMessage(conversationId, message)`: Sends a message to a conversation
- `getMessages(conversationId)`: Gets all messages from a conversation

These utility functions handle the API requests and error handling for the frontend components.
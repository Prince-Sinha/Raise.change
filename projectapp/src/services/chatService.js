import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const CHAT_SERVICE_URL = 'https://chat-service-gg89.onrender.com/api/v1/chat';
const WS_URL = 'https://chat-service-gg89.onrender.com/chat-websocket';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('_id');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId
  };
};

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

class ChatService {
  constructor() {
    this.stompClient = null;
    this.subscriptions = new Map();
  }

  /**
   * Initialize WebSocket connection
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      const socket = new SockJS(WS_URL);
      
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.stompClient.onConnect = () => {
        console.log('WebSocket Connected');
        resolve();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP error:', frame);
        reject(frame);
      };

      this.stompClient.activate();
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.stompClient) {
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      this.subscriptions.clear();
      this.stompClient.deactivate();
    }
  }

  /**
   * Subscribe to conversation messages
   */
  subscribeToConversation(conversationId, callback) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('STOMP client not connected');
      return null;
    }

    console.log(`🔔 Subscribing to conversation: ${conversationId}`);
    
    const subscription = this.stompClient.subscribe(
      `/topic/conversation/${conversationId}/messages`,
      (message) => {
        console.log('📩 Received message via WebSocket:', message.body);
        try {
          const data = JSON.parse(message.body);
          console.log('✅ Parsed message data:', data);
          callback(data);
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      }
    );

    this.subscriptions.set(`${conversationId}-messages`, subscription);
    console.log(`✅ Subscribed to /topic/conversation/${conversationId}/messages`);
    return subscription;
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(conversationId, callback) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('STOMP client not connected');
      return null;
    }

    console.log(`⌨️ Subscribing to typing indicator: ${conversationId}`);
    
    const subscription = this.stompClient.subscribe(
      `/topic/conversation/${conversationId}/typing`,
      (message) => {
        console.log('⌨️ Received typing indicator:', message.body);
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('❌ Error parsing typing indicator:', error);
        }
      }
    );

    this.subscriptions.set(`${conversationId}-typing`, subscription);
    return subscription;
  }

  /**
   * Send a message via WebSocket
   */
  sendMessage(conversationId, content) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('STOMP client not connected');
      return;
    }

    console.log('📤 Sending message via WebSocket:', { conversationId, content });
    
    this.stompClient.publish({
      destination: '/app/chat/send',
      body: JSON.stringify({
        conversationId,
        content
      })
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId, isTyping) {
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat/typing',
      body: JSON.stringify({
        conversationId,
        typing: isTyping
      })
    });
  }

  // ===== REST API Methods (using fetch) =====

  /**
   * Create a new conversation
   */
  async createConversation(departmentId, initialMessage) {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/conversations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          departmentId,
          initialMessage
        })
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to create conversation');
    }
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(page = 0, size = 20, status = null) {
    try {
      const params = new URLSearchParams({ page, size });
      if (status) params.append('status', status);
      
      const response = await fetch(`${CHAT_SERVICE_URL}/conversations`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch conversations');
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId) {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/${conversationId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch conversation');
    }
  }

  /**
   * Close a conversation
   */
  async closeConversation(conversationId) {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/${conversationId}/close`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to close conversation');
    }
  }

  /**
   * Send a message (REST API fallback)
   */
  async sendMessageREST(conversationId, content) {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          conversationId,
          content
        })
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to send message');
    }
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId, page = 0, size = 50) {
    try {
      const params = new URLSearchParams({ page, size });
      const response = await fetch(`${CHAT_SERVICE_URL}/messages/conversation/${conversationId}?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch messages');
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/messages/${messageId}/read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to mark as read');
    }
  }

  /**
   * Edit a message
   */
  async editMessage(messageId, content) {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/messages/${messageId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to edit message');
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId) {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to delete message');
    }
  }

  /**
   * Get department conversations (for department users)
   */
  async getDepartmentConversations(page = 0, size = 20, status = null) {
    try {
      const params = new URLSearchParams({ page, size });
      if (status) params.append('status', status);
      
      const response = await fetch(`${CHAT_SERVICE_URL}/department?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch department conversations');
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
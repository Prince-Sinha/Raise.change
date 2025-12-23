import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const POST_SERVICE_WS_URL = 'https://post-service-ybd1.onrender.com/ws-post';

class PostWebSocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscriptions = new Map();
    }

    /**
     * Connect to WebSocket server
     */
    connect(onConnectCallback) {
        if (this.connected) {
            console.log('WebSocket already connected');
            return;
        }

        // Create SockJS socket
        const socket = new SockJS(POST_SERVICE_WS_URL);

        // Create STOMP client
        this.client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('✅ WebSocket Connected to Post Service');
                this.connected = true;
                if (onConnectCallback) {
                    onConnectCallback();
                }
            },
            onDisconnect: () => {
                console.log('❌ WebSocket Disconnected');
                this.connected = false;
            },
            onStompError: (frame) => {
                console.error('❌ STOMP Error:', frame);
            }
        });

        // Activate the client
        this.client.activate();
    }

    /**
     * Subscribe to new posts
     * @param {Function} callback - Function to call when new post is received
     * @returns {string} - Subscription ID
     */
    subscribeToNewPosts(callback) {
        if (!this.connected || !this.client) {
            console.warn('WebSocket not connected. Waiting...');
            // Wait for connection and then subscribe
            setTimeout(() => this.subscribeToNewPosts(callback), 1000);
            return null;
        }

        const topic = '/topic/posts/new';
        
        if (this.subscriptions.has(topic)) {
            console.log('Already subscribed to new posts');
            return this.subscriptions.get(topic).id;
        }

        const subscription = this.client.subscribe(topic, (message) => {
            console.log('🔔 New post notification received:', message.body);
            try {
                const data = JSON.parse(message.body);
                callback(data);
            } catch (error) {
                console.error('Error parsing new post message:', error);
            }
        });

        this.subscriptions.set(topic, subscription);
        console.log('📡 Subscribed to new posts');
        
        return subscription.id;
    }

    /**
     * Subscribe to upvotes for a specific post
     * @param {string} postId - Post ID to subscribe to
     * @param {Function} callback - Function to call when upvote is received
     * @returns {string} - Subscription ID
     */
    subscribeToPostUpvotes(postId, callback) {
        if (!this.connected || !this.client) {
            console.warn('WebSocket not connected. Waiting...');
            // Wait for connection and then subscribe
            setTimeout(() => this.subscribeToPostUpvotes(postId, callback), 1000);
            return null;
        }

        const topic = `/topic/posts/${postId}`;
        
        if (this.subscriptions.has(topic)) {
            console.log(`Already subscribed to upvotes for post ${postId}`);
            return this.subscriptions.get(topic).id;
        }

        const subscription = this.client.subscribe(topic, (message) => {
            console.log(`🔔 Upvote notification for post ${postId}:`, message.body);
            try {
                const data = JSON.parse(message.body);
                if (data.type === 'UPVOTE') {
                    callback(data);
                }
            } catch (error) {
                console.error('Error parsing upvote message:', error);
            }
        });

        this.subscriptions.set(topic, subscription);
        console.log(`📡 Subscribed to upvotes for post ${postId}`);
        
        return subscription.id;
    }

    /**
     * Unsubscribe from a specific topic
     * @param {string} topic - Topic to unsubscribe from
     */
    unsubscribe(topic) {
        if (this.subscriptions.has(topic)) {
            const subscription = this.subscriptions.get(topic);
            subscription.unsubscribe();
            this.subscriptions.delete(topic);
            console.log(`Unsubscribed from ${topic}`);
        }
    }

    /**
     * Unsubscribe from all topics
     */
    unsubscribeAll() {
        this.subscriptions.forEach((subscription, topic) => {
            subscription.unsubscribe();
            console.log(`Unsubscribed from ${topic}`);
        });
        this.subscriptions.clear();
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if (this.client) {
            this.unsubscribeAll();
            this.client.deactivate();
            this.connected = false;
            console.log('WebSocket disconnected');
        }
    }

    /**
     * Check if WebSocket is connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected;
    }
}

// Create singleton instance
const postWebSocketService = new PostWebSocketService();

export default postWebSocketService;
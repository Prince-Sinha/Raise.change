import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Badge,
  CircularProgress,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import chatService from '../services/chatService';
import '../styles/DepartmentChat.css';

export default function DepartmentChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('_id');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // Check authentication and role
  useEffect(() => {
    if (!token || userRole !== 'DEPT') {
      toast.error('Access denied - Department users only');
      navigate('/login/dept');
      return;
    }
  }, [token, userRole, navigate]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!token) return;

    const initWebSocket = async () => {
      try {
        await chatService.connect(token);
        setConnected(true);
        toast.success('Connected to chat service');
      } catch (error) {
        console.error('Failed to connect:', error);
        toast.warning('Using offline mode - messages will be sent via API');
      }
    };

    initWebSocket();

    return () => {
      chatService.disconnect();
    };
  }, [token]);

  // Load conversations
  useEffect(() => {
    if (token) {
      loadConversations();
    }
  }, [token]);

  // Subscribe to selected conversation
  useEffect(() => {
    if (selectedConversation && connected) {
      loadMessages(selectedConversation.id);
      
      // Subscribe to new messages
      const messageSubscription = chatService.subscribeToConversation(
        selectedConversation.id,
        (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      );

      // Subscribe to typing indicators
      const typingSubscription = chatService.subscribeToTyping(
        selectedConversation.id,
        (typingData) => {
          if (typingData.userId !== currentUserId) {
            if (typingData.typing) {
              setTypingUsers((prev) => new Set(prev).add(typingData.userName));
            } else {
              setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(typingData.userName);
                return newSet;
              });
            }
          }
        }
      );

      return () => {
        if (messageSubscription) messageSubscription.unsubscribe();
        if (typingSubscription) typingSubscription.unsubscribe();
      };
    }
  }, [selectedConversation, connected, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      // Load ALL conversations for department (no status filter)
      const response = await chatService.getDepartmentConversations(0, 100);
      console.log('Conversations loaded:', response);
      setConversations(response.data || []);
      
      // Subscribe to new conversation notifications via WebSocket
      if (connected) {
        // Department users should see new conversations in real-time
        console.log('Department connected - ready for real-time updates');
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error(error.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await chatService.getMessages(conversationId);
      // Sort messages by timestamp ascending (oldest first, newest last)
      const sortedMessages = (response.data || []).sort((a, b) => {
        return new Date(a.sentAt) - new Date(b.sentAt);
      });
      setMessages(sortedMessages);
      
      // Refresh conversation list to update unread counts
      setTimeout(() => {
        loadConversations();
      }, 500);
    } catch (error) {
      toast.error(error.message || 'Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    const messageContent = messageInput.trim();
    setSending(true);
    
    try {
      // Create optimistic message for immediate UI update
      const optimisticMessage = {
        content: messageContent,
        senderId: currentUserId,
        senderName: localStorage.getItem('name') || localStorage.getItem('dept') || 'You',
        sentAt: new Date().toISOString(),
        conversationId: selectedConversation.id
      };

      // Add message to UI immediately for better UX
      setMessages((prev) => [...prev, optimisticMessage]);
      setMessageInput('');
      scrollToBottom();

      // Send the message
      if (connected) {
        // Send via WebSocket
        chatService.sendMessage(selectedConversation.id, messageContent);
      } else {
        // Fallback to REST API
        await chatService.sendMessageREST(selectedConversation.id, messageContent);
        // Reload to get the actual message from server
        await loadMessages(selectedConversation.id);
      }
      
      // Stop typing indicator
      if (connected) {
        chatService.sendTypingIndicator(selectedConversation.id, false);
      }
      
      // Refresh conversations list to update last message
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error.message || 'Failed to send message');
      // Remove optimistic message on error
      await loadMessages(selectedConversation.id);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (selectedConversation && connected) {
      chatService.sendTypingIndicator(selectedConversation.id, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTypingIndicator(selectedConversation.id, false);
      }, 1000);
    }
  };


  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
      
      <Container maxWidth="xl" className="department-chat-container">
        <Box className="department-header-section">
          <Box className="department-header-content">
            <BusinessIcon sx={{ fontSize: 48, color: '#3b82f6' }} />
            <Box>
              <Typography variant="h4" className="department-title">
                Department Support Portal
              </Typography>
              <Typography variant="body2" className="department-subtitle">
                Manage customer conversations
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="chat-container-department">
          {/* Conversations List */}
          <Paper className="conversations-panel-dept" elevation={2}>
            <Box className="conversations-header-dept">
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                Customer Conversations
              </Typography>
              <Chip
                label={conversations.length}
                size="small"
                className="conversations-count"
              />
            </Box>

            <Divider />

            {loading ? (
              <Box className="loading-container">
                <CircularProgress sx={{ color: '#3b82f6' }} />
              </Box>
            ) : (
              <List className="conversations-list-dept">
                {conversations.length === 0 ? (
                  <Box className="empty-state-dept">
                    <PersonIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                      No conversations found
                    </Typography>
                  </Box>
                ) : (
                  conversations.map((conv) => (
                    <ListItem
                      key={conv.id}
                      button
                      selected={selectedConversation?.id === conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`conversation-item-dept ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
                    >
                      <ListItemAvatar>
                        <Badge
                          color="primary"
                          variant="dot"
                          invisible={conv.status !== 'ACTIVE'}
                        >
                          <Avatar className="user-avatar">
                            <PersonIcon />
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box className="conversation-header">
                            <Typography variant="body1" className="conversation-user-name">
                              {conv.userName || 'User'}
                            </Typography>
                            <Typography variant="caption" className="conversation-date">
                              {formatDate(conv.lastMessageTime)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            noWrap 
                            className="conversation-preview-dept"
                            sx={{ fontWeight: conv.unreadCount > 0 ? 600 : 400 }}
                          >
                            {conv.unreadCount > 0 ? '📩 New Message' : (conv.lastMessage || 'No messages yet')}
                          </Typography>
                        }
                      />
                      {conv.unreadCount > 0 && (
                        <Chip
                          label={conv.unreadCount}
                          size="small"
                          className="unread-badge-dept"
                        />
                      )}
                    </ListItem>
                  ))
                )}
              </List>
            )}
          </Paper>

          {/* Messages Panel */}
          <Paper className="messages-panel-dept" elevation={2}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box className="chat-header-dept">
                  <Box className="chat-header-info-dept">
                    <Avatar className="chat-avatar-dept">
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" className="chat-title-dept">
                        {selectedConversation.userName || 'User'}
                      </Typography>
                      <Typography variant="caption" className="chat-status-dept">
                        ● Active Conversation
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                {/* Messages Area */}
                <Box className="messages-area-dept">
                  {messages.map((msg, index) => {
                    const isOwnMessage = msg.senderId === currentUserId;
                    return (
                      <Box
                        key={index}
                        className={`message-wrapper-dept ${isOwnMessage ? 'own-message' : 'other-message'}`}
                      >
                        {!isOwnMessage && (
                          <Avatar className="message-avatar-dept">
                            <PersonIcon />
                          </Avatar>
                        )}
                        <Box className="message-bubble-dept">
                          {!isOwnMessage && (
                            <Typography variant="caption" className="message-sender-dept">
                              {msg.senderName || 'User'}
                            </Typography>
                          )}
                          <Typography variant="body1" className="message-content-dept">
                            {msg.content}
                          </Typography>
                          <Typography variant="caption" className="message-time-dept">
                            {formatTime(msg.sentAt)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {typingUsers.size > 0 && (
                    <Box className="typing-indicator-dept">
                      <Typography variant="caption" className="typing-text-dept">
                        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                      </Typography>
                    </Box>
                  )}
                  
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box className="message-input-area-dept">
                  <form onSubmit={handleSendMessage} className="message-input-form-dept">
                    <TextField
                      fullWidth
                      placeholder="Type your response..."
                      value={messageInput}
                      onChange={handleTyping}
                      disabled={sending}
                      variant="outlined"
                      size="small"
                      className="message-input-field-dept"
                    />
                    <IconButton
                      type="submit"
                      disabled={!messageInput.trim() || sending}
                      className="send-button-dept"
                    >
                      {sending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <SendIcon />}
                    </IconButton>
                  </form>
                </Box>
              </>
            ) : (
              <Box className="no-conversation-selected-dept">
                <PersonIcon sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
                <Typography variant="h5" sx={{ color: '#6b7280', fontWeight: 600, mb: 1 }}>
                  Select a conversation
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                  Choose a conversation from the list to start responding
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
}
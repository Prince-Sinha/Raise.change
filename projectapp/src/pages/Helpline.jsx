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
 Dialog,
 DialogTitle,
 DialogContent,
 DialogActions,
 Button,
 Select,
 MenuItem,
 FormControl,
 InputLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import chatService from '../services/chatService';
import '../styles/Helpline.css';

export default function Helpline() {
 const [conversations, setConversations] = useState([]);
 const [selectedConversation, setSelectedConversation] = useState(null);
 const [messages, setMessages] = useState([]);
 const [messageInput, setMessageInput] = useState('');
 const [loading, setLoading] = useState(false);
 const [sending, setSending] = useState(false);
 const [connected, setConnected] = useState(false);
 const [typingUsers, setTypingUsers] = useState(new Set());
 const [newConversationDialog, setNewConversationDialog] = useState(false);
 const [departments, setDepartments] = useState([]);
 const [loadingDepartments, setLoadingDepartments] = useState(false);
 const [newConversationData, setNewConversationData] = useState({
 departmentId: '',
 initialMessage: ''
 });
 
 const messagesEndRef = useRef(null);
 const typingTimeoutRef = useRef(null);
 const navigate = useNavigate();
 const currentUserId = localStorage.getItem('_id');
 const token = localStorage.getItem('token');

 // Check authentication
 useEffect(() => {
 if (!token) {
 toast.error('Please login to use helpline');
 navigate('/login');
 return;
 }
 }, [token, navigate]);

 // Initialize WebSocket connection
 useEffect(() => {
 if (!token) return;

 const initWebSocket = async () => {
 try {
 await chatService.connect(token);
 setConnected(true);
 toast.success('Connected to helpline service');
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

 // Load departments when dialog opens
 useEffect(() => {
 if (newConversationDialog && departments.length === 0) {
 loadDepartments();
 }
 }, [newConversationDialog]);

 const loadDepartments = async () => {
 setLoadingDepartments(true);
 try {
 const response = await fetch('https://user-service-26b4.onrender.com/api/v1/users/departments', {
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 }
 });
 
 if (response.ok) {
 const data = await response.json();
 // Assuming the response has an array of users with DEPARTMENT role
 const departmentUsers = data.data;
 setDepartments(departmentUsers.map(user => ({
 id: user.id,
 name: user.name
 })));
 } else {
 toast.error('Failed to load departments');
 }
 } catch (error) {
 console.error('Error loading departments:', error);
 toast.error('Failed to load departments');
 } finally {
 setLoadingDepartments(false);
 }
 };

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
 const response = await chatService.getUserConversations();
 setConversations(response.data || []);
 } catch (error) {
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
 senderName: localStorage.getItem('name') || 'You',
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

 const handleCreateConversation = async () => {
 if (!newConversationData.departmentId) {
 toast.error('Please select a department');
 return;
 }

 try {
 const response = await chatService.createConversation(
 newConversationData.departmentId,
 newConversationData.initialMessage
 );
 toast.success('Conversation started successfully');
 setNewConversationDialog(false);
 setNewConversationData({ departmentId: '', initialMessage: '' });
 await loadConversations();
 
 // Select the new conversation
 if (response.data) {
 setSelectedConversation(response.data);
 }
 } catch (error) {
 toast.error(error.message || 'Failed to start conversation');
 }
 };

 const formatTime = (timestamp) => {
 if (!timestamp) return '';
 const date = new Date(timestamp);
 return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
 };

 return (
 <>
 <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
 
 <Container maxWidth="xl" className="helpline-container">
 <Box className="helpline-header-section">
 <Box className="helpline-header-content">
 <HelpOutlineIcon sx={{ fontSize: 48, color: '#10b981' }} />
 <Box>
 <Typography variant="h4" className="helpline-title">
 Helpline Support
 </Typography>
 <Typography variant="body2" className="helpline-subtitle">
 Get help from our support team
 </Typography>
 </Box>
 </Box>
 </Box>

 <Box className="chat-container-modern">
 {/* Conversations List */}
 <Paper className="conversations-panel" elevation={2}>
 <Box className="conversations-header">
 <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
 My Conversations
 </Typography>
 <IconButton
 onClick={() => setNewConversationDialog(true)}
 className="new-conversation-btn"
 size="small"
 >
 <AddIcon />
 </IconButton>
 </Box>

 <Divider />

 {loading ? (
 <Box className="loading-container">
 <CircularProgress sx={{ color: '#10b981' }} />
 </Box>
 ) : (
 <List className="conversations-list">
 {conversations.length === 0 ? (
 <Box className="empty-state">
 <SupportAgentIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
 <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
 No conversations yet
 </Typography>
 <Button
 variant="contained"
 startIcon={<AddIcon />}
 onClick={() => setNewConversationDialog(true)}
 className="start-conversation-btn"
 >
 Start a Conversation
 </Button>
 </Box>
 ) : (
 conversations.map((conv) => (
 <ListItem
 key={conv.id}
 button
 selected={selectedConversation?.id === conv.id}
 onClick={() => setSelectedConversation(conv)}
 className={`conversation-item ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
 >
 <ListItemAvatar>
 <Badge
 color="success"
 variant="dot"
 invisible={conv.status !== 'ACTIVE'}
 >
 <Avatar className="conversation-avatar">
 <SupportAgentIcon />
 </Avatar>
 </Badge>
 </ListItemAvatar>
 <ListItemText
 primary={
 <Typography variant="body1" className="conversation-name">
 {conv.departmentName || 'Support Team'}
 </Typography>
 }
 secondary={
 <Typography 
 variant="body2" 
 noWrap 
 className="conversation-preview"
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
 className="unread-badge"
 />
 )}
 </ListItem>
 ))
 )}
 </List>
 )}
 </Paper>

 {/* Messages Panel */}
 <Paper className="messages-panel" elevation={2}>
 {selectedConversation ? (
 <>
 {/* Chat Header */}
 <Box className="chat-header">
 <Box className="chat-header-info">
 <Avatar className="chat-avatar">
 <SupportAgentIcon />
 </Avatar>
 <Box>
 <Typography variant="h6" className="chat-title">
 {selectedConversation.departmentName || selectedConversation.departmentUserName || 'Support Team'}
 </Typography>
 <Typography variant="caption" className="chat-status">
 ● Online
 </Typography>
 </Box>
 </Box>
 </Box>

 <Divider />

 {/* Messages Area */}
 <Box className="messages-area">
 {messages.map((msg, index) => {
 const isOwnMessage = msg.senderId === currentUserId;
 return (
 <Box
 key={index}
 className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}
 >
 {!isOwnMessage && (
 <Avatar className="message-avatar">
 <SupportAgentIcon />
 </Avatar>
 )}
 <Box className="message-bubble">
 {!isOwnMessage && (
 <Typography variant="caption" className="message-sender">
 {msg.senderName || 'Support Agent'}
 </Typography>
 )}
 <Typography variant="body1" className="message-content">
 {msg.content}
 </Typography>
 <Typography variant="caption" className="message-time">
 {formatTime(msg.sentAt)}
 </Typography>
 </Box>
 </Box>
 );
 })}
 
 {/* Typing Indicator */}
 {typingUsers.size > 0 && (
 <Box className="typing-indicator">
 <Typography variant="caption" className="typing-text">
 {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
 </Typography>
 </Box>
 )}
 
 <div ref={messagesEndRef} />
 </Box>

 {/* Input Area */}
 <Box className="message-input-area">
 <form onSubmit={handleSendMessage} className="message-input-form">
 <TextField
 fullWidth
 placeholder="Type your message..."
 value={messageInput}
 onChange={handleTyping}
 disabled={sending}
 variant="outlined"
 size="small"
 className="message-input-field"
 />
 <IconButton
 type="submit"
 disabled={!messageInput.trim() || sending}
 className="send-button"
 >
 {sending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <SendIcon />}
 </IconButton>
 </form>
 </Box>
 </>
 ) : (
 <Box className="no-conversation-selected">
 <SupportAgentIcon sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
 <Typography variant="h5" sx={{ color: '#6b7280', fontWeight: 600, mb: 1 }}>
 Select a conversation
 </Typography>
 <Typography variant="body2" sx={{ color: '#9ca3af' }}>
 Choose a conversation or start a new one to get help
 </Typography>
 </Box>
 )}
 </Paper>
 </Box>
 </Container>

 {/* New Conversation Dialog */}
 <Dialog 
 open={newConversationDialog} 
 onClose={() => setNewConversationDialog(false)} 
 maxWidth="sm" 
 fullWidth
 className="new-conversation-dialog"
 >
 <DialogTitle className="dialog-title">
 Start New Conversation
 <IconButton
 onClick={() => setNewConversationDialog(false)}
 className="dialog-close-btn"
 >
 <CloseIcon />
 </IconButton>
 </DialogTitle>
 <DialogContent>
 <FormControl fullWidth margin="normal">
 <InputLabel>Select Department</InputLabel>
 <Select
 value={newConversationData.departmentId}
 onChange={(e) => setNewConversationData({ ...newConversationData, departmentId: e.target.value })}
 label="Select Department"
 >
 {departments.map((dept) => (
 <MenuItem key={dept.id} value={dept.id}>
 {dept.name}
 </MenuItem>
 ))}
 </Select>
 </FormControl>
 <TextField
 fullWidth
 label="Initial Message (Optional)"
 value={newConversationData.initialMessage}
 onChange={(e) => setNewConversationData({ ...newConversationData, initialMessage: e.target.value })}
 margin="normal"
 multiline
 rows={3}
 placeholder="Describe your issue..."
 />
 </DialogContent>
 <DialogActions className="dialog-actions">
 <Button onClick={() => setNewConversationDialog(false)}>
 Cancel
 </Button>
 <Button
 onClick={handleCreateConversation}
 variant="contained"
 className="dialog-submit-btn"
 >
 Start Conversation
 </Button>
 </DialogActions>
 </Dialog>
 </>
 );
}
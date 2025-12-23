import { useState, useEffect, useRef } from 'react';
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
 Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import chatService from '../services/chatService';
import '../styles/Chat.css';

export default function Chat() {
 const [conversations, setConversations] = useState([]);
 const [selectedConversation, setSelectedConversation] = useState(null);
 const [messages, setMessages] = useState([]);
 const [messageInput, setMessageInput] = useState('');
 const [loading, setLoading] = useState(false);
 const [sending, setSending] = useState(false);
 const [connected, setConnected] = useState(false);
 const [typingUsers, setTypingUsers] = useState(new Set());
 const [newConversationDialog, setNewConversationDialog] = useState(false);
 const [newConversationData, setNewConversationData] = useState({
 postId: '',
 subject: ''
 });
 
 const messagesEndRef = useRef(null);
 const typingTimeoutRef = useRef(null);
 const currentUserId = localStorage.getItem('_id');
 const currentUserName = localStorage.getItem('name') || 'You';

 // Initialize WebSocket connection
 useEffect(() => {
 const token = localStorage.getItem('token');
 if (!token) {
 toast.error('Please login to use chat');
 return;
 }

 const initWebSocket = async () => {
 try {
 await chatService.connect(token);
 setConnected(true);
 toast.success('Connected to chat service');
 } catch (error) {
 console.error('Failed to connect to chat:', error);
 toast.error('Failed to connect to chat service');
 }
 };

 initWebSocket();

 return () => {
 chatService.disconnect();
 };
 }, []);

 // Load conversations
 useEffect(() => {
 loadConversations();
 }, []);

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
 }, [selectedConversation, connected]);

 // Auto-scroll to bottom
 useEffect(() => {
 scrollToBottom();
 }, [messages]);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 const loadConversations = async () => {
 setLoading(true);
 try {
 const response = await chatService.getUserConversations();
 setConversations(response.data || []);
 } catch (error) {
 toast.error(error.message);
 } finally {
 setLoading(false);
 }
 };

 const loadMessages = async (conversationId) => {
 try {
 const response = await chatService.getMessages(conversationId);
 setMessages(response.data || []);
 } catch (error) {
 toast.error(error.message);
 }
 };

 const handleSendMessage = async (e) => {
 e.preventDefault();
 if (!messageInput.trim() || !selectedConversation) return;

 setSending(true);
 try {
 if (connected) {
 // Send via WebSocket
 chatService.sendMessage(selectedConversation.id, messageInput);
 } else {
 // Fallback to REST API
 await chatService.sendMessageREST(selectedConversation.id, messageInput);
 await loadMessages(selectedConversation.id);
 }
 setMessageInput('');
 chatService.sendTypingIndicator(selectedConversation.id, false);
 } catch (error) {
 toast.error(error.message);
 } finally {
 setSending(false);
 }
 };

 const handleTyping = (e) => {
 setMessageInput(e.target.value);

 if (selectedConversation && connected) {
 chatService.sendTypingIndicator(selectedConversation.id, true);

 // Clear previous timeout
 if (typingTimeoutRef.current) {
 clearTimeout(typingTimeoutRef.current);
 }

 // Set new timeout to stop typing indicator
 typingTimeoutRef.current = setTimeout(() => {
 chatService.sendTypingIndicator(selectedConversation.id, false);
 }, 1000);
 }
 };

 const handleCreateConversation = async () => {
 if (!newConversationData.postId || !newConversationData.subject) {
 toast.error('Please fill all fields');
 return;
 }

 try {
 const response = await chatService.createConversation(
 newConversationData.postId,
 newConversationData.subject
 );
 toast.success('Conversation created successfully');
 setNewConversationDialog(false);
 setNewConversationData({ postId: '', subject: '' });
 await loadConversations();
 } catch (error) {
 toast.error(error.message);
 }
 };

 const formatTime = (timestamp) => {
 if (!timestamp) return '';
 const date = new Date(timestamp);
 return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
 };

 return (
 <>
 <ToastContainer position="bottom-left" autoClose={3000} theme="light" />
 
 <Container maxWidth="xl" sx={{ py: 4 }}>
 <Box className="chat-container-modern">
 {/* Conversations List */}
 <Paper className="conversations-panel" elevation={0}>
 <Box className="conversations-header">
 <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 1 }}>
 <ChatBubbleOutlineIcon sx={{ color: '#10b981' }} />
 Messages
 </Typography>
 <IconButton
 onClick={() => setNewConversationDialog(true)}
 sx={{ bgcolor: '#10b981', color: 'white', '&:hover': { bgcolor: '#059669' } }}
 size="small"
 >
 <AddIcon />
 </IconButton>
 </Box>

 <Divider />

 {loading ? (
 <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
 <CircularProgress sx={{ color: '#10b981' }} />
 </Box>
 ) : (
 <List className="conversations-list">
 {conversations.length === 0 ? (
 <Box sx={{ textAlign: 'center', py: 4, color: '#9ca3af' }}>
 <ChatBubbleOutlineIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
 <Typography>No conversations yet</Typography>
 <Button
 variant="contained"
 startIcon={<AddIcon />}
 onClick={() => setNewConversationDialog(true)}
 sx={{ mt: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
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
 <Avatar sx={{ bgcolor: '#10b981' }}>
 {conv.subject?.charAt(0).toUpperCase() || 'C'}
 </Avatar>
 </Badge>
 </ListItemAvatar>
 <ListItemText
 primary={
 <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
 {conv.subject || 'Conversation'}
 </Typography>
 }
 secondary={
 <Typography variant="body2" noWrap sx={{ color: '#6b7280' }}>
 {conv.lastMessage || 'No messages yet'}
 </Typography>
 }
 />
 {conv.unreadCount > 0 && (
 <Chip
 label={conv.unreadCount}
 size="small"
 sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600 }}
 />
 )}
 </ListItem>
 ))
 )}
 </List>
 )}
 </Paper>

 {/* Messages Panel */}
 <Paper className="messages-panel" elevation={0}>
 {selectedConversation ? (
 <>
 {/* Chat Header */}
 <Box className="chat-header">
 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
 <Avatar sx={{ bgcolor: '#10b981' }}>
 {selectedConversation.subject?.charAt(0).toUpperCase() || 'C'}
 </Avatar>
 <Box>
 <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
 {selectedConversation.subject}
 </Typography>
 <Typography variant="caption" sx={{ color: '#6b7280' }}>
 {selectedConversation.status === 'ACTIVE' ? '● Active' : 'Closed'}
 </Typography>
 </Box>
 </Box>
 <IconButton>
 <MoreVertIcon />
 </IconButton>
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
 <Avatar sx={{ width: 32, height: 32, bgcolor: '#10b981' }}>
 {msg.senderName?.charAt(0).toUpperCase() || 'U'}
 </Avatar>
 )}
 <Box className="message-bubble">
 {!isOwnMessage && (
 <Typography variant="caption" sx={{ fontWeight: 600, color: '#10b981', mb: 0.5 }}>
 {msg.senderName || 'User'}
 </Typography>
 )}
 <Typography variant="body1">{msg.content}</Typography>
 <Typography variant="caption" className="message-time">
 {formatTime(msg.timestamp || msg.createdAt)}
 </Typography>
 </Box>
 </Box>
 );
 })}
 
 {/* Typing Indicator */}
 {typingUsers.size > 0 && (
 <Box className="typing-indicator">
 <Typography variant="caption" sx={{ color: '#6b7280', fontStyle: 'italic' }}>
 {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
 </Typography>
 </Box>
 )}
 
 <div ref={messagesEndRef} />
 </Box>

 {/* Input Area */}
 <Box className="message-input-area">
 <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
 <IconButton color="success">
 <AttachFileIcon />
 </IconButton>
 <TextField
 fullWidth
 placeholder="Type a message..."
 value={messageInput}
 onChange={handleTyping}
 disabled={sending || selectedConversation.status !== 'ACTIVE'}
 variant="outlined"
 size="small"
 sx={{
 '& .MuiOutlinedInput-root': {
 borderRadius: '24px',
 bgcolor: '#f9fafb'
 }
 }}
 />
 <IconButton
 type="submit"
 disabled={!messageInput.trim() || sending}
 sx={{
 bgcolor: '#10b981',
 color: 'white',
 '&:hover': { bgcolor: '#059669' },
 '&:disabled': { bgcolor: '#d1d5db' }
 }}
 >
 {sending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <SendIcon />}
 </IconButton>
 </form>
 </Box>
 </>
 ) : (
 <Box className="no-conversation-selected">
 <ChatBubbleOutlineIcon sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
 <Typography variant="h5" sx={{ color: '#6b7280', fontWeight: 600 }}>
 Select a conversation
 </Typography>
 <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>
 Choose a conversation from the list to start messaging
 </Typography>
 </Box>
 )}
 </Paper>
 </Box>
 </Container>

 {/* New Conversation Dialog */}
 <Dialog open={newConversationDialog} onClose={() => setNewConversationDialog(false)} maxWidth="sm" fullWidth>
 <DialogTitle sx={{ fontWeight: 700, color: '#1f2937' }}>
 Start New Conversation
 <IconButton
 onClick={() => setNewConversationDialog(false)}
 sx={{ position: 'absolute', right: 8, top: 8 }}
 >
 <CloseIcon />
 </IconButton>
 </DialogTitle>
 <DialogContent>
 <TextField
 fullWidth
 label="Post ID"
 value={newConversationData.postId}
 onChange={(e) => setNewConversationData({ ...newConversationData, postId: e.target.value })}
 margin="normal"
 color="success"
 />
 <TextField
 fullWidth
 label="Subject"
 value={newConversationData.subject}
 onChange={(e) => setNewConversationData({ ...newConversationData, subject: e.target.value })}
 margin="normal"
 color="success"
 multiline
 rows={2}
 />
 </DialogContent>
 <DialogActions sx={{ p: 2 }}>
 <Button onClick={() => setNewConversationDialog(false)}>
 Cancel
 </Button>
 <Button
 onClick={handleCreateConversation}
 variant="contained"
 sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
 >
 Create
 </Button>
 </DialogActions>
 </Dialog>
 </>
 );
}
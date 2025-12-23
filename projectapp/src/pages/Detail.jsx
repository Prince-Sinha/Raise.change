import { useState, useEffect } from 'react';
import {
 Avatar,
 TextField,
 Button,
 IconButton,
 Typography,
 Box,
 Collapse,
 CircularProgress,
 Backdrop,
 Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import Create from './Create';
import postWebSocketService from '../services/postWebSocketService';
import '../styles/NestedComments.css';

// Recursive Comment Component
const CommentItem = ({ comment, postId, onReplySuccess, level = 0 }) => {
 const [showReplyBox, setShowReplyBox] = useState(false);
 const [replyText, setReplyText] = useState('');
 const [replying, setReplying] = useState(false);
 const [showReplies, setShowReplies] = useState(false); // Collapsed by default
 const [children, setChildren] = useState([]);
 const [loadingChildren, setLoadingChildren] = useState(false);
 const currentUserId = localStorage.getItem('_id');

 // Helper function to fetch user details
 const fetchUserDetailsForComment = async (userId) => {
 try {
 const response = await fetch(`https://user-service-26b4.onrender.com/api/v1/users/${userId}`);
 const data = await response.json();
 return data.status === 'success' ? data.data : null;
 } catch (error) {
 console.error('Error fetching user:', error);
 return null;
 }
 };

 // Load child comments when expanding
 const loadChildren = async () => {
 if (children.length === 0 && comment.id) {
 setLoadingChildren(true);
 try {
 const response = await fetch(`https://opinion-service.onrender.com/api/v1/opinions/${comment.id}/children`);
 const resData = await response.json();
 
 if (resData.status === 'success' && resData.data) {
 // Fetch user details for each child comment
 const childrenWithUsers = await Promise.all(
 resData.data.map(async (child) => {
 if (child.userId) {
 const user = await fetchUserDetailsForComment(child.userId);
 return { ...child, user, children: [] };
 }
 return { ...child, children: [] };
 })
 );
 setChildren(childrenWithUsers);
 }
 } catch (error) {
 console.error('Error loading children:', error);
 } finally {
 setLoadingChildren(false);
 }
 }
 };

 useEffect(() => {
 if (comment.children && comment.children.length > 0) {
 setChildren(comment.children);
 }
 }, [comment.children]);

 const handleReply = async (e) => {
 e.preventDefault();
 if (!replyText.trim()) return;

 const userId = localStorage.getItem('_id');
 const token = localStorage.getItem('token');
 
 if (!userId) {
 toast.info('Please login to reply');
 return;
 }

 if (!token) {
 toast.error('No authentication token found. Please login again.');
 return;
 }

 setReplying(true);
 try {
 const response = await fetch('https://opinion-service.onrender.com/api/v1/opinions', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 postId: postId,
 userId: userId,
 comment: replyText,
 parentId: comment.id
 })
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.message || 'Failed to post reply');
 }

 toast.success('Reply posted successfully');
 setReplyText('');
 setShowReplyBox(false);
 
 // Reload children to show new reply with user data
 const childResponse = await fetch(`https://opinion-service.onrender.com/api/v1/opinions/${comment.id}/children`);
 const childData = await childResponse.json();
 
 if (childData.status === 'success' && childData.data) {
 const childrenWithUsers = await Promise.all(
 childData.data.map(async (child) => {
 if (child.userId) {
 const user = await fetchUserDetailsForComment(child.userId);
 return { ...child, user, children: [] };
 }
 return { ...child, children: [] };
 })
 );
 setChildren(childrenWithUsers);
 setShowReplies(true);
 }
 
 if (onReplySuccess) onReplySuccess();
 } catch (error) {
 toast.error(error.message);
 } finally {
 setReplying(false);
 }
 };

 const handleDelete = async () => {
 if (!window.confirm('Delete this comment and all its replies?')) return;

 try {
 const response = await fetch(`https://opinion-service.onrender.com/api/v1/opinions/${comment.id}`, {
 method: 'DELETE'
 });

 if (!response.ok) {
 throw new Error('Failed to delete comment');
 }

 toast.success('Comment deleted');
 if (onReplySuccess) onReplySuccess();
 } catch (error) {
 toast.error(error.message);
 }
 };

 const toggleReplies = () => {
 setShowReplies(!showReplies);
 if (!showReplies && children.length === 0) {
 loadChildren();
 }
 };

 const hasReplies = children.length > 0 || (comment.replyCount && comment.replyCount > 0);

 return (
 <Box className={`comment-item level-${Math.min(level, 5)}`}>
 <Box className="comment-line" />
 
 <Box className="comment-content-wrapper">
 <Avatar
 alt={comment.user?.name || 'User'}
 src={comment.user?.photo ? `https://backend-92s7.onrender.com/userimg/${comment.user.photo}` : '/default.jpg'}
 sx={{
 width: level === 0 ? 48 : 40,
 height: level === 0 ? 48 : 40,
 border: '2px solid #10b981'
 }}
 >
 {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
 </Avatar>

 <Box className="comment-body">
 <Box className="comment-header">
 <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
 {comment.user?.name || 'Anonymous'}
 </Typography>
 <Typography variant="caption" sx={{ color: '#9ca3af' }}>
 {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
 </Typography>
 </Box>

 <Typography variant="body1" sx={{ color: '#4b5563', my: 1, lineHeight: 1.6 }}>
 {comment.comment || comment.opinion || 'No content'}
 </Typography>

 <Box className="comment-actions">
 <Button
 size="small"
 startIcon={<ReplyIcon />}
 onClick={() => setShowReplyBox(!showReplyBox)}
 sx={{
 color: '#10b981',
 textTransform: 'none',
 '&:hover': { bgcolor: '#ecfdf5' }
 }}
 >
 Reply
 </Button>

 {hasReplies && (
 <Button
 size="small"
 endIcon={showReplies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
 onClick={toggleReplies}
 sx={{
 color: '#6b7280',
 textTransform: 'none',
 '&:hover': { bgcolor: '#f3f4f6' }
 }}
 >
 {loadingChildren ? (
 <CircularProgress size={16} sx={{ mr: 1 }} />
 ) : (
 `${children.length || comment.replyCount || 0} ${children.length === 1 ? 'reply' : 'replies'}`
 )}
 </Button>
 )}

 {currentUserId === comment.user?.id && (
 <IconButton
 size="small"
 onClick={handleDelete}
 sx={{ color: '#ef4444', ml: 'auto' }}
 >
 <DeleteIcon fontSize="small" />
 </IconButton>
 )}
 </Box>

 {/* Reply Box */}
 <Collapse in={showReplyBox}>
 <Box className="reply-box">
 <form onSubmit={handleReply}>
 <TextField
 fullWidth
 size="small"
 multiline
 rows={2}
 placeholder="Write a reply..."
 value={replyText}
 onChange={(e) => setReplyText(e.target.value)}
 disabled={replying}
 color="success"
 sx={{
 '& .MuiOutlinedInput-root': {
 borderRadius: '8px'
 }
 }}
 />
 <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
 <Button
 size="small"
 onClick={() => {
 setShowReplyBox(false);
 setReplyText('');
 }}
 >
 Cancel
 </Button>
 <Button
 type="submit"
 size="small"
 variant="contained"
 disabled={!replyText.trim() || replying}
 sx={{
 bgcolor: '#10b981',
 '&:hover': { bgcolor: '#059669' }
 }}
 endIcon={replying ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
 >
 Reply
 </Button>
 </Box>
 </form>
 </Box>
 </Collapse>

 {/* Nested Replies */}
 <Collapse in={showReplies}>
 <Box className="nested-comments">
 {children.map((child) => (
 <CommentItem
 key={child.id}
 comment={child}
 postId={postId}
 onReplySuccess={onReplySuccess}
 level={level + 1}
 />
 ))}
 </Box>
 </Collapse>
 </Box>
 </Box>
 </Box>
 );
};

export default function Detail() {
 const { id } = useParams();
 const [postDetail, setPostDetail] = useState({
 title: '',
 postImg: '',
 problemStatement: '',
 user: {}
 });
 const [rootComments, setRootComments] = useState([]);
 const [totalCommentCount, setTotalCommentCount] = useState(0);
 const [loading, setLoading] = useState(false);
 const [inputValue, setInputValue] = useState('');
 const [posting, setPosting] = useState(false);
 
 // Support/Upvote state
 const [upvoteCount, setUpvoteCount] = useState(0);
 const [hasSupported, setHasSupported] = useState(false);
 const [supporting, setSupporting] = useState(false);
 const [animateSupport, setAnimateSupport] = useState(false);
 
 const currentUserId = localStorage.getItem('_id');
 const userDept = localStorage.getItem('dept');

 useEffect(() => {
 loadPostAndComments();
 }, [id]);

 // 🔔 WebSocket for Real-time Upvote Updates
 useEffect(() => {
 // Connect to WebSocket
 postWebSocketService.connect(() => {
 console.log('✅ WebSocket connected - subscribing to upvotes for post:', id);
 
 // Subscribe to upvote updates for this specific post
 postWebSocketService.subscribeToPostUpvotes(id, (data) => {
 console.log('🔔 Upvote update received for post:', data);
 
 if (data.type === 'UPVOTE') {
 // Update upvote count in real-time
 setUpvoteCount(data.supportCount);
 
 // Trigger animation
 setAnimateSupport(true);
 setTimeout(() => setAnimateSupport(false), 600);
 }
 });
 });

 // Cleanup on unmount
 return () => {
 postWebSocketService.unsubscribe(`/topic/posts/${id}`);
 };
 }, [id]);

 // Helper function to fetch user details
 const fetchUserDetails = async (userId) => {
 try {
 const response = await fetch(`https://user-service-26b4.onrender.com/api/v1/users/${userId}`);
 const data = await response.json();
 return data.status === 'success' ? data.data : null;
 } catch (error) {
 console.error('Error fetching user:', error);
 return null;
 }
 };

 // Helper function to build tree from flat list
 const buildCommentTree = (flatComments) => {
 const commentMap = {};
 const rootComments = [];
 
 // First pass: create map and fetch user data
 flatComments.forEach(comment => {
 commentMap[comment.id] = { ...comment, children: [] };
 });
 
 // Second pass: build tree structure
 flatComments.forEach(comment => {
 if (comment.parentId && commentMap[comment.parentId]) {
 // Add as child to parent
 commentMap[comment.parentId].children.push(commentMap[comment.id]);
 } else {
 // Root level comment
 rootComments.push(commentMap[comment.id]);
 }
 });
 
 return rootComments;
 };

 const loadPostAndComments = async () => {
 setLoading(true);
 try {
 // Load post details from post-service
 const postResponse = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/${id}`);
 const postData = await postResponse.json();
 
 if (postResponse.ok) {
 const post = postData.data;
 
 // Handle postImg array
 if (post.postImg && Array.isArray(post.postImg) && post.postImg.length > 0) {
 post.postImg = post.postImg[0];
 }
 
 // Fetch user details from user-service if we only have userId
 if (post.userId && !post.user) {
 const userData = await fetchUserDetails(post.userId);
 if (userData) {
 post.user = userData;
 }
 }
 
 setPostDetail(post);
 }

 // Load ALL comments in hierarchical order (with depth already calculated)
 try {
 const hierarchicalResponse = await fetch(`https://opinion-service.onrender.com/api/v1/opinions/post/${id}/hierarchical`);
 const hierarchicalData = await hierarchicalResponse.json();
 
 if (hierarchicalData.status === 'success' && hierarchicalData.data) {
 // Fetch user details for ALL comments
 const commentsWithUsers = await Promise.all(
 hierarchicalData.data.map(async (comment) => {
 if (comment.userId) {
 const user = await fetchUserDetails(comment.userId);
 return { ...comment, user };
 }
 return comment;
 })
 );
 
 // Build tree structure from flat hierarchical data
 const tree = buildCommentTree(commentsWithUsers);
 setRootComments(tree);
 setTotalCommentCount(commentsWithUsers.length); // Total count includes all nested
 }
 } catch (error) {
 console.error('Error loading hierarchical comments:', error);
 toast.error('Failed to load comments');
 }
 } catch (error) {
 console.error('Error:', error);
 toast.error('Failed to load post details');
 } finally {
 setLoading(false);
 }
 };

 const handlePostComment = async (e) => {
 e.preventDefault();
 if (!inputValue.trim()) return;

 const userid = localStorage.getItem('_id');
 const token = localStorage.getItem('token');
 
 if (!userid) {
 toast.info('Please Login to write your opinion');
 return;
 }

 if (!token) {
 toast.error('No authentication token found. Please login again.');
 return;
 }

 setPosting(true);
 try {
 const response = await fetch('https://opinion-service.onrender.com/api/v1/opinions', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 postId: id,
 userId: userid,
 comment: inputValue
 })
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.message || 'Failed to post opinion');
 }

 toast.success('Opinion posted successfully');
 setInputValue('');
 await loadPostAndComments();
 } catch (error) {
 toast.error(error.message);
 } finally {
 setPosting(false);
 }
 };

 const formatTime = (timestamp) => {
 if (!timestamp) return 'Unknown';
 const now = new Date();
 const postDate = new Date(timestamp);
 const diffInMs = now - postDate;
 const diffInMins = Math.floor(diffInMs / 60000);
 const diffInHours = Math.floor(diffInMs / 3600000);
 const diffInDays = Math.floor(diffInMs / 86400000);
 const diffInMonths = Math.floor(diffInMs / 2592000000);
 const diffInYears = Math.floor(diffInMs / 31536000000);

 if (diffInYears > 0) return `${diffInYears}y ago`;
 if (diffInMonths > 0) return `${diffInMonths}mo ago`;
 if (diffInDays > 0) return `${diffInDays}d ago`;
 if (diffInHours > 0) return `${diffInHours}h ago`;
 if (diffInMins > 0) return `${diffInMins}m ago`;
 return 'just now';
 };

 return (
 <>
 <ToastContainer position="bottom-left" autoClose={5000} theme="light" />
 <Backdrop sx={{ color: '#fff', zIndex: 9999 }} open={loading}>
 <CircularProgress color="success" />
 </Backdrop>

 <div id="bar-sider">
 <div className="post-detail-modern">
 {/* Post Header */}
 <div className="post-header-section">
 <div className="reddit-style-header">
 <Avatar
 alt={postDetail.user?.name || 'User'}
 src={postDetail.user?.photo ? `https://backend-92s7.onrender.com/userimg/${postDetail.user.photo}` : '/default.jpg'}
 sx={{
 width: 48,
 height: 48,
 border: '2px solid #10b981',
 fontSize: '1.25rem',
 fontWeight: 600,
 bgcolor: '#10b981'
 }}
 >
 {postDetail.user?.name?.charAt(0).toUpperCase() || 'U'}
 </Avatar>
 <div className="reddit-style-info">
 <div className="reddit-style-top">
 <span className="reddit-style-username">
 {postDetail.user?.name || 'Unknown User'}
 </span>
 <span className="reddit-separator">•</span>
 <span className="reddit-time">
 {formatTime(postDetail.createdAt)}
 </span>
 </div>
 </div>
 </div>

 <h1 className="post-title-modern">{postDetail.title}</h1>
 </div>

 {/* Post Content */}
 <div className="post-content-section">
 {postDetail.postImg != "" && (
 <div className="post-image-container">
 <img src={postDetail.postImg} alt={postDetail.title} className="post-image-modern" />
 </div>
 )}
 <div className="post-description-modern">
 <p>{postDetail.problemStatement}</p>
 </div>
 </div>

 {/* Comments Section */}
 <div className="opinions-section-modern">
 <h3 className="opinions-header">
 <span className="opinions-icon">💬</span>
 Write Your's Opinion ({totalCommentCount})
 </h3>

 {/* Comment Input */}
 <div className="opinion-form-modern">
 <form onSubmit={handlePostComment} className="opinion-form-content">
 <TextField
 name="opinion"
 fullWidth
 color="success"
 label="Share your thoughts..."
 variant="outlined"
 multiline
 rows={3}
 value={inputValue}
 onChange={(e) => setInputValue(e.target.value)}
 disabled={posting}
 sx={{
 '& .MuiOutlinedInput-root': {
 borderRadius: '12px'
 }
 }}
 />
 <button
 type="submit"
 className="opinion-submit-btn"
 disabled={!inputValue.trim() || posting}
 >
 {posting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SendIcon sx={{ fontSize: 20 }} />}
 <span>{posting ? 'Posting...' : 'Post Opinion'}</span>
 </button>
 </form>
 </div>

 {/* Comments List */}
 <div className="comments-thread">
 {rootComments.length === 0 ? (
 <Box sx={{ textAlign: 'center', py: 4, color: '#9ca3af' }}>
 <Typography>No comments yet. Be the first to share your thoughts!</Typography>
 </Box>
 ) : (
 rootComments.map((comment) => (
 <CommentItem
 key={comment.id}
 comment={comment}
 postId={id}
 onReplySuccess={loadPostAndComments}
 level={0}
 />
 ))
 )}
 </div>
 </div>
 </div>
 <Create />
 </div>
 </>
 );
}

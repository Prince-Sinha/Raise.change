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
 Backdrop
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';
import Create from './Create';
import opinionService from '../services/opinionService';
import '../styles/NestedComments.css';

// Recursive Comment Component
const CommentItem = ({ comment, postId, onReplySuccess, level = 0 }) => {
 const [showReplyBox, setShowReplyBox] = useState(false);
 const [replyText, setReplyText] = useState('');
 const [replying, setReplying] = useState(false);
 const [showReplies, setShowReplies] = useState(true);
 const [children, setChildren] = useState([]);
 const [loadingChildren, setLoadingChildren] = useState(false);
 const currentUserId = localStorage.getItem('_id');

 // Load child comments when expanding
 const loadChildren = async () => {
 if (children.length === 0 && comment.id) {
 setLoadingChildren(true);
 try {
 const response = await opinionService.getChildComments(comment.id);
 setChildren(response.data || []);
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
 if (!userId) {
 toast.info('Please login to reply');
 return;
 }

 setReplying(true);
 try {
 await opinionService.createOpinion(postId, replyText, comment.id);
 toast.success('Reply posted successfully');
 setReplyText('');
 setShowReplyBox(false);
 
 // Reload children to show new reply
 const response = await opinionService.getChildComments(comment.id);
 setChildren(response.data || []);
 setShowReplies(true);
 
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
 await opinionService.deleteOpinion(comment.id);
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
 src={comment.user?.photo || '/default.jpg'}
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
 {comment.opinion || comment.content}
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

export default function DetailWithNestedComments() {
 const { id } = useParams();
 const [postDetail, setPostDetail] = useState({
 title: '',
 photo: '',
 problemStatement: '',
 user: {}
 });
 const [rootComments, setRootComments] = useState([]);
 const [loading, setLoading] = useState(false);
 const [inputValue, setInputValue] = useState('');
 const [posting, setPosting] = useState(false);

 useEffect(() => {
 loadPostAndComments();
 }, [id]);

 const loadPostAndComments = async () => {
 setLoading(true);
 try {
 // Load post details
 const response = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/${id}`);
 const resData = await response.json();
 
 if (response.ok) {
 setPostDetail(resData.data.post || resData.data);
 }

 // Load hierarchical comments
 try {
 const commentsResponse = await opinionService.getHierarchicalComments(id);
 setRootComments(commentsResponse.data || []);
 } catch (error) {
 console.error('Error loading comments:', error);
 // Fallback to flat comments if hierarchical fails
 try {
 const flatCommentsResponse = await opinionService.getOpinionsByPostId(id);
 setRootComments(flatCommentsResponse.data || []);
 } catch (fallbackError) {
 console.error('Error loading flat comments:', fallbackError);
 }
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
 if (!userid) {
 toast.info('Please Login to write your opinion');
 return;
 }

 setPosting(true);
 try {
 await opinionService.createOpinion(id, inputValue);
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
 src={postDetail.user?.photo || '/default.jpg'}
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
 {postDetail.photo && (
 <div className="post-image-container">
 <img src={postDetail.photo} alt={postDetail.title} className="post-image-modern" />
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
 Discussion ({rootComments.length})
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
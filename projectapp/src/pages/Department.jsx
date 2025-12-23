import { useState, useEffect, useMemo } from 'react';
import { NavLink, Form } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Department.css';
import { 
 Box, 
 Tabs, 
 Tab, 
 Card, 
 CardContent, 
 Typography, 
 Avatar, 
 Chip,
 CircularProgress,
 Alert,
 Button,
 Grid,
 FormControl,
 InputLabel,
 Select,
 MenuItem,
 TextField
} from '@mui/material';
import {
 Dashboard as DashboardIcon,
 PendingActions as PendingIcon,
 CheckCircle as CheckCircleIcon,
 DriveFileRenameOutlineOutlined as DateIcon,
 QuestionAnswerOutlined as CommentIcon,
 ThumbUpOffAlt as UpvoteIcon,
 Flag as FlagIcon,
 Chat as ChatIcon,
 FilterList as FilterListIcon,
 Clear as ClearIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#3b82f6'];

export default function Department() {
 const [currentTab, setCurrentTab] = useState(0);
 const [unresolvedPosts, setUnresolvedPosts] = useState([]);
 const [resolvedPosts, setResolvedPosts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [stats, setStats] = useState({ unresolved: 0, resolved: 0 });
 
 // Filter states for dashboard analytics
 const [stateFilter, setStateFilter] = useState('');
 const [cityFilter, setCityFilter] = useState('');
 const [startDate, setStartDate] = useState('');
 const [endDate, setEndDate] = useState('');
 
 const dept = localStorage.getItem('dept');

 const ChangeDate = (d) => {
 const date = new Date(d);
 const day = String(date.getDate()).padStart(2, '0');
 const month = String(date.getMonth() + 1).padStart(2, '0');
 const year = date.getFullYear();
 return `${day}-${month}-${year}`;
 };

 useEffect(() => {
 fetchPosts();
 }, []);

 const fetchPosts = async () => {
 setLoading(true);
 try {
 // Fetch unresolved posts
 const unresolvedRes = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/unresolved`);
 const unresolvedData = await unresolvedRes.json();
 
 // Fetch resolved posts
 const resolvedRes = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/resolved`);
 const resolvedData = await resolvedRes.json();

 if (unresolvedRes.ok && resolvedRes.ok) {
 // Filter by department - only show posts assigned to this department
 const unresolvedFiltered = (unresolvedData.data || []).filter(
 post => post.dept === dept
 );
 const resolvedFiltered = (resolvedData.data || []).filter(
 post => post.dept === dept
 );
 
 setUnresolvedPosts(unresolvedFiltered);
 setResolvedPosts(resolvedFiltered);
 setStats({
 unresolved: unresolvedFiltered.length,
 resolved: resolvedFiltered.length
 });
 }
 } catch (error) {
 toast.error('Failed to fetch posts', {
 position: "top-right",
 autoClose: 3000,
 });
 } finally {
 setLoading(false);
 }
 };

 const handleMarkResolved = async (postId) => {
 try {
 const response = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/${postId}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status: true })
 });

 if (response.ok) {
 toast.success('Post marked as resolved!', {
 position: "top-right",
 autoClose: 3000,
 });
 fetchPosts(); // Refresh data
 }
 } catch (error) {
 toast.error('Failed to mark post as resolved', {
 position: "top-right",
 autoClose: 3000,
 });
 }
 };

 const handleTabChange = (event, newValue) => {
 setCurrentTab(newValue);
 };

 // Prepare data for pie chart
 const pieData = [
 { name: 'Unresolved', value: stats.unresolved },
 { name: 'Resolved', value: stats.resolved },
 ];

 const renderDashboard = () => (
 <Box sx={{ maxWidth: 1400, margin: '0 auto', padding: { xs: 2, sm: 3, md: 4 } }}>
 {/* Stats Cards */}
 <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
 <Grid item xs={12} md={4}>
 <Card sx={{ 
 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 color: 'white',
 borderRadius: 3,
 boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
 }}>
 <CardContent sx={{ padding: { xs: 2, md: 3 } }}>
 <Box display="flex" alignItems="center" justifyContent="space-between">
 <Box>
 <Typography 
 variant="h3" 
 fontWeight="bold"
 sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
 >
 {stats.unresolved + stats.resolved}
 </Typography>
 <Typography 
 variant="body1"
 sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
 >
 Total Issues
 </Typography>
 </Box>
 <DashboardIcon sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, opacity: 0.8 }} />
 </Box>
 </CardContent>
 </Card>
 </Grid>

 <Grid item xs={12} md={4}>
 <Card sx={{ 
 background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
 color: 'white',
 borderRadius: 3,
 boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)'
 }}>
 <CardContent sx={{ padding: { xs: 2, md: 3 } }}>
 <Box display="flex" alignItems="center" justifyContent="space-between">
 <Box>
 <Typography 
 variant="h3" 
 fontWeight="bold"
 sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
 >
 {stats.unresolved}
 </Typography>
 <Typography 
 variant="body1"
 sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
 >
 Pending Issues
 </Typography>
 </Box>
 <PendingIcon sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, opacity: 0.8 }} />
 </Box>
 </CardContent>
 </Card>
 </Grid>

 <Grid item xs={12} md={4}>
 <Card sx={{ 
 background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
 color: 'white',
 borderRadius: 3,
 boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)'
 }}>
 <CardContent sx={{ padding: { xs: 2, md: 3 } }}>
 <Box display="flex" alignItems="center" justifyContent="space-between">
 <Box>
 <Typography 
 variant="h3" 
 fontWeight="bold"
 sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}
 >
 {stats.resolved}
 </Typography>
 <Typography 
 variant="body1"
 sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
 >
 Resolved Issues
 </Typography>
 </Box>
 <CheckCircleIcon sx={{ fontSize: { xs: 40, sm: 50, md: 60 }, opacity: 0.8 }} />
 </Box>
 </CardContent>
 </Card>
 </Grid>
 </Grid>

 {/* Pie Chart */}
 <Card sx={{ borderRadius: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
 <CardContent sx={{ padding: { xs: 2, md: 3 } }}>
 <Typography 
 variant="h5" 
 fontWeight="bold" 
 gutterBottom 
 textAlign="center" 
 sx={{ 
 mb: { xs: 2, md: 3 },
 fontSize: { xs: '1.25rem', md: '1.5rem' }
 }}
 >
 Issues Distribution
 </Typography>
 {(stats.unresolved > 0 || stats.resolved > 0) ? (
 <ResponsiveContainer 
 width="100%" 
 height={window.innerWidth < 640 ? 250 : window.innerWidth < 768 ? 300 : 400}
 >
 <PieChart>
 <Pie
 data={pieData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
 outerRadius={window.innerWidth < 640 ? 80 : window.innerWidth < 768 ? 100 : 120}
 fill="#8884d8"
 dataKey="value"
 >
 {pieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <Typography textAlign="center" color="text.secondary" sx={{ py: { xs: 4, md: 8 } }}>
 No data available
 </Typography>
 )}
 </CardContent>
 </Card>
 </Box>
 );

 const renderPostCard = (post, isResolved = false) => (
 <Card key={post._id} sx={{ 
 mb: 3, 
 borderRadius: 3,
 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
 transition: 'all 0.3s ease',
 '&:hover': {
 boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
 transform: 'translateY(-4px)'
 }
 }}>
 <CardContent>
 {/* Header with status badge */}
 <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
 <Chip 
 icon={isResolved ? <CheckCircleIcon /> : <FlagIcon />}
 label={isResolved ? "Resolved" : "Needs Attention"}
 color={isResolved ? "success" : "warning"}
 sx={{ fontWeight: 600 }}
 />
 </Box>

 {/* Title and Description */}
 <Typography variant="h5" fontWeight="bold" gutterBottom>
 {post.title}
 </Typography>
 <Typography variant="body1" color="text.secondary" paragraph>
 {post.problemStatement}
 </Typography>

 {/* User and Stats Info */}
 <Box display="flex" flexWrap="wrap" gap={2} alignItems="center" mb={2}>
 <Box display="flex" alignItems="center" gap={1}>
 <Avatar 
 src={post.user?.photo ? `https://backend-92s7.onrender.com/userimg/${post.user.photo}` : '/default.jpg'}
 sx={{ width: 32, height: 32, bgcolor: '#10b981' }}
 >
 {post.user?.name?.charAt(0).toUpperCase() || 'U'}
 </Avatar>
 <Typography variant="body2" fontWeight="600">
 {post.user?.name || 'Anonymous'}
 </Typography>
 </Box>

 <Chip icon={<DateIcon />} label={ChangeDate(post.createdAt)} size="small" variant="outlined" />
 <Chip icon={<CommentIcon />} label={`${post.opinions?.length || 0} comments`} size="small" variant="outlined" />
 <Chip icon={<UpvoteIcon />} label={`${post.UpVote || 0} upvotes`} size="small" variant="outlined" color="success" />
 </Box>

 {/* Action Buttons */}
 <Box display="flex" gap={2} flexWrap="wrap">
 {!isResolved && (
 <Button 
 variant="contained" 
 color="success" 
 onClick={() => handleMarkResolved(post._id)}
 sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
 >
 Mark as Resolved
 </Button>
 )}
 <Button 
 component={NavLink}
 to={`/dept/posts/${post._id}`}
 variant="outlined" 
 sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
 >
 View Details
 </Button>
 </Box>
 </CardContent>

 {/* Image if exists */}
 {post.photo && (
 <Box sx={{ height: 300, overflow: 'hidden' }}>
 <img 
 src={post.photo} 
 alt={post.title}
 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
 />
 </Box>
 )}
 </Card>
 );

 const renderPosts = (posts, isResolved = false) => (
 <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: { xs: 2, sm: 3, md: 4 } }}>
 {loading ? (
 <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
 <CircularProgress size={60} />
 </Box>
 ) : posts.length === 0 ? (
 <Alert 
 icon={<CheckCircleIcon fontSize="large" />} 
 severity="info"
 sx={{ 
 borderRadius: 3,
 fontSize: '1.1rem',
 '& .MuiAlert-icon': { fontSize: 40 }
 }}
 >
 {isResolved 
 ? 'No resolved issues yet' 
 : 'All issues have been resolved! Great job! 🎉'}
 </Alert>
 ) : (
 posts.map(post => renderPostCard(post, isResolved))
 )}
 </Box>
 );

 return (
 <>
 <ToastContainer
 position="top-right"
 autoClose={3000}
 hideProgressBar={false}
 theme="light"
 />

 {/* Modern Header */}
 <Box sx={{ 
 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
 color: 'white',
 py: { xs: 2, md: 3 },
 px: { xs: 2, md: 4 },
 boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
 }}>
 <Box 
 display="flex" 
 flexDirection={{ xs: 'column', md: 'row' }}
 justifyContent="space-between" 
 alignItems={{ xs: 'flex-start', md: 'center' }}
 gap={{ xs: 2, md: 0 }}
 maxWidth={1400} 
 margin="0 auto"
 >
 <Box display="flex" alignItems="center" gap={{ xs: 1, md: 2 }} flexWrap="wrap">
 <NavLink to="/">
 <img src="./../2R.png" alt="Logo" style={{ height: window.innerWidth < 640 ? 35 : 50 }} />
 </NavLink>
 <Box>
 <Typography 
 variant="h5" 
 fontWeight="bold"
 sx={{ fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}
 >
 {dept || 'Department'} Dashboard
 </Typography>
 <Typography 
 variant="body2" 
 sx={{ 
 opacity: 0.9,
 fontSize: { xs: '0.75rem', md: '0.875rem' },
 display: { xs: 'none', sm: 'block' }
 }}
 >
 Manage and resolve community issues
 </Typography>
 </Box>
 </Box>
 <Box display="flex" gap={2} width={{ xs: '100%', md: 'auto' }} flexWrap="wrap">
 {(
 <Button 
 component={NavLink}
 to="/dept/chat"
 variant="contained"
 startIcon={<ChatIcon />}
 sx={{ 
 bgcolor: 'rgba(255,255,255,0.2)', 
 color: 'white',
 border: '1px solid white',
 '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
 textTransform: 'none',
 fontWeight: 600,
 borderRadius: 2
 }}
 >
 Complaint Raised
 </Button>
 )}
 {dept ? (
 <Form action='/logout' method='post'>
 <Button 
 type="submit"
 variant="contained" 
 sx={{ 
 bgcolor: 'white', 
 color: '#667eea',
 '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
 textTransform: 'none',
 fontWeight: 600,
 borderRadius: 2
 }}
 >
 Logout
 </Button>
 </Form>
 ) : (
 <Button 
 component={NavLink}
 to="/login/dept"
 variant="contained"
 sx={{ 
 bgcolor: 'white', 
 color: '#667eea',
 '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
 textTransform: 'none',
 fontWeight: 600,
 borderRadius: 2
 }}
 >
 Login
 </Button>
 )}
 </Box>
 </Box>
 </Box>

 {/* Modern Tabs */}
 <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', position: 'sticky', top: 0, zIndex: 100 }}>
 <Tabs 
 value={currentTab} 
 onChange={handleTabChange} 
 variant={window.innerWidth < 640 ? 'fullWidth' : 'standard'}
 centered={window.innerWidth >= 640}
 sx={{
 '& .MuiTab-root': {
 textTransform: 'none',
 fontWeight: 600,
 fontSize: { xs: '0.75rem', md: '1rem' },
 minHeight: { xs: 56, md: 70 },
 minWidth: { xs: 'auto', md: 120 },
 padding: { xs: '12px 8px', md: '12px 16px' }
 }
 }}
 >
 <Tab 
 icon={<DashboardIcon />} 
 label={window.innerWidth < 640 ? null : "Dashboard"} 
 iconPosition="start"
 aria-label="Dashboard"
 />
 <Tab 
 icon={<PendingIcon />} 
 label={window.innerWidth < 640 ? stats.unresolved : `Unresolved (${stats.unresolved})`} 
 iconPosition={window.innerWidth < 640 ? "top" : "start"}
 aria-label={`Unresolved ${stats.unresolved}`}
 />
 <Tab 
 icon={<CheckCircleIcon />} 
 label={window.innerWidth < 640 ? stats.resolved : `Resolved (${stats.resolved})`} 
 iconPosition={window.innerWidth < 640 ? "top" : "start"}
 aria-label={`Resolved ${stats.resolved}`}
 />
 </Tabs>
 </Box>

 {/* Tab Content */}
 <Box sx={{ bgcolor: '#f8f9fa', minHeight: 'calc(100vh - 200px)', py: 4 }}>
 {currentTab === 0 && renderDashboard()}
 {currentTab === 1 && renderPosts(unresolvedPosts, false)}
 {currentTab === 2 && renderPosts(resolvedPosts, true)}
 </Box>
 </>
 );
}
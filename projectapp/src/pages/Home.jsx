import { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import postWebSocketService from '../services/postWebSocketService';
import {
 Card,
 CardContent,
 Avatar,
 Chip,
 Box,
 Typography,
 Button,
 CircularProgress,
 Backdrop,
 FormControl,
 InputLabel,
 Select,
 MenuItem,
 IconButton
} from '@mui/material';
import {
 Flag as FlagIcon,
 ThumbUp as ThumbUpIcon,
 Comment as CommentIcon,
 Edit as EditIcon,
 CheckCircle as CheckCircleIcon,
 FilterList as FilterListIcon,
 Clear as ClearIcon
} from '@mui/icons-material';
import Create from './Create';

export default function Home() {
 const [unresolved, setUnresolved] = useState([]);
 const [support, setSupport] = useState([]);
 const [loading, setLoading] = useState(true);
 const [cityFilter, setCityFilter] = useState('');
 const [stateFilter, setStateFilter] = useState('');
 
 const id = localStorage.getItem('_id');

 const ChangeDate = (d) => {
 const date = new Date(d);
 const day = String(date.getDate()).padStart(2, '0');
 const month = String(date.getMonth() + 1).padStart(2, '0');
 const year = date.getFullYear();
 return `${day}-${month}-${year}`;
 };

 useEffect(() => {
 async function fetchPost() {
 setLoading(true);
 try {
 const response = await fetch('https://post-service-ybd1.onrender.com/api/v1/posts/unresolved');
 const resData = await response.json();
 
 if (!response.ok) {
 toast.error(resData.message, {
 position: "top-right",
 autoClose: 5000,
 theme: "light"
 });
 setLoading(false);
 return;
 }

 setUnresolved(resData.data);

 if (id) {
 const res = await fetch(`https://user-service-26b4.onrender.com/api/v1/users/${id}`);
 const userresData = await res.json();
 
 if (!res.ok) {
 toast.error(resData.message, {
 position: "top-right",
 autoClose: 5000,
 theme: "light"
 });
 return;
 }

 setSupport(userresData.data.supported || []);
 }
 } catch (error) {
 console.error('Error fetching posts:', error);
 toast.error('Failed to fetch posts', {
 position: "top-right",
 autoClose: 3000,
 hideProgressBar: false,
 closeOnClick: true,
 pauseOnHover: true,
 draggable: true,
 theme: "light"
 });
 } finally {
 setLoading(false);
 }
 }
 
 fetchPost();
 }, []);

 // 🔔 WebSocket for Real-time New Posts
 useEffect(() => {
 // Only connect if not already connected
 if (!postWebSocketService.isConnected()) {
 postWebSocketService.connect(() => {
 console.log('✅ Connected to WebSocket - subscribing to new posts');
 });
 }
 
 // Subscribe to new posts (even if already connected)
 postWebSocketService.subscribeToNewPosts((data) => {
 console.log('🔔 New post received:', data);
 
 if (data.type === 'NEW_POST' && data.post) {
 // Add new post to the top of the list
 setUnresolved(prevPosts => [data.post, ...prevPosts]);
 
 // Show notification
 toast.success(`New issue posted: ${data.post.title}`, {
 position: "top-right",
 autoClose: 4000,
 theme: "light"
 });
 }
 });

 // Cleanup: DON'T disconnect - let connection persist
 // Only unsubscribe from this specific subscription
 return () => {
 // Keep the connection alive, just unsubscribe from this component's subscription
 // The subscription cleanup is handled internally by the service
 };
 }, []);

 // Extract unique cities and states for filters
 const { cities, states } = useMemo(() => {
 const citiesSet = new Set();
 const statesSet = new Set();
 
 unresolved.forEach(post => {
 if (post.user?.city) citiesSet.add(post.user.city);
 if (post.user?.state) statesSet.add(post.user.state);
 });
 
 return {
 cities: Array.from(citiesSet).sort(),
 states: Array.from(statesSet).sort()
 };
 }, [unresolved]);

 // Filter posts based on selected city/state
 const filteredPosts = useMemo(() => {
 let filtered = unresolved;
 
 if (cityFilter) {
 filtered = filtered.filter(post => post.user?.city === cityFilter);
 }
 
 if (stateFilter) {
 filtered = filtered.filter(post => post.user?.state === stateFilter);
 }
 
 return filtered;
 }, [unresolved, cityFilter, stateFilter]);

 const handleClearFilters = () => {
 setCityFilter('');
 setStateFilter('');
 };

 const handleSupport = async (postid) => {
 if (!id) {
 toast.info('Please Login to show Support!', {
 position: "top-right",
 autoClose: 5000,
 theme: "light",
 });
 return;
 }

 try {
 // Get JWT token
 const token = localStorage.getItem('token');
 
 // Call post-service upvote endpoint
 const response = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/${postid}/upvote`, {
 method: 'POST',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({ userId: id })
 });
 
 const resData = await response.json();

 if (!response.ok) {
 toast.error(resData.message || 'Failed to add support', {
 position: "top-right",
 autoClose: 5000,
 theme: "light"
 });
 return;
 }
 
 // Update support list locally
 setSupport(prev => [postid, ...prev]);
 
 // Update the post's support count in the list
 setUnresolved(prevPosts => 
 prevPosts.map(p => 
 p._id === postid 
 ? { ...p, support: [...(p.support || []), id] }
 : p
 )
 );
 
 toast.success('Support added successfully!', {
 position: "top-right",
 autoClose: 2000,
 theme: "light"
 });
 } catch (error) {
 console.error('Error adding support:', error);
 toast.error('Failed to add support', {
 position: "top-right",
 autoClose: 3000,
 theme: "light"
 });
 }
 };

 return (
 <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
 <Backdrop 
 sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} 
 open={loading}
 >
 <CircularProgress color="success" size={60} />
 </Backdrop>
 
 <ToastContainer
 position="top-right"
 autoClose={5000}
 hideProgressBar={false}
 newestOnTop={false}
 closeOnClick
 rtl={false}
 pauseOnFocusLoss
 draggable
 pauseOnHover
 theme="light"
 limit={3}
 />
 
 {/* Clean Hero Section */}
 <Box sx={{
 background: 'linear-gradient(to bottom, #f0f4f8 0%, #e8f0f7 100%)',
 py: 8,
 px: 4,
 textAlign: 'center'
 }}>
 <FlagIcon sx={{ fontSize: 48, mb: 2, color: '#10b981' }} />
 <Typography 
 variant="h2" 
 fontWeight="bold" 
 gutterBottom 
 sx={{ 
 mb: 2,
 background: 'linear-gradient(90deg, #10b981 0%, #5b7ad4 100%)',
 WebkitBackgroundClip: 'text',
 WebkitTextFillColor: 'transparent',
 backgroundClip: 'text'
 }}
 >
 Community Issues
 </Typography>
 <Typography 
 variant="h6" 
 sx={{ 
 color: '#64748b', 
 mb: 4, 
 maxWidth: 700, 
 margin: '0 auto 32px',
 fontWeight: 400
 }}
 >
 Voice your concerns, support causes, and make a difference in your community
 </Typography>
 <Button
 variant="contained"
 sx={{ 
 bgcolor: '#10b981',
 color: 'white',
 fontSize: '1rem', 
 py: 1.5,
 px: 4,
 fontWeight: 600,
 borderRadius: 3,
 textTransform: 'none',
 boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
 '&:hover': {
 bgcolor: '#059669',
 boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
 }
 }}
 >
 {unresolved.length} Active Issues
 </Button>
 </Box>

 {/* Issues List */}
 <Box sx={{ maxWidth: 1400, margin: '0 auto', px: 4, py: 6 }}>
 {/* Filter Bar */}
 {unresolved.length > 0 && (
 <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
 <CardContent>
 <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
 <FilterListIcon sx={{ color: '#10b981' }} />
 <Typography variant="h6" fontWeight="600">
 Filters
 </Typography>
 </Box>
 
 <FormControl sx={{ minWidth: 200 }} size="small">
 <InputLabel>Filter by City</InputLabel>
 <Select
 value={cityFilter}
 label="Filter by City"
 onChange={(e) => setCityFilter(e.target.value)}
 >
 <MenuItem value="">
 <em>All Cities</em>
 </MenuItem>
 {cities.map((city) => (
 <MenuItem key={city} value={city}>
 {city}
 </MenuItem>
 ))}
 </Select>
 </FormControl>

 <FormControl sx={{ minWidth: 200 }} size="small">
 <InputLabel>Filter by State</InputLabel>
 <Select
 value={stateFilter}
 label="Filter by State"
 onChange={(e) => setStateFilter(e.target.value)}
 >
 <MenuItem value="">
 <em>All States</em>
 </MenuItem>
 {states.map((state) => (
 <MenuItem key={state} value={state}>
 {state}
 </MenuItem>
 ))}
 </Select>
 </FormControl>

 {(cityFilter || stateFilter) && (
 <Button
 variant="outlined"
 startIcon={<ClearIcon />}
 onClick={handleClearFilters}
 sx={{ 
 borderColor: '#10b981',
 color: '#10b981',
 '&:hover': {
 borderColor: '#059669',
 bgcolor: 'rgba(16, 185, 129, 0.04)'
 }
 }}
 >
 Clear Filters
 </Button>
 )}

 <Chip
 label={`Showing ${filteredPosts.length} of ${unresolved.length} issues`}
 sx={{ 
 bgcolor: '#e8f5f1',
 color: '#10b981',
 fontWeight: 600,
 ml: 'auto'
 }}
 />
 </Box>
 </CardContent>
 </Card>
 )}

 {filteredPosts.length === 0 && !loading ? (
 <Card sx={{ 
 textAlign: 'center', 
 py: 8,
 borderRadius: 3,
 boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
 }}>
 <CardContent>
 <FlagIcon sx={{ fontSize: 80, color: '#d1d5db', mb: 2 }} />
 <Typography variant="h4" fontWeight="bold" color="text.secondary" gutterBottom>
 No Active Issues
 </Typography>
 <Typography variant="body1" color="text.secondary">
 All community issues have been resolved! 🎉
 </Typography>
 </CardContent>
 </Card>
 ) : (
 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
 {filteredPosts.map((el) => (
 <Card 
 key={el._id} 
 sx={{ 
 borderRadius: 3,
 boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
 transition: 'all 0.3s ease',
 overflow: 'hidden',
 '&:hover': {
 boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
 transform: 'translateY(-2px)'
 }
 }}
 >
 <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
 {/* Content Section */}
 <CardContent sx={{ flex: 1, p: 4 }}>
 {/* Title */}
 <Typography variant="h4" fontWeight="bold" gutterBottom>
 {el.title}
 </Typography>

 {/* Description */}
 <Typography 
 variant="body1" 
 color="text.secondary" 
 sx={{ 
 mb: 3,
 display: '-webkit-box',
 WebkitLineClamp: 3,
 WebkitBoxOrient: 'vertical',
 overflow: 'hidden',
 textOverflow: 'ellipsis',
 lineHeight: 1.6
 }}
 >
 {el.problemStatement}
 </Typography>

 {/* Buttons */}
 <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
 {support.includes(el._id) || (el.support && el.support.includes(id)) || el.user?._id === id ? (
 <Button
 variant="contained"
 disabled
 sx={{ 
 bgcolor: '#10b981',
 color: 'white',
 borderRadius: 2,
 textTransform: 'none',
 fontWeight: 600,
 px: 3,
 '&.Mui-disabled': {
 bgcolor: '#10b981',
 color: 'white',
 opacity: 0.7
 }
 }}
 >
 Supported
 </Button>
 ) : (
 <Button
 variant="contained"
 onClick={() => handleSupport(el._id)}
 sx={{ 
 bgcolor: '#10b981',
 color: 'white',
 borderRadius: 2,
 textTransform: 'none',
 fontWeight: 600,
 px: 3,
 '&:hover': {
 bgcolor: '#059669'
 }
 }}
 >
 Support
 </Button>
 )}
 
 <Button
 component={NavLink}
 to={`/posts/${el._id}`}
 variant="contained"
 sx={{ 
 bgcolor: '#10b981',
 color: 'white',
 borderRadius: 2,
 textTransform: 'none',
 fontWeight: 600,
 px: 3,
 '&:hover': {
 bgcolor: '#059669'
 }
 }}
 >
 View Details
 </Button>
 </Box>

 {/* User Info & Stats */}
 <Box>
 {/* User */}
 <Box display="flex" alignItems="center" gap={1} mb={2}>
 <Avatar 
 alt={el.user?.name || 'User'} 
 src={el.user?.photo ? `https://backend-92s7.onrender.com/userimg/${el.user.photo}` : '/default.jpg'}
 sx={{ width: 24, height: 24 }}
 />
 <Typography variant="body2" fontWeight="600">
 {el.user?.name || 'Anonymous'}
 </Typography>
 <EditIcon sx={{ fontSize: 16, color: '#3b82f6', ml: 2 }} />
 <Typography variant="body2" color="text.secondary">
 {ChangeDate(el.createdAt)}
 </Typography>
 </Box>

 {/* Stats */}
 <Box display="flex" gap={3}>
 <Box display="flex" alignItems="center" gap={0.5}>
 <CommentIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
 <Typography variant="body2" fontWeight="600">
 {el.opinions?.length || 0}
 </Typography>
 </Box>
 <Box display="flex" alignItems="center" gap={0.5}>
 <ThumbUpIcon sx={{ fontSize: 20, color: '#10b981' }} />
 <Typography variant="body2" fontWeight="600">
 {el.support?.length || 0}
 </Typography>
 </Box>
 </Box>
 </Box>
 </CardContent>

 {/* Image Section */}
 {el.photo && (
 <Box 
 sx={{ 
 position: 'relative',
 width: { xs: '100%', md: '400px' },
 minHeight: { xs: '250px', md: 'auto' }
 }}
 >
 <Box
 component="img"
 src={el.photo}
 alt={el.title}
 sx={{
 width: '100%',
 height: '100%',
 objectFit: 'cover'
 }}
 />
 <Chip 
 icon={<FlagIcon />}
 label="Needs Attention" 
 color="warning"
 sx={{ 
 position: 'absolute',
 top: 16,
 right: 16,
 fontWeight: 600
 }}
 />
 </Box>
 )}
 </Box>
 </Card>
 ))}
 </Box>
 )}
 </Box>
 
 <Create />
 </Box>
 );
}

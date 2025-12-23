import { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
 MenuItem
} from '@mui/material';
import {
 CheckCircle as CheckCircleIcon,
 ThumbUp as ThumbUpIcon,
 Comment as CommentIcon,
 Edit as EditIcon,
 FilterList as FilterListIcon,
 Clear as ClearIcon
} from '@mui/icons-material';
import Create from './Create';

export default function Resolved() {
 const [resolved, setResolved] = useState([]);
 const [loading, setLoading] = useState(true);
 const [cityFilter, setCityFilter] = useState('');
 const [stateFilter, setStateFilter] = useState('');

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
 const response = await fetch('https://post-service-ybd1.onrender.com/api/v1/posts/resolved');
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

 setResolved(resData.data);
 } catch (error) {
 toast.error('Failed to fetch posts', {
 position: "top-right",
 autoClose: 3000,
 theme: "light"
 });
 } finally {
 setLoading(false);
 }
 }
 
 fetchPost();
 }, []);

 // Extract unique cities and states for filters
 const { cities, states } = useMemo(() => {
 const citiesSet = new Set();
 const statesSet = new Set();
 
 resolved.forEach(post => {
 if (post.user?.city) citiesSet.add(post.user.city);
 if (post.user?.state) statesSet.add(post.user.state);
 });
 
 return {
 cities: Array.from(citiesSet).sort(),
 states: Array.from(statesSet).sort()
 };
 }, [resolved]);

 // Filter posts based on selected city/state
 const filteredPosts = useMemo(() => {
 let filtered = resolved;
 
 if (cityFilter) {
 filtered = filtered.filter(post => post.user?.city === cityFilter);
 }
 
 if (stateFilter) {
 filtered = filtered.filter(post => post.user?.state === stateFilter);
 }
 
 return filtered;
 }, [resolved, cityFilter, stateFilter]);

 const handleClearFilters = () => {
 setCityFilter('');
 setStateFilter('');
 };

 if (resolved.length === 0 && !loading) {
 return (
 <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
 <ToastContainer
 position="top-right"
 autoClose={5000}
 hideProgressBar={false}
 theme="light"
 />
 
 <Box sx={{
 flex: 1,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 py: 8
 }}>
 <Box sx={{ 
 textAlign: 'center',
 maxWidth: '600px',
 width: '100%',
 px: 4
 }}>
 <CheckCircleIcon sx={{ fontSize: 80, color: '#10b981', mb: 3 }} />
 <Typography variant="h3" fontWeight="bold" color="text.primary" gutterBottom>
 No Resolved Issues Yet
 </Typography>
 <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
 When issues are resolved, they will appear here 🎉
 </Typography>
 </Box>
 </Box>
 <Create />
 </Box>
 );
 }

 return (
 <>
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
 theme="light"
 />

 <div id="bar-sider">
 <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
 {/* Hero Section */}
 <Box sx={{
 background: 'linear-gradient(to bottom, #f0fdf4 0%, #e8f5e9 100%)',
 py: 8,
 px: 4,
 textAlign: 'center'
 }}>
 <CheckCircleIcon sx={{ fontSize: 48, mb: 2, color: '#10b981' }} />
 <Typography 
 variant="h2" 
 fontWeight="bold" 
 gutterBottom 
 sx={{ 
 mb: 2,
 color: '#10b981'
 }}
 >
 Resolved Issues
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
 Successfully addressed community concerns and implemented solutions
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
 {resolved.length} Resolved Issues
 </Button>
 </Box>

 {/* Issues List */}
 <Box sx={{ maxWidth: 1400, margin: '0 auto', px: 4, py: 6 }}>
 {/* Filter Bar */}
 {resolved.length > 0 && (
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
 label={`Showing ${filteredPosts.length} of ${resolved.length} issues`}
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
 {el.UpVote || 0}
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
 onError={(e) => {
 e.target.src = '/default.jpg';
 }}
 />
 <Chip 
 icon={<CheckCircleIcon />}
 label="Resolved" 
 color="success"
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
 </Box>
 
 <Create />
 </Box>
 </div>
 </>
 );
}
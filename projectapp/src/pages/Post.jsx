import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CircularProgress, Backdrop, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import Create from './Create';
import DefaultContent from '../components/DefaultContent';

export default function Post() {
   const [post, setPost] = useState([]);
   const [loading, setLoading] = useState(false);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [postToDelete, setPostToDelete] = useState(null);
   const location = useLocation();

   const id = localStorage.getItem('_id');

   const ChangeDate = (d) => {
      const date = new Date(d);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
   };

   useEffect(() => {
      async function fetchData() {
         setLoading(true);
         try {
            // Fetch user's posts
            const response = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/user/${id}`);
            const resData = await response.json();
            
            if (response.ok) {
               setPost(resData.data || []);
            } else {
               toast.error(resData.message || 'Failed to fetch posts', {
                  position: "top-right",
                  autoClose: 5000,
                  theme: "light"
               });
            }
         } catch (err) {
            console.error('Error fetching data:', err);
            toast.error('Something went wrong!', {
               position: "top-right",
               autoClose: 5000,
               theme: "light"
            });
         } finally {
            setLoading(false);
         }
      }

      fetchData();
   }, [location, id]);

   const handleDeleteClick = (postId) => {
      setPostToDelete(postId);
      setDeleteDialogOpen(true);
   };

   const handleDeleteConfirm = async () => {
      if (!postToDelete) return;

      setLoading(true);
      try {
         const response = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/${postToDelete}`, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json'
            }
         });

         const resData = await response.json();

         if (response.ok) {
            toast.success('Post deleted successfully!', {
               position: "top-right",
               autoClose: 3000,
               theme: "light"
            });
            
            // Remove deleted post from state
            setPost(post.filter(p => p.id !== postToDelete));
         } else {
            toast.error(resData.message || 'Failed to delete post', {
               position: "top-right",
               autoClose: 5000,
               theme: "light"
            });
         }
      } catch (err) {
         console.error('Error deleting post:', err);
         toast.error('Failed to delete post. Please try again.', {
            position: "top-right",
            autoClose: 5000,
            theme: "light"
         });
      } finally {
         setLoading(false);
         setDeleteDialogOpen(false);
         setPostToDelete(null);
      }
   };

   const handleDeleteCancel = () => {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
   };

   if (post.length === 0 && !loading) {
      return (
         <>
            <ToastContainer />
            <DefaultContent>You have not posted anything yet!</DefaultContent>
         </>
      );
   }

   return (
      <div id="bar-sider">
         <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
         >
            <CircularProgress color="success" />
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
         />

         {/* Delete Confirmation Dialog */}
         <Dialog
            open={deleteDialogOpen}
            onClose={handleDeleteCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
         >
            <DialogTitle id="alert-dialog-title">
               {"Delete Post?"}
            </DialogTitle>
            <DialogContent>
               <DialogContentText id="alert-dialog-description">
                  Are you sure you want to delete this post? This action cannot be undone.
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={handleDeleteCancel} color="primary">
                  Cancel
               </Button>
               <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
                  Delete
               </Button>
            </DialogActions>
         </Dialog>

         {post.map((el, i) => (
               <div key={el.id || i} className="content">
                  <div className="content-div">
                     <ul>
                        <li>
                           <h2>{el.title}</h2>
                        </li>
                        <li><p className='limited-paragraph'>{el.problemStatement}</p></li>
                     </ul>
                     <div className='content-div-info'>
                        <ul>
                           <li>
                              <DriveFileRenameOutlineOutlinedIcon color="primary" />
                              {ChangeDate(el.createdAt)}
                           </li>
                        </ul>
                        <ul>
                          
                        </ul>
                     </div>

                     {/* Action Buttons */}
                     <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Button
                           component={NavLink}
                           to={`/posts/${el.id}`}
                           variant="contained"
                           color="primary"
                           size="small"
                           sx={{ textTransform: 'none' }}
                        >
                           View Details
                        </Button>
                        <Button
                           variant="outlined"
                           color="error"
                           size="small"
                           startIcon={<DeleteIcon />}
                           onClick={() => handleDeleteClick(el.id)}
                           disabled={el.status === true}
                           sx={{ textTransform: 'none' }}
                           title={el.status === true ? "Cannot delete resolved posts" : "Delete this post"}
                        >
                           Delete
                        </Button>
                        {el.status === true && (
                           <span style={{ 
                              fontSize: '0.875rem', 
                              color: '#10b981', 
                              fontWeight: 600,
                              backgroundColor: '#d1fae5',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.375rem'
                           }}>
                              ✓ Resolved
                           </span>
                        )}
                     </div>
                  </div>
                  {el.postImg && el.postImg.length > 0 ? (
                     <div className='content-div-img'>
                        <img src={el.postImg[0]} alt={el.title} />
                     </div>
                  ) : null}
               </div>
         ))}
         <Create />
      </div>
   );
}

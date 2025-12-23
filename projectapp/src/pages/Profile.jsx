import ModeEditIcon from '@mui/icons-material/ModeEdit';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CancelIcon from '@mui/icons-material/Cancel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useState,useEffect} from 'react'
import {CircularProgress, Backdrop, TextField, Button, Box} from '@mui/material';

export default function Profile(){
    const [edit,setEdit]= useState(false);
    const [profileData,setData]= useState({
        name : '',
        email : '',
        phoneNumber : '',
        state: '',
        city : '',
        address : '',
        photo: ''
    });
    const [editData, setEditData] = useState({
        name: '',
        address: '',
        photo: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const id = localStorage.getItem('_id');
    const [loading, setLoading] = useState(false);
   
   
    useEffect(()=>{
        async function fetchData(){
          
           try{
              setLoading(true);
              const response = await fetch(`https://user-service-26b4.onrender.com/api/v1/users/${id}`);
              const resData = await response.json();
  
              if(response.ok) {
                setData(resData.data);
                // Initialize edit data with only editable fields
                setEditData({
                    name: resData.data.name || '',
                    address: resData.data.address || '',
                    photo: resData.data.photo || ''
                });
                setPreviewUrl(resData.data.photo || '/default.jpg');
              }
              setLoading(false);
  
           }catch(err){
            toast.error('Something went wrong!', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light"
              });
              setLoading(false);
           }
        }
        
        fetchData();
  
     },[]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImageToCloudinary = async (file) => {
        const cloud_name = "dxijqzkz4"; // Your Cloudinary cloud name
        const upload_preset = "qykbyvgk"; // Your upload preset
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', upload_preset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            let photoUrl = editData.photo;

            // Upload image to Cloudinary if a new file was selected
            if (selectedFile) {
                setUploading(true);
                toast.info('Uploading image...', {
                    position: "top-right",
                    autoClose: 2000,
                    theme: "light"
                });
                photoUrl = await uploadImageToCloudinary(selectedFile);
                setUploading(false);
            }

            // Prepare update data (only name, address, and photo)
            const updateData = {
                name: editData.name,
                address: editData.address,
                photo: photoUrl
            };

            // Get JWT token
            const token = localStorage.getItem('token');

            // Call update API
            const response = await fetch(`https://user-service-26b4.onrender.com/api/v1/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const resData = await response.json();

            if (response.ok) {
                toast.success('Profile updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "light"
                });
                
                // Update profile data with new values
                setData(resData.data);
                setEdit(false);
                setSelectedFile(null);
            } else {
                toast.error(resData.message || 'Failed to update profile', {
                    position: "top-right",
                    autoClose: 5000,
                    theme: "light"
                });
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile', {
                position: "top-right",
                autoClose: 5000,
                theme: "light"
            });
            setLoading(false);
            setUploading(false);
        }
    };

    const handleCancel = () => {
        // Reset edit data to current profile data (only editable fields)
        setEditData({
            name: profileData.name || '',
            address: profileData.address || '',
            photo: profileData.photo || ''
        });
        setPreviewUrl(profileData.photo || '/default.jpg');
        setSelectedFile(null);
        setEdit(false);
    };

    return <main id="profile">
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading || uploading}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <CircularProgress color="success" />
                <span>{uploading ? 'Uploading image...' : 'Loading...'}</span>
            </Box>
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
        <div className="profile-modern-container">
            <form onSubmit={handleSubmit}>
                <div className='profile-header-modern'>
                    <h1 className="profile-title-gradient">
                        <PersonIcon sx={{ fontSize: 40, marginRight: 1 }} />
                        My Profile
                    </h1>
                    <div className='profile-edit-btn-modern' >
                        {!edit ? 
                            <button type="button" className="edit-btn-modern" onClick={() => setEdit(true)}> 
                                <ModeEditIcon sx={{ fontSize: 20 }} /> 
                                <span>Edit Profile</span>
                            </button> : 
                            <Box display="flex" gap={2}>
                                <button type="button" className="cancel-btn-modern" onClick={handleCancel}>
                                    <CancelIcon sx={{ fontSize: 20 }} />
                                    <span>Cancel</span>
                                </button>
                                <button type="submit" className="save-btn-modern">
                                    <SaveIcon sx={{ fontSize: 20 }} />
                                    <span>Save Changes</span>
                                </button>
                            </Box>
                        }
                    </div>
                </div>

                <div className="profile-card-modern">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-wrapper">
                            <img 
                                src={previewUrl || '/default.jpg'} 
                                alt="Profile" 
                                className="profile-avatar-modern"
                                onError={(e) => { e.target.src = '/default.jpg'; }}
                            />
                            {edit && (
                                <div className="profile-avatar-overlay">
                                    <CameraAltIcon sx={{ fontSize: 32 }} />
                                </div>
                            )}
                        </div>
                        <h2 className="profile-name-modern">{profileData.name || 'User Name'}</h2>
                        <p className="profile-subtitle">Community Member</p>
                    </div>

                    {edit && (
                        <div className="profile-file-upload-modern">
                            <label htmlFor="profile-photo" className="file-upload-label">
                                <CameraAltIcon sx={{ fontSize: 20, marginRight: 1 }} />
                                Change Profile Picture
                            </label>
                            <input 
                                type='file' 
                                id='profile-photo' 
                                name='file' 
                                accept='image/*' 
                                className='file-input-hidden'
                                onChange={handleFileSelect}
                            />
                        </div>
                    )}

                    <div className="profile-info-grid-modern">
                        {/* Name */}
                        <div className="profile-info-card-modern">
                            <div className="profile-info-icon-modern">
                                <PersonIcon />
                            </div>
                            <div className="profile-info-content-modern">
                                <p className="profile-info-label-modern">Full Name</p>
                                {edit ? (
                                    <TextField
                                        name="name"
                                        value={editData.name}
                                        onChange={handleEditChange}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        required
                                        sx={{ mt: 1 }}
                                    />
                                ) : (
                                    <p className='profile-info-value-modern'>{profileData.name || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        {/* Email (Non-editable) */}
                        <div className="profile-info-card-modern">
                            <div className="profile-info-icon-modern">
                                <EmailIcon />
                            </div>
                            <div className="profile-info-content-modern">
                                <p className="profile-info-label-modern">Email Address</p>
                                <p className='profile-info-value-modern'>{profileData.email || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* Phone (Non-editable) */}
                        <div className="profile-info-card-modern">
                            <div className="profile-info-icon-modern">
                                <PhoneIcon />
                            </div>
                            <div className="profile-info-content-modern">
                                <p className="profile-info-label-modern">Phone Number</p>
                                <p className='profile-info-value-modern'>{profileData.phoneNumber || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* State (Read-only) */}
                        <div className="profile-info-card-modern">
                            <div className="profile-info-icon-modern">
                                <PublicIcon />
                            </div>
                            <div className="profile-info-content-modern">
                                <p className="profile-info-label-modern">State</p>
                                <p className='profile-info-value-modern'>{profileData.state || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* City (Read-only) */}
                        <div className="profile-info-card-modern">
                            <div className="profile-info-icon-modern">
                                <LocationOnIcon />
                            </div>
                            <div className="profile-info-content-modern">
                                <p className="profile-info-label-modern">City</p>
                                <p className='profile-info-value-modern'>{profileData.city || 'Not provided'}</p>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="profile-info-card-modern full-width">
                            <div className="profile-info-icon-modern">
                                <HomeIcon />
                            </div>
                            <div className="profile-info-content-modern">
                                <p className="profile-info-label-modern">Address</p>
                                {edit ? (
                                    <TextField
                                        name="address"
                                        value={editData.address}
                                        onChange={handleEditChange}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        sx={{ mt: 1 }}
                                    />
                                ) : (
                                    <p className='profile-info-value-modern'>{profileData.address || 'Not provided'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </main>
}
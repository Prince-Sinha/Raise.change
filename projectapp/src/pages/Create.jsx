import { useState , useRef } from 'react';
import {Button,TextField,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle, Fab,Autocomplete} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PostAddIcon from '@mui/icons-material/PostAdd';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { deptlist } from '../data';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { redirect , useNavigate } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {CircularProgress, Backdrop} from '@mui/material';
import { aiService } from '../services/aiService';

export default function FormDialog() {
 const [open, setOpen] = useState(false);
 const [dep, setDep] = useState('');
 const [image , setImage] = useState('');
 const [url , setUrl] = useState('');
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
 const [flag , setflag] = useState(false);
 const [selectedFileName, setSelectedFileName] = useState('');
 const cloud_name = "djflpzpmn";
 const upload_preset = "raise.change";
 const reffile = useRef(null);
 
 // AI Integration State
 const [aiAnalysis, setAiAnalysis] = useState(null);
 const [analyzing, setAnalyzing] = useState(false);
 const [titleValue, setTitleValue] = useState('');
 const [descriptionValue, setDescriptionValue] = useState('');

 const handleClickOpen = () => {
 setOpen(true);
 };

 const handleClose = () => {
 setOpen(false);
 };
 const handleChange1= (event) => {
 setDep(event.target.value);
 const h= event.target.value;
 
 };

 const handleChange2 = (e)=>{
 const file = e.target.files[0];
 if(file){
 setflag(true);
 setSelectedFileName(file.name);
 }
 }

 const handleRemoveFile = ()=>{
 setflag(false);
 setSelectedFileName('');
 if(reffile.current){
 reffile.current.value = '';
 }
 }

 const handleUpload = async (e)=>{
 const upload_image = new FormData();
 upload_image.append("file", reffile.current.files[0]);
 upload_image.append("cloud_name", cloud_name);
 upload_image.append("upload_preset", upload_preset);

 try{
 
 const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,{
 method: "post",
 body: upload_image,
 });

 const data = await response.json();
 if (!response.ok) {
 throw new Error("Something went wrong.Please upload image again!");
 }

 setImage(data.secure_url);
 }catch(msg){
 toast.error(msg, {
 position: "top-right",
 autoClose: 5000,
 hideProgressBar: false,
 closeOnClick: true,
 pauseOnHover: true,
 draggable: true,
 progress: undefined,
 theme: "light",
 });
 setLoading(prev=> !prev);
 return;
 }

 
 }

 // AI Analysis Handler
 const handleAIAnalysis = async () => {
 if (!titleValue || !descriptionValue) {
 toast.warning('Please enter title and description first');
 return;
 }
 
 setAnalyzing(true);
 try {
 const analysis = await aiService.analyzePost(titleValue, descriptionValue);
 setAiAnalysis(analysis);
 
 // Auto-fill suggested department
 if (analysis.suggestedDepartment) {
 setDep(analysis.suggestedDepartment);
 }
 
 toast.success('✨ AI Analysis Complete!');
 } catch (error) {
 console.error('AI Analysis Error:', error);
 toast.error('AI Analysis failed. Please try again.');
 } finally {
 setAnalyzing(false);
 }
 };

 return (
 <>
 <div className='createpost'>
 <Fab color="primary" aria-label="add" onClick={handleClickOpen}> <AddIcon /></Fab>
 </div>
 
 <Dialog
 open={open}
 onClose={handleClose}
 maxWidth="md"
 fullWidth
 PaperProps={{
 component: 'form',
 onSubmit: async (event) => {
 event.preventDefault();
 
 // 1. Auth Check
 const id = localStorage.getItem('_id');
 const token = localStorage.getItem('token');
 
 if(!id || !token){
 toast.warning('Please Login to post your issue');
 return;
 }

 setLoading(true);

 try {
 let formData = new FormData(event.currentTarget);
 let formJson = Object.fromEntries(formData.entries());
 let finalImageUrl = image; // Use the state variable which holds the uploaded URL

 // 2. Handle Image Upload (If a new file was selected)
 if(flag && reffile.current?.files[0]){
 const upload_image = new FormData();
 upload_image.append("file", reffile.current.files[0]);
 upload_image.append("cloud_name", cloud_name);
 upload_image.append("upload_preset", upload_preset);

 const responseImage = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,{
 method: "post",
 body: upload_image,
 });
 
 if (!responseImage.ok) throw new Error("Image upload failed");
 const data = await responseImage.json();
 finalImageUrl = data.secure_url;
 }

 // 3. FIX: Safely remove spaces for the Enum
 // This turns "Municipal Cooperation" -> "MunicipalCooperation"
 // And turns "Police" -> "Police" (No "undefined" error)
 const cleanDept = formJson.dept.replace(/\s+/g, '');

 // 4. Construct Payload strictly matching DTO
 const requestBody = {
 title: formJson.title,
 problemStatement: formJson.problemStatement,
 userId: id,
 dept: cleanDept, 
 postImg: finalImageUrl ? [finalImageUrl] : [] 
 };

 const response = await fetch(`https://post-service-ybd1.onrender.com/api/v1/posts/create`,{
 method : 'POST',
 headers : {
 'Content-Type' : 'application/json',
 'Authorization' : `Bearer ${token}`
 },
 body : JSON.stringify(requestBody)
 });

 const resData = await response.json();

 if(!response.ok){
 // Pass the backend error message to the toast
 throw new Error(resData.message || "Failed to create post");
 }

 setLoading(false);
 toast.success(`Successfully Created!`);
 setTimeout(()=>{
 handleClose();
 navigate('/posts');
 }, 2000);

 } catch(error) {
 console.error(error);
 toast.error(error.message);
 setLoading(false);
 }
},
 }}
 >
 <DialogTitle sx={{
 background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
 color: 'white',
 padding: '2rem',
 display: 'flex',
 alignItems: 'center',
 gap: '1rem',
 fontSize: '1.75rem',
 fontWeight: 700
 }}>
 <PostAddIcon sx={{ fontSize: 32 }} />
 Having Issues!
 </DialogTitle>
 <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
 <CircularProgress color="success" />
 </Backdrop>
 <DialogContent sx={{ padding: '2rem', background: '#f9fafb' }}>
 <div className="modern-create-form">
 <div className="form-field-modern">
 <div className="field-icon-modern">
 <TitleIcon sx={{ color: '#10b981', fontSize: 24 }} />
 </div>
 <TextField
 autoFocus
 required
 margin="dense"
 id="name"
 name="title"
 label="Post Title"
 type="text"
 fullWidth
 variant="outlined"
 value={titleValue}
 onChange={(e) => setTitleValue(e.target.value)}
 placeholder="Enter a descriptive title for your issue"
 sx={{
 '& .MuiOutlinedInput-root': {
 borderRadius: '12px',
 background: 'white',
 '&:hover fieldset': { borderColor: '#10b981' },
 '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' }
 }
 }}
 />
 </div>

 <div className="form-field-modern">
 <div className="field-icon-modern">
 <AccountBalanceIcon sx={{ color: '#10b981', fontSize: 24 }} />
 </div>
 <FormControl fullWidth name="dept" required sx={{ marginTop: 2 }} >
 <InputLabel id="demo-simple-select-required-label">Respective Authority</InputLabel>
 <Select 
 name="dept" 
 labelId="demo-simple-select-required-label" 
 id="demo-simple-select-required"
 value={dep} 
 label="Respective Authority *" 
 onChange={handleChange1}
 sx={{
 borderRadius: '12px',
 background: 'white',
 '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981' },
 '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#10b981', borderWidth: '2px' }
 }}
 >
 { deptlist.map((el,i)=> <MenuItem key={i} value={el}>{el}</MenuItem>) }
 </Select>
 </FormControl>
 </div>

 <div className="form-field-modern">
 <div className="field-icon-modern">
 <DescriptionIcon sx={{ color: '#10b981', fontSize: 24 }} />
 </div>
 <TextField
 required
 id="outlined-multiline-static"
 name="problemStatement"
 label="Describe Your Issue"
 fullWidth
 value={descriptionValue}
 onChange={(e) => setDescriptionValue(e.target.value)}
 sx={{ 
 marginTop: 2,
 '& .MuiOutlinedInput-root': {
 borderRadius: '12px',
 background: 'white',
 '&:hover fieldset': { borderColor: '#10b981' },
 '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: '2px' }
 }
 }}
 multiline
 rows={5}
 placeholder="Provide detailed information about the issue you're facing..."
 />
 </div>

 {/* AI Analysis Button */}
 <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
 <Button
 type="button"
 onClick={handleAIAnalysis}
 disabled={analyzing || !titleValue || !descriptionValue}
 fullWidth
 variant="outlined"
 sx={{
 padding: '1rem',
 borderRadius: '12px',
 border: '2px dashed #6366f1',
 color: '#6366f1',
 fontWeight: 600,
 textTransform: 'none',
 fontSize: '1rem',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '0.5rem',
 '&:hover': {
 border: '2px dashed #6366f1',
 background: '#eef2ff'
 },
 '&:disabled': {
 border: '2px dashed #cbd5e1',
 color: '#cbd5e1'
 }
 }}
 >
 <AutoAwesomeIcon />
 {analyzing ? '🤔 AI is Analyzing...' : '✨ Get AI Suggestions'}
 </Button>
 </div>

 {/* AI Analysis Results */}
 {aiAnalysis && (
 <div style={{
 marginTop: '1rem',
 padding: '1.5rem',
 background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
 borderRadius: '12px',
 border: '2px solid #8b5cf6',
 marginBottom: '1rem'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
 <AutoAwesomeIcon sx={{ color: '#7c3aed', fontSize: 24 }} />
 <h4 style={{ margin: 0, color: '#5b21b6' }}>AI Analysis Results</h4>
 </div>
 
 <div style={{ display: 'grid', gap: '0.75rem' }}>
 <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px' }}>
 <strong style={{ color: '#7c3aed' }}>Suggested Department:</strong>
 <div style={{ marginTop: '0.25rem', color: '#1f2937' }}>{aiAnalysis.suggestedDepartment}</div>
 </div>
 
 <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px' }}>
 <strong style={{ color: '#7c3aed' }}>Priority:</strong>
 <span style={{ 
 marginLeft: '0.5rem',
 padding: '0.25rem 0.75rem',
 borderRadius: '12px',
 background: aiAnalysis.priority === 'high' ? '#fee2e2' : 
 aiAnalysis.priority === 'medium' ? '#fef3c7' : '#d1fae5',
 color: aiAnalysis.priority === 'high' ? '#991b1b' : 
 aiAnalysis.priority === 'medium' ? '#92400e' : '#065f46',
 fontWeight: 600,
 fontSize: '0.875rem'
 }}>
 {aiAnalysis.priority}
 </span>
 </div>
 
 <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px' }}>
 <strong style={{ color: '#7c3aed' }}>Summary:</strong>
 <div style={{ marginTop: '0.25rem', color: '#1f2937' }}>{aiAnalysis.summary}</div>
 </div>
 
 <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px' }}>
 <strong style={{ color: '#7c3aed' }}>Key Issues:</strong>
 <ul style={{ margin: '0.5rem 0 0 1.25rem', color: '#1f2937' }}>
 {aiAnalysis.keyIssues.map((issue, idx) => (
 <li key={idx}>{issue}</li>
 ))}
 </ul>
 </div>
 
 <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right', marginTop: '0.5rem' }}>
 Powered by {aiAnalysis.provider}
 </div>
 </div>
 </div>
 )}

 <div className="file-upload-modern-container">
 <div className="file-upload-modern-wrapper">
 <ImageIcon sx={{ fontSize: 32, color: '#10b981', marginBottom: 1 }} />
 {!selectedFileName ? (
 <>
 <label htmlFor="file-upload-modern" className="file-upload-modern-label">
 <span>📷 Upload Image</span>
 <span className="file-upload-hint">Click to select an image (optional)</span>
 </label>
 <input 
 id="file-upload-modern"
 type='file' 
 name='photo' 
 accept='image/*' 
 className='file-input-modern' 
 ref={reffile} 
 onChange={handleChange2}
 />
 </>
 ) : (
 <div style={{
 width: '100%',
 padding: '1rem',
 background: '#ecfdf5',
 border: '2px solid #10b981',
 borderRadius: '12px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between'
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
 <CheckCircleIcon sx={{ color: '#10b981', fontSize: 24 }} />
 <span style={{ 
 color: '#059669', 
 fontWeight: 600,
 overflow: 'hidden',
 textOverflow: 'ellipsis',
 whiteSpace: 'nowrap'
 }}>
 {selectedFileName}
 </span>
 </div>
 <Button
 onClick={handleRemoveFile}
 size="small"
 sx={{
 minWidth: 'auto',
 padding: '0.5rem',
 color: '#dc2626',
 '&:hover': {
 background: '#fee2e2'
 }
 }}
 >
 <CloseIcon sx={{ fontSize: 20 }} />
 </Button>
 </div>
 )}
 </div>
 </div>
 </div>
 </DialogContent>
 <DialogActions sx={{ 
 padding: '1.5rem 2rem', 
 background: 'white',
 gap: '1rem',
 borderTop: '1px solid #e5e7eb'
 }}>
 <Button 
 onClick={handleClose} 
 sx={{
 padding: '0.75rem 2rem',
 borderRadius: '12px',
 textTransform: 'none',
 fontWeight: 600,
 fontSize: '1rem',
 color: '#dc2626',
 border: '2px solid #dc2626',
 '&:hover': {
 background: '#dc2626',
 color: 'white'
 }
 }}
 >
 Cancel
 </Button>
 <Button 
 type="submit" 
 variant="contained"
 sx={{
 padding: '0.75rem 2rem',
 borderRadius: '12px',
 textTransform: 'none',
 fontWeight: 600,
 fontSize: '1rem',
 background: 'linear-gradient(135deg, #10b981, #059669)',
 boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
 '&:hover': {
 background: 'linear-gradient(135deg, #059669, #10b981)',
 boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
 transform: 'translateY(-2px)'
 }
 }}
 >
 Create Post
 </Button>
 </DialogActions>
 </Dialog>
 </>
 );
}
import { useState } from 'react';
import {Button,TextField,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle, Fab,Autocomplete} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { deptlist } from '../data';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { redirect , useNavigate } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {CircularProgress, Backdrop} from '@mui/material';

export default function FormDialog() {
  const [open, setOpen] = useState(false);
  const [dep, setDep] = useState('');
  const [image , setImage] = useState('');
  const [url , setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  

  return (
    <>
      <div className='createpost'>
               <Fab color="primary" aria-label="add"  onClick={handleClickOpen}>  <AddIcon /></Fab>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            setLoading(prev=> !prev);
            let formData = new FormData(event.currentTarget);
            let formJson = Object.fromEntries(formData.entries());

            formJson.photo = formJson.photo.name
            console.log(formJson);
            const id = localStorage.getItem('_id');
            if(id){
                
                formJson.user = id;
                const userresp = await fetch(`https://backend-92s7.onrender.com/api/v1/users/${id}`);
                const user = await userresp.json();
                formJson.State = user.data.user.State;
                formJson.city = user.data.user.city;
                const [a,b] = [...formJson.dept.split(' ')];
                formJson.dept = a + b;
                console.log(formJson);
                // multer wali fetch req to generate string 
                const response = await fetch(`https://backend-92s7.onrender.com/api/v1/posts/create`,{
                  method : 'POST',
                  headers : {
                    'Content-Type' : 'application/json'
                  },
                  body : JSON.stringify(formJson)
                  
                });
                const resData = await response.json();
                if(!response.ok){
                  toast.error(resData.message, {
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
                setLoading(prev=> !prev);
                toast.success(`Successfully Created!`, {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light"
                  });
                  setLoading(prev=> !prev);
                setTimeout(()=>{
                  handleClose();
                  navigate('/posts');
                },3000)
              
            }else{
              toast.info('Please Login to post your issuse', {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored"
                });
                return;
            }

          },
        }}
      >
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
        
        <DialogTitle>Post</DialogTitle>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
            <CircularProgress />
          </Backdrop>
        <DialogContent>
            <div>
            
               <TextField
                    sx={ {} }
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="title"
                    label="Title"
                    type="text"
                    fullWidth
                    variant="standard"
               />
               <FormControl fullWidth name="dept" required sx={{ marginTop: 1 }}  >
                    <InputLabel  id="demo-simple-select-required-label">Respective Authority</InputLabel>
                    <Select  name="dept" labelId="demo-simple-select-required-label" id="demo-simple-select-required"
                     value={dep} label="Department *" onChange={handleChange1}
                    >
                    {  deptlist.map((el,i)=> <MenuItem key={i} value={el}>{el}</MenuItem>) }
               
                     </Select>
       
                 </FormControl>
               <TextField
                    required
                    id="outlined-multiline-static"
                    name="problemStatement"
                    label="Describe Your Issuse"
                    fullWidth
                    sx={{ marginTop: 2}}
                    multiline
                    rows={4}
                    defaultValue=""
                />
                <input type='file' name='photo' accept='image/*' className='file' />
            </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='error'>Cancel</Button>
          <Button type="submit" color='success'>Create Your's Post</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
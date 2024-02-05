import {IconButton,OutlinedInput,InputLabel,InputAdornment,FormControl,TextField} from '@mui/material';
import {Visibility,VisibilityOff} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useState} from 'react'
import { Form ,NavLink,useNavigate,redirect } from 'react-router-dom';
import { red } from '@mui/material/colors';
export default function LoginDept(){
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {event.preventDefault(); }
    const navigate = useNavigate();
    
    const handleSubmit = async (e)=>{
        e.preventDefault();
        const form = new FormData(e.target);
        const formJson = Object.fromEntries(form.entries());
        console.log(formJson)
        const response = await fetch(`https://vast-gray-mackerel-wear.cyclic.app/api/v1/users/dept/login`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json' 
            },
            body : JSON.stringify(formJson)
        })
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
                theme: "colored",
                });     
                return;
        }
        const res = await fetch(`https://vast-gray-mackerel-wear.cyclic.app/api/v1/users/${resData.data.user.id}`)
        const reData = await res.json();
        if(!response.ok){
            toast.error(reData.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });     
                return;
        }

        const token = resData.token;
        
        localStorage.setItem('_id',resData.data.user.id);
        localStorage.setItem('dept',reData.data.user.name);

        
        const expiration = new Date();
        expiration.setHours(expiration.getHours() + 1);
        localStorage.setItem('expiration', expiration.toISOString());

        toast.success(`Successfully Logged in`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
          });
         
         setTimeout(()=>{
            navigate('/dept');
         },5000)
       
    }

   

    return <section id="login">
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
        <div className="login-logo">
             <img src="./../../3R.png" alt="Logo" />
        </div>
        <div className='login-form'>
           <Form method="post" onSubmit={handleSubmit}>
             <div>
              <TextField id="outlined-basic" label="Email" variant="outlined" name="email" fullWidth type="email" required />
             </div>
             <div>
             <FormControl required sx={{ marginTop: 1 }} fullWidth variant="outlined">
                  <InputLabel htmlFor="outlined-adornment-password" color='success'>Password</InputLabel>
                  <OutlinedInput 
                      name="password" 
                      id="outlined-adornment-password" 
                      type={showPassword ? 'text' : 'password'}
                      endAdornment={ <InputAdornment position="end">
                                          <IconButton 
                                             aria-label="toggle password visibility" 
                                             onClick={handleClickShowPassword} 
                                             onMouseDown={handleMouseDownPassword} 
                                             edge="end">
                                          {showPassword ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                      </InputAdornment> }
                      label=" Password"
                      color='success'
                  />
             </FormControl>
               
             </div>
             <button type="submit" className="btn">Login</button>
            </Form>
        </div>
       
    </section>
}
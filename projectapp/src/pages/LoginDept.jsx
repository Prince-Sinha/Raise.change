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
        const response = await fetch(`https://user-service-26b4.onrender.com/api/v1/auth/loginAdmin`,{
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

        const res = await fetch(`https://user-service-26b4.onrender.com/api/v1/users/${resData.user.id}`)
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
    
        
        localStorage.setItem('_id',resData.user.id);
        localStorage.setItem('token', token);
        localStorage.setItem('dept',resData.user.name);
        localStorage.setItem('role', 'DEPT');
        
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

   

    return <section id="login-authority">
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
        <div className="login-authority-container">
            <div className="login-authority-illustration">
                <div className="login-authority-illustration-content">
                    <img src="./../../3R.png" alt="Logo" className="login-authority-illustration-logo" />
                    <h1>Authority Access</h1>
                    <p>Secure portal for authorized personnel to manage and resolve community issues</p>
                    <div className="authority-features">
                        <div className="authority-feature-item">
                            <span className="authority-feature-icon">🔐</span>
                            <span>Secure Access</span>
                        </div>
                        <div className="authority-feature-item">
                            <span className="authority-feature-icon">📋</span>
                            <span>Manage Issues</span>
                        </div>
                        <div className="authority-feature-item">
                            <span className="authority-feature-icon">✅</span>
                            <span>Mark Resolved</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className='login-authority-form-container'>
                <div className="login-authority-form-wrapper">
                    <div className="login-authority-header">
                        <div className="authority-badge">
                            <span>🏛️</span>
                        </div>
                        <h2>Authority Sign In</h2>
                        <p>Enter your credentials to access the admin dashboard</p>
                    </div>
                    
                    <Form method="post" onSubmit={handleSubmit} className="modern-authority-form">
                        <div className="form-field">
                            <TextField 
                                id="authority-email" 
                                label="Official Email" 
                                variant="outlined" 
                                name="email" 
                                fullWidth 
                                type="email" 
                                required
                                color="warning"
                                sx={{ 
                                    marginBottom: 2.5,
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                                }}
                            />
                        </div>
                        
                        <div className="form-field">
                            <FormControl 
                                required 
                                fullWidth 
                                variant="outlined"
                                color="warning"
                                sx={{ marginBottom: 2 }}
                            >
                                <InputLabel htmlFor="authority-password">Password</InputLabel>
                                <OutlinedInput 
                                    name="password" 
                                    id="authority-password" 
                                    type={showPassword ? 'text' : 'password'}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton 
                                                aria-label="toggle password visibility" 
                                                onClick={handleClickShowPassword} 
                                                onMouseDown={handleMouseDownPassword} 
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label="Password"
                                    sx={{ borderRadius: '12px' }}
                                />
                            </FormControl>
                        </div>
                        
                        <button type="submit" className="btn authority-login-btn">
                            Access Dashboard
                        </button>
                    </Form>
                    
                    <div className="login-authority-footer">
                        <p>👤 <NavLink to="/login" className="user-login-link">Regular User Login</NavLink></p>
                    </div>
                </div>
            </div>
        </div>
    </section>
}
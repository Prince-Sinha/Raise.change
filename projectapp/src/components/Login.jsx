import {IconButton,OutlinedInput,InputLabel,InputAdornment,FormControl,TextField, Select,MenuItem} from '@mui/material';
import {Visibility,VisibilityOff} from '@mui/icons-material';
import {useState} from 'react'
import { Form ,NavLink,Navigate,redirect, useNavigate } from 'react-router-dom';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

export default function Login(){
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {event.preventDefault(); };
    const [role , setRole] = useState('public');
    const navigate = useNavigate();
    
    const handleRoleChange = (event) => {
        const selectedRole = event.target.value;
        setRole(selectedRole);
        
        // Only navigate if Authority is selected
        if (selectedRole === 'dept') {
            window.location.href = '/login/dept';
        }
    };
   

    return <section id="login">
        <div className="login-container">
            <div className="login-illustration">
                <div className="login-illustration-content">
                    <img src="./../../3R.png" alt="Logo" className="login-illustration-logo" />
                    <h1>Welcome Back!</h1>
                    <p>Sign in to continue making a difference in your community</p>
                    <div className="login-features">
                        <div className="feature-item">
                            <span className="feature-icon">🎯</span>
                            <span>Raise Issues</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🤝</span>
                            <span>Support Causes</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">✅</span>
                            <span>Track Progress</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className='login-form-container'>
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <h2>Sign In</h2>
                        <p>Enter your credentials to access your account</p>
                    </div>
                    
                    <FormControl fullWidth name="role" required sx={{ marginBottom: 2.5 }} color="success">
                        <InputLabel id="demo-simple-select-required-label">Select Role</InputLabel>
                        <Select 
                            name="State" 
                            labelId="demo-simple-select-required-label" 
                            id="demo-simple-select-required"
                            value={role} 
                            label="Select Role" 
                            onChange={handleRoleChange}
                            sx={{ borderRadius: '12px' }}
                        >
                            <MenuItem value={'public'}>Normal User</MenuItem>
                            <MenuItem value={'dept'}>Authority</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Form method="post" className="modern-login-form">
                        
                        <div className="form-field">
                            <TextField
                                fullWidth
                                label="Phone Number"
                                id="outlined-start-adornment"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">+91 </InputAdornment>,
                                }}
                                type="number"
                                name="phoneNumber"
                                color='success'
                                required
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                                    marginBottom: 2.5
                                }}
                            />
                        </div>
                        
                        <div className="form-field">
                            <FormControl required fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                                <InputLabel htmlFor="outlined-adornment-password" color='success'>Password</InputLabel>
                                <OutlinedInput 
                                    name="password" 
                                    id="outlined-adornment-password" 
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
                                    color='success'
                                    sx={{ borderRadius: '12px' }}
                                />
                            </FormControl>
                        </div>
                        
                        <div className="forgot-password-link">
                            <a href="">Forgot Password?</a>
                        </div>
                        
                        <button type="submit" className="btn login-btn">
                            Sign In
                        </button>
                    </Form>
                    
                    <div className="login-footer">
                        <p>Don't have an account? <NavLink to="/signup" className="signup-link">Create Account</NavLink></p>
                    </div>
                </div>
            </div>
        </div>
    </section>
}
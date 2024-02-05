import {IconButton,OutlinedInput,InputLabel,InputAdornment,FormControl,TextField, Select,MenuItem} from '@mui/material';
import {Visibility,VisibilityOff} from '@mui/icons-material';
import {useState} from 'react'
import { Form ,NavLink,Navigate,redirect } from 'react-router-dom';

export default function Login(){
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {event.preventDefault(); };
    const [role , setRole] = useState('');
    const handleChange1= (event) => {
        setRole(event.target.value);
        return redirect('/login/dept')
        
    }
   

    return <section id="login">
        <div className="login-logo">
             <img src="./../../3R.png" alt="Logo" />
        </div>
        <div className='login-form'>
           <Form method="post">
           <FormControl fullWidth name="role" required sx={{ overflow: "hidden",marginTop:1 , marginBottom:2 }} color="success">
                    <InputLabel id="demo-simple-select-required-label">Roles</InputLabel>
                    <Select name="State" labelId="demo-simple-select-required-label" id="demo-simple-select-required"
                     value={role} label="Roles" onChange={handleChange1}
                    >
                     <MenuItem value={'public'}>Normal User</MenuItem>
                     <NavLink to="/login/dept"><MenuItem value={'dept'}>Authority</MenuItem></NavLink>
               
                     </Select>
       
                 </FormControl>
             <div>
             
             <TextField
                     label="Phone Number"
                     id="outlined-start-adornment"
                     InputProps={{
                        startAdornment: <InputAdornment position="start">+91 </InputAdornment>,
                     }}
                     type="number"
                     name="phoneNumber"
                     color='success'
                     required
              />
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
            <NavLink to="/signup">Create Account</NavLink>
            <div className="forgot-password">
                 <a href="">Forgot Password?</a>
            </div>
        </div>
       
    </section>
}
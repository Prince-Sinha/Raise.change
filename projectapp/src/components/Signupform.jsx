import { useState } from "react";
import {TextField,InputLabel, MenuItem,FormHelperText,FormControl,Select,OutlinedInput,InputAdornment,IconButton } from '@mui/material'
import {Visibility, VisibilityOff} from '@mui/icons-material';
import {list,citylist} from './../data.js'
import { Form, redirect, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Signupform(){
  const [state,setState] = useState('');
  const [selectCity,setSelectCity]= useState([]);
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // const history = useHistory();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const formJson = Object.fromEntries(form.entries());
    console.log(formJson)
   try{
    // const res = await fetch(`https://backend-92s7.onrender.com/api/v1/users/signup`, {
    const res = await fetch(`https://user-service-26b4.onrender.com/api/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formJson)
    })

    const resData = await res.json();
    console.log(resData)
    if(!res.ok){
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

    const token = resData.token;

    localStorage.setItem('token', token);
    localStorage.setItem('_id',resData.user.id)
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    localStorage.setItem('expiration', expiration.toISOString());
    toast.success(`Successfully SignUp`, {
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
      navigate("/", {state: true});
    },5000)
   }catch(err){
    toast.error(err, {
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
  
  };
    

  
  const handleChange1= (event) => {
    setState(event.target.value);
    const h= event.target.value;
    // console.log(h);
    setSelectCity(citylist[h]);
  };

  const handleChange2= (event)=>{
    console.log(event.target.value);
    const h= event.target.value;
    setCity(event.target.value);
  }
    return (<>
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
              theme="colored"
          />
        <Form className="modern-signup-form" method="post" onSubmit={handleSubmit}>
            <TextField 
              name="phoneNumber" 
              fullWidth
              label="Phone Number" 
              variant="outlined" 
              color="success" 
              required 
              type="number"
              sx={{ 
                marginBottom: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
            />
      
            <TextField 
              name="email" 
              fullWidth
              label="Email" 
              variant="outlined" 
              color="success" 
              required 
              type="email"
              sx={{ 
                marginBottom: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
            />
            
            <TextField 
              name="name" 
              fullWidth
              label="Full Name" 
              variant="outlined" 
              color="success" 
              required 
              type="text"
              sx={{ 
                marginBottom: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
            />

            <div className="form-row">
                 <FormControl 
                   name="State" 
                   required 
                   sx={{ 
                     flex: 1,
                     marginBottom: 2,
                     '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                   }} 
                   color="success"
                 >
                    <InputLabel id="demo-simple-select-required-label">State</InputLabel>
                    <Select 
                      name="state" 
                      labelId="demo-simple-select-required-label" 
                      id="demo-simple-select-required"
                      value={state} 
                      label="State" 
                      onChange={handleChange1}
                    >
                      {list.map((el,i)=> <MenuItem key={i} value={el}>{el}</MenuItem>)}
                    </Select>
                 </FormControl>
                
                 <FormControl 
                   name="city" 
                   required 
                   sx={{ 
                     flex: 1,
                     marginBottom: 2,
                     '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                   }} 
                   color="success"
                 >
                    <InputLabel id="city-select-label">City</InputLabel>
                    <Select 
                      name="city" 
                      labelId="city-select-label" 
                      id="city-select"
                      value={city} 
                      label="City" 
                      onChange={handleChange2}
                    >
                      {selectCity.map((el,i)=> <MenuItem key={i} value={el}>{el}</MenuItem>)}
                    </Select>
                 </FormControl>
            </div>
            
            <TextField 
              name="address" 
              fullWidth
              id="outlined-multiline-static" 
              color="success" 
              label="Address" 
              multiline 
              rows={2} 
              defaultValue="" 
              required
              sx={{ 
                marginBottom: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
            />

            <TextField 
              name="password" 
              fullWidth
              id="password-field" 
              color="success" 
              label="Password" 
              variant="outlined" 
              required 
              type="password"
              sx={{ 
                marginBottom: 2,
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
            />

            <FormControl 
              required 
              fullWidth 
              variant="outlined" 
              color="success"
              sx={{ 
                marginBottom: 3,
                '& .MuiOutlinedInput-root': { borderRadius: '12px' }
              }}
            >
              <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
              <OutlinedInput 
                name="confirmPassword" 
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
                label="Confirm Password"
              />
            </FormControl>

            <button type="submit" className="btn signup-btn">Create Account</button>
       </Form>
       </>
    );
}
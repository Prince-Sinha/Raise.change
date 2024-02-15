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
    const res = await fetch(`https://zealous-eel-hosiery.cyclic.app/api/v1/users/signup`, {
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
        <Form className="form-controller" method="post" onSubmit={handleSubmit}>
            <TextField name="phoneNumber" sx={{ width:350 }}  label="Phone Number" variant="outlined" color="success" required type="number"/>
      
            <TextField name="email" sx={{ marginTop:1,width:350 }}  label="Email" variant="outlined" color="success" required type="email"/>
            <TextField name="name" sx={{ marginTop:1,width:350 }}  label="Name" variant="outlined" color="success" required type="name"/>

            <div className="form-options">
                 <FormControl name="State" required sx={{ overflow: "hidden",marginTop:1, minWidth:219,maxWidth: 220 }} color="success">
                    <InputLabel id="demo-simple-select-required-label">State</InputLabel>
                    <Select name="State" labelId="demo-simple-select-required-label" id="demo-simple-select-required"
                     value={state} label="State *" onChange={handleChange1}
                    >
                    {  list.map((el,i)=> <MenuItem key={i} value={el}>{el}</MenuItem>) }
               
                     </Select>
       
                 </FormControl>
                
                 <FormControl name="city" required sx={{ overflow:"hidden",marginTop:1, minWidth: 120,maxWidth:121 }} color="success">
                    <InputLabel id="demo-simple-select-required-label">City</InputLabel>
                    <Select name="city" labelId="demo-simple-select-required-label" id="demo-simple-select-required"
                     value={city} label="city *" onChange={handleChange2}
                    >
                    {  selectCity.map((el,i)=> <MenuItem key={i} value={el}>{el}</MenuItem>   )}
               
                    </Select>
                 </FormControl>
            </div>
            <TextField name="address" sx={{ marginTop:1}} id="outlined-multiline-static" color="success" label="Address" multiline rows={2} defaultValue="" required />

            <TextField name="password" sx={{ marginTop:1, width:350 }} id="outlined-basic" color="success" label="Password" variant="outlined" required type="text"/>

            <FormControl required sx={{ marginTop: 1 }} fullWidth variant="outlined" color="success" >
                  <InputLabel htmlFor="outlined-adornment-password">Confirm Password</InputLabel>
                  <OutlinedInput name="ConfirmPassword" id="outlined-adornment-password" type={showPassword ? 'text' : 'password'}
                  endAdornment={ <InputAdornment position="end">
                                 <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                                 {showPassword ? <VisibilityOff /> : <Visibility />}
                                 </IconButton>
                                 </InputAdornment> }
                   label="Confirm Password"/>
            </FormControl>

            <button type="submit" className="btn">Create Account</button>
       </Form>
       </>
    );
}
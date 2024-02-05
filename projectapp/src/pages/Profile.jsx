import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { buttonBaseClasses } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Form } from 'react-router-dom'
import {useState,useEffect} from 'react'
export default function Profile(){
    const [edit,setEdit]= useState(false);
    const [profileData,setData]= useState({
        name : '',
        email : '',
        phoneNumber : '',
        State: '',
        city : '',
        address : '',
    });
    const id = localStorage.getItem('_id');
   
   
    useEffect(()=>{
        async function fetchData(){
  
           try{
              const response = await fetch(`https://vast-gray-mackerel-wear.cyclic.app/api/v1/users/${id}`);
              const resData = await response.json();
  
              setData(resData.data.user);
              
  
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
           }
        }
        
        fetchData();
  
     },[]);

    return <main id="profile">
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
        <Form>
        <div className='profile-btn' >
          {!edit ? <a > <ModeEditIcon color='primary'/> </a>: <button type="submit" >Save</button>}
        </div>
        <div className="profile-name">
            <img src={`https://vast-gray-mackerel-wear.cyclic.app/userimg/user1.jpg`} alt="Profile" />
            <p>{profileData.name}</p>
        </div>

        {edit &&<input type='file' name='file' accept='image/*' className='file'/>}
         <div className="profile-info">
           <p className="p">Email:</p>
           <p className='detail'>{profileData.email}</p>

         </div>
         <div className="profile-info">
           <p className="p">Phone Number:</p>
           <p className='detail'>{profileData.phoneNumber}</p>
         </div>
         <div className="profile-info">
           <p className="p">State:</p>
           <p className='detail'>{profileData.State}</p>
         </div>
         <div className="profile-info">
           <p className="p">City:</p>
           <p className='detail'>{profileData.city}</p>
         </div>
         <div className="profile-info">
           <p className="p">Address:</p>
           <p className='detail'>{profileData.address}</p>
         </div>
        </Form>
    </main>
}
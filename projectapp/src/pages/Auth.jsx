import Login from './../components/Login';
import { json, redirect, useNavigate } from 'react-router-dom'; // Correct import statement
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Auth() {
  return <><Login />
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
              />
        </>;
}

export async function action({ request }) {
 
    
    const data = await request.formData();
    const auth = {
      phoneNumber: data.get('phoneNumber'),
      password: data.get('password'),
    };

    const response = await fetch('https://vast-gray-mackerel-wear.cyclic.app/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auth),
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
        theme: "colored",
        });     
        return null;
    }

    const token = resData.token;

    localStorage.setItem('token', token);
    localStorage.setItem('_id' , resData.data.user._id);
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    localStorage.setItem('expiration', expiration.toISOString())
    toast.success(`Successfully LoggedIn!`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light"
      });
    
   
    return redirect("/");
    

}

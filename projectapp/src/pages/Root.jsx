import { Outlet, useLoaderData, useSubmit } from 'react-router-dom';
import SideBar from '../components/SideBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import { getTokenDuration} from './../util/auth'

export default function(){
    const token = useLoaderData();
    const submit = useSubmit();
    useEffect(()=>{
      if(!token){
        return;
      }

      if(token === 'EXPIRED'){
        submit(null,{ action: '/logout' , method: 'post'});
      }

      const tokenDuration = getTokenDuration();

      setTimeout(()=>{
        submit(null,{ action: '/logout' , method: 'post'})
      },tokenDuration)
    },[token,submit])
    return <>
       <Header />
       <main id="sidebar">
         <SideBar />
         <Outlet />
       </main>
       <Footer />
      
    </>
}
import { NavLink , useRouteLoaderData} from 'react-router-dom'
import { useState } from 'react'
export default function SideBar(){
 const [activeClass , setActiveClass]= useState('unresolved');

 const handleChange = (name)=>{

 setActiveClass(name);
 }
 const token = useRouteLoaderData('root');
 return (
 
 <div className="side">
 {/* {console.log(activeClass)} */}
 <ul>
 <li><NavLink to='/article' className={({isActive})=> isActive?'active':undefined} end>Article</NavLink></li>
 <li><NavLink to='/' className={({isActive})=> isActive?'active':undefined} end>Active Issues</NavLink></li>
 <li><NavLink to="/resolved" className={({isActive})=> isActive?'active':undefined} end>Closed Issues</NavLink></li>
 {token && <li><NavLink to="/posts" className={({isActive})=> isActive?'active':undefined} end>Posts</NavLink></li>}
 {token && <li><NavLink to="/helpline" className={({isActive})=> isActive?'active':undefined} end>Helpline</NavLink></li>}
 {token && <li><NavLink to="/profile" className={({isActive})=> isActive?'active':undefined} end>Profile</NavLink></li>}
 </ul>
 </div>
 
 )
}
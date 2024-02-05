import { Form ,NavLink, useLocation , useRouteLoaderData} from 'react-router-dom'
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import QrCode from './../pages/QrCode'
export default function({token}){
    const [ istrue, setIsTrue ] = useState(true);
    const handle = ()=>{
        setIsTrue(prev => { return !prev});
    }
    const text = istrue?'none':'block';
    return <>
            {
            istrue ? <div className='navicon'><button style={{backgroundColor : 'transparent' , border : 'none'}} onClick={handle}><ListIcon /></button></div> : <div className='navicon'>
                        <button style={{backgroundColor : 'transparent' , border : 'none'}} onClick={handle}><CloseIcon color='primary'/></button>
                    </div>
            }
    <section style={{display: text, transition : 'all 1s ease'}}className="nav-list">
        <ul>
            <li><NavLink to='/article' onClick={handle}>Article</NavLink></li>
            <li><NavLink to='/' onClick={handle}>Unresolved</NavLink></li>
            <li><NavLink to="/resolved" onClick={handle}>Resolved</NavLink></li>
            {token && <li><NavLink to="/posts" onClick={handle}>Posts</NavLink></li>}
            {token && <li><NavLink to= "/profile" onClick={handle}>Profile</NavLink></li>}
            {!token && <li><NavLink to ="/login" onClick={handle}>Login/SignUp</NavLink></li>}
            {token && <li><NavLink>Notification</NavLink></li>}
            <li><NavLink>Helpline</NavLink></li>
            <li onClick={handle}><QrCode /></li>
            <li>
                { token &&
                    <Form action='/logout' method='post'>
                         <button>Logout</button>
                    </Form>
                }
             </li>
        </ul>
          
    </section>
    </>
}
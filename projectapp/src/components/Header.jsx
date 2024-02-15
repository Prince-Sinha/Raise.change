import Badge from '@mui/material/Badge';
import { useState, useEffect } from "react";
import { Form ,NavLink, useLocation , useRouteLoaderData} from 'react-router-dom'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Avatar from '@mui/material/Avatar';
import Cookies from 'js-cookie';
import Navoption from './Navoption';
import QrCode from './../pages/QrCode'


export default function Header() {
    const location = useLocation();
    let state = location.state;
    // useEffect(() => {
    //     fetch("http://localhost:8000/api/v1/users/")
    //         .then(async (res) => {
    //             const json = await res.json();
    //             console.log(`hey this is json: ${json}`);
    //         });
    // }, [state]);
    const token = useRouteLoaderData('root');

    return (
        <section id="header">
            <div id="nav-bar">
                <div className="nav-image">
                    <NavLink to="/"><img src="./../2R.png" alt="" /></NavLink>
                </div>
                <div className="navoption">
                    <ul>
                        <li><QrCode /></li>
                        {token && <li> <a href="/notification"><Badge color="secondary" variant="dot"> <NotificationsOutlinedIcon /></Badge></a></li>}
                        <li><a href="">Helpline</a></li>
                        <li>{token && <Avatar sx={{marginLeft:1, marginRight:1,alignItems:'center'}} alt="Profile Picture" src={`https://zealous-eel-hosiery.cyclic.app/userimg/user2.jpg`} />}</li>
                        <li>{!token && <NavLink to="/login">LogIn/SignUp</NavLink>}</li>
                         <li>
                            { token &&
                            <Form action='/logout' method='post'>
                                <button>Logout</button>
                            </Form>
                            }
                         </li>
                    </ul>
                </div>

                <Navoption token={token} />
            </div>
        </section>
    );

}
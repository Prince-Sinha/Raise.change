import Badge from '@mui/material/Badge';
import { useState, useEffect } from "react";
import { Form ,NavLink, useLocation , useRouteLoaderData} from 'react-router-dom'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
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
                        {token && <li className="nav-notification-item"> 
                            <a href="/notification" className="nav-notification-link" title="Notifications">
                                <Badge 
                                    badgeContent={0} 
                                    color="error"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: '#10b981',
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            fontWeight: 700
                                        }
                                    }}
                                > 
                                    <NotificationsOutlinedIcon sx={{ fontSize: 26, color: '#1f2937' }} />
                                </Badge>
                            </a>
                        </li>}
                        <li><a href="">Helpline</a></li>
                        <li>{!token && <NavLink to="/login">LogIn/SignUp</NavLink>}</li>
                         <li className="nav-logout-item">
                            { token &&
                            <Form action='/logout' method='post'>
                                <button className="nav-logout-btn">
                                    <LogoutIcon sx={{ fontSize: 20, marginRight: 0.5 }} />
                                    Logout
                                </button>
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
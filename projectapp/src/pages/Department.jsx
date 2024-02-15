import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import Alert from '@mui/material/Alert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Create from './Create'
import { NavLink ,useRouteLoaderData , Form} from 'react-router-dom';

import { useEffect, useState } from 'react';
export default function Department(){
    const dept = localStorage.getItem('dept');

    const [value, setValue] = useState(0);
    const [post,setPost]= useState([]);
    const handleChange = (event, newValue) => {
         setValue(newValue);
   };
   console.log(value);
   useEffect(()=>{
    async function fetchPost(){
        
          const res = await fetch(`https://zealous-eel-hosiery.cyclic.app/api/v1/posts/dept/${value==0 ?'unres':'res'}/${dept}`);
          const resData = await res.json();
       
         
        if(!res.ok){
           toast.error(resData.message, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light"
              });
              return;
        }

        setPost(resData.data.post);
    }
    fetchPost();
},[value]);

   return (<>
    <section id="header">
            <div id="nav-bar">
                <div className="nav-image">
                    <NavLink to="/"><img src="./../2R.png" alt="" /></NavLink>
                </div>
                <div className="navoption">
                    <ul>
                        
                        <li>{ !dept && <NavLink to="/login/dept">LogIn/SignUp</NavLink>}</li>
                         <li>
                            { dept &&
                            <Form action='/logout' method='post'>
                                <button>Logout</button>
                            </Form>
                            }
                         </li>
                    </ul>
                </div>
            </div>
           
        </section>
    <Tabs value={value} onChange={handleChange} aria-label="disabled tabs example" centered>
      <Tab label="Unresolved" />
  
      <Tab label="Resolved" />
    </Tabs>
    <div id="bar-sider">
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
      {
       post.length==0 ?
           <div className="article" >
           <CheckCircleOutlineIcon sx={{fontSize: '40px' }} color = 'primary' />
           <Typography variant="h6" sx={{textAlign:'center', padding: 1}} color='primary'>All Problem got Resolved by Your Department</Typography>
           
           <Create />
        </div>:post.map((el,i) =>{
        return <div key={el._id} className="content">
               
               <div className="content-div">
                  <ul>
                    <li>
                        <h2>{el.title}</h2>
                    </li>
                    <li><p className='limited-paragraph'>{el.problemStatement}</p></li>
                    <div className='spt-det-btn'>
                    {value==1? <Alert sx={{border: 0}} variant="outlined" severity="success">Solved</Alert>:<li><button onClick={()=>handleSupport(el._id)}>Mark as resolved</button></li>}
                    <li><NavLink to={`/posts/${el._id}`} end><button>Detail</button></NavLink></li>
                    </div>
                  </ul>
                <div className='content-div-info'>
                   <ul>
                      
                      <li><PeopleAltOutlinedIcon color="success" /><span> <strong>{el.user.name}</strong></span></li>
                      <li><DriveFileRenameOutlineOutlinedIcon color="primary" /><span>{`${el.createdAt}`}</span></li>
                   </ul>
                   <ul>
                      <li><a href=""><QuestionAnswerOutlinedIcon color="primary"/></a><span>{el.opinions.length}</span></li>
                      <li><a><PollOutlinedIcon color="success" /></a><span>{el.UpVote}</span></li>
                   </ul>
                </div>
               </div>
               
               {el.photo ?
               <div className='content-div-img'>
                   <img src={`https://zealous-eel-hosiery.cyclic.app/postimg/${el.photo}`} alt="" /></div>: <div></div> }
              
               
        </div>
        })
      }
        </div>
      
    </>
  );

}
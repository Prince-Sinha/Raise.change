import Avatar from '@mui/material/Avatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { ToastContainer, toast } from 'react-toastify';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect , useState } from 'react';
import { redirect ,useParams} from 'react-router-dom';
import Create from './Create';
export default function AuthDetail(){

    const { id } = useParams();

    const [postDetail,setPostDetail] = useState({
        title :'',
        image:'',
        problemStatement:'',
        user:'', 
    });
    const [opinionDetail , setOpinionDetail] = useState([]);
    

    useEffect(()=>{
        async function fetchData(){
          const response = await fetch(`https://zealous-eel-hosiery.cyclic.app/api/v1/posts/${id}`);
          const resData = await response.json();
          if(!response.ok){
             console.log('ERR');
             return;
          }
 
          setPostDetail(resData.data.post);
          setOpinionDetail(resData.data.post.opinions);
 
        }
 
        fetchData();
     },[]);


    return <>
           <ToastContainer
                position="bottom-left"
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
      <div id="bar-sider">
         <div className="post-detail">
            <div className="probS">
            <h2>{postDetail.title}</h2>
            
            <ListItemButton sx={{marginBottom: 0, paddingBottom:0,paddingLeft: 0, paddingTop : 3}}>
                 <ListItemAvatar>
                <Avatar alt="Profile Picture" src={`/users/${postDetail.user.photo}`} />
                </ListItemAvatar>
                <ListItemText primary={postDetail.user.name} />
            </ListItemButton>
            <div className='createdAt'><span><DriveFileRenameOutlineOutlinedIcon /></span> {postDetail.createdAt} </div>
        
            {postDetail.photo ? <img src={`https://zealous-eel-hosiery.cyclic.app/postimg/${postDetail.photo}`} alt="" />:<p></p>}
            <p>{postDetail.problemStatement}</p>
            <h4>Public Opinion</h4>
            </div>


            {
                opinionDetail.map((el,i)=>{
                    return (
                        <div key={i} className="opinion">
                
                                <ListItemButton sx={{marginBottom: 0, paddingBottom:0,paddingLeft: 0}}>
                                    <ListItemAvatar>
                                    <Avatar alt="Profile Picture" src={`https://zealous-eel-hosiery.cyclic.app/userimg/${el.photo}`} />
                                    </ListItemAvatar>
                                    <ListItemText primary={el.user.name} secondary={el.opinion} />
                                </ListItemButton>
                       </div>
                    )
                })
            }
         </div>
         
      </div>
    </>
}
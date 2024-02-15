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
export default function Detail(){

    const { id } = useParams();

    const [postDetail,setPostDetail] = useState({
        title :'',
        image:'',
        problemStatement:'',
        user:'', 
    });
    const [opinionDetail , setOpinionDetail] = useState([]);
    


    const handleChange= async (e)=>{
        e.preventDefault();
        const form = new FormData(e.target);
        const formJSON = Object.fromEntries(form.entries());

        const userid = localStorage.getItem('_id');
        // console.log(userid);
        if(!userid){
            toast.info('Please Login to write your opinion', {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
                return;
        }
        formJSON.user = userid;
        formJSON.post = id;

        const res = await fetch(`https://zealous-eel-hosiery.cyclic.app/api/v1/opinions`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(formJSON)
        });

        const resData = await res.json();
        if(!res.ok){
            toast.info(resData.message, {
                position: "bottom-left",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                });
                return;
        }

        redirect(`/posts/${id}`);


    }

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
            <h4>Your Opinion Matters</h4>
            </div>

            <div className='send-opinion'>
            
                <form method="post" onSubmit={handleChange}>
                  <TextField name="opinion" sx={{}} id="standard-basic" color='success' label="Write Your Opinion" variant="standard" />
                  <button type="sumbit"><SendIcon /></button>
                </form>
                

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
         <Create />
      </div>
    </>
}

import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import Model from './Model'
import {useRef, useState} from 'react';
export default function Content(){
    const ref = useRef();
    const [dis, setDisplay] = useState('none')
    const handleChange = ()=>{
        setDisplay('block');
    }

    return (
        <div id="bar-sider">
        <div className="content">
               <div className="content-div">
                  <ul>
                    <li>
                        <h2>Help bring Jack’s and Ben’s shoes back</h2>
                    </li>
                    <li>in a very unfortunate and regretful incident,Last night during the wee hours when everyone was asleep, unknown miscreants most probably the thieves had slipped into the Gents hostel and stole numerous pair of shoes from every door.�</li>
                    <li><button>Support</button></li>
                  </ul>
                <div className='content-div-info'>
                   <ul>
                      <li><PeopleAltOutlinedIcon color="success" /></li>
                      <li><DriveFileRenameOutlineOutlinedIcon color="primary" /></li>
                   </ul>
                   <ul>
                      <li><a href="" onClick={handleChange}><QuestionAnswerOutlinedIcon color="primary"/></a></li>
                      <li><a><PollOutlinedIcon color="success" /></a></li>
                   </ul>
                </div>
               </div>
               <div className='content-div-img'>
                   <img src="./image.jpg" alt="" />
               </div>
               
        </div>
        
        </div>
    )
}
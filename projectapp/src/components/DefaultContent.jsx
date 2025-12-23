import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import Create from './../pages/Create'
export default function DefaultContent({children}){
    return <>
        <div className="article" >
           <ContentPasteSearchIcon sx={{fontSize: '40px', color:'#4d4b4b' }} />
           <p>{children}</p>
           <Create />
        </div>
    </>
}
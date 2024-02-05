import { redirect } from "react-router-dom";
export function action(){
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('_id');
    localStorage.removeItem('dept')
    
    return redirect('/article');
}
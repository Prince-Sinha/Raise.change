import { redirect } from "react-router-dom";

export function getTokenDuration(){
    const storedexpiration = localStorage.getItem('expiration');
    const expirationDate = new Date(storedexpiration);
    const now = new Date();
    const duration = expirationDate.getTime()- now.getTime();
    return duration;
}

export function getAuth(){
    const token = localStorage.getItem('token');

    if(!token){
        return null;
    }
    
    const tokenDuration = getTokenDuration();

    if(tokenDuration < 0){
        return 'EXPIRED';
    }

    return token;
}

export function tokenLoader(){
    return getAuth();
}
export function checkAuthLoader() {
    
    const token = getAuth();
    
    if (!token) {
      return redirect('/login');
    }
   
    return null;
  }

  export function checkAuthLoaderAdmin() {
    
    const name = localStorage.getItem('dept');
    
    if (!name) {
      return redirect('/login/dept');
    }
   
    return null;
  }

  // Check if user is department and redirect to dept dashboard
  export function homeLoader() {
    const dept = localStorage.getItem('dept');
    const token = localStorage.getItem('token');
    
    // If department is logged in, redirect to department dashboard
    if (dept && token) {
      return redirect('/dept');
    }
    
    // Otherwise show home page
    return null;
  }
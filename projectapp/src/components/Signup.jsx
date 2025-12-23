import Signupform from "./Signupform.jsx";
import { NavLink } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

export default function Signup(){
  
  return (
    <section id="signup">
      <div className="signup-container">
        <div className="signup-illustration">
          <div className="signup-illustration-content">
            <img src="./../../3R.png" alt="Logo" className="signup-illustration-logo" />
            <h1>Join Raise.Change!</h1>
            <p>Create an account to start raising issues and making a real impact in your community</p>
            
            <div className="type-animation-container">
              <TypeAnimation
                sequence={[
                  "At Raise.change, we believe in the power of community engagement and proactive problem-solving. We have created a unique platform where individuals can come together to address and report various issues and challenges faced by our society. Whether it's a damaged road, sewage leakage, or concerns related to cybercrime, our platform serves as a bridge between the community and the respective administrative departments",
                  3000,
                  "",
                  0,
                ]}
                wrapper="p"
                speed={70}
                deletionSpeed={99}
                repeat={Infinity}
                className='custom-type-animation-cursor'
              />
            </div>
          </div>
        </div>
        
        <div className='signup-form-container'>
          <div className="signup-form-wrapper">
            <div className="signup-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>
            
            <Signupform />
            
            <div className="signup-footer">
              <p>Already have an account? <NavLink to="/login" className="login-link">Sign In</NavLink></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

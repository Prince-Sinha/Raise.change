import { TypeAnimation } from 'react-type-animation';
export default function SignupSide(){
    return (
    <div className="box boxcontent anim">
      <img src="./../../1R.png" alt="Logo" />
      <p>
      <TypeAnimation
            
            sequence={["At Raise.change, we believe in the power of community engagement and proactive problem-solving.We have created a unique platform where individuals can come together to address and report various issues and  challenges faced by our society. Whether it's a damaged road, sewage leakage, or concerns related to cybercrime,our platform serves as a bridge between the community and the respective administrative departments", 800,]}
            
            omitDeletionAnimation={true}
            className='custom-type-animation-cursor'
            
           />
      </p>
    </div>
    )
}

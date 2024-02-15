import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Root from './pages/Root'
import Home from './pages/Home'
import Resolved from './pages/Resolved'
import Article from './pages/Article'
import Post from './pages/Post'
import Profile from './pages/Profile'
import Auth , {action as authAction } from './pages/Auth'
import Notification from './pages/Notification'
import Detail from './pages/Detail'
import Create from './pages/Create'
import SignUp from './pages/SignUp'
import Department from './pages/Department'
import LoginDept from './pages/LoginDept'
import AuthDetail from './pages/AuthDetail'
import {createBrowserRouter , RouterProvider} from 'react-router-dom';
import { action as logoutaction} from './pages/Logout'
import { checkAuthLoader,tokenLoader ,checkAuthLoaderAdmin } from './util/auth'

const router = createBrowserRouter([
  { path : '/', element : <Root />,
    id : 'root',
    loader: tokenLoader,
    children : [
      {index:true , element : <Home />},
      {path : 'article' , element : <Article />},
      {path : 'resolved' , element : <Resolved /> },
      {path : 'posts' , element : <Post />},
      {path : 'posts/:id', element : <Detail />},
      {path : 'profile', element : <Profile /> , loader : checkAuthLoader},
      {path : 'logout' , action : logoutaction ,loader : checkAuthLoader},
      {path : '/notification', element : <Notification/>},
    ]
  },
  {path : '/signup' , element : <SignUp />},
  {path : '/login' , element : <Auth /> , action : authAction},
  {path : '/createPost' , element : <Create />},
  {path : '/dept',element : <Department />, loader: checkAuthLoaderAdmin},
  {path : '/login/dept' , element: <LoginDept />  },
  {path : '/dept/posts/:id', element : <AuthDetail />}
  
  
])

function App() {
  // const [count, setCount] = useState(0)

  // return (
  //   <>
  //     <Header></Header>
  //     <main id="sidebar">
  //         <SideBar></SideBar>
  //         <Content></Content>
  //     </main>
  //     {/* <Signup /> */}
  //     {/* <Login /> */}
  //   </>
  // )
  return <RouterProvider router = {router}/>
}

export default App

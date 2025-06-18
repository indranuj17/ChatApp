import React from 'react'
import { Navigate, Route , Routes} from 'react-router'
import SignUpPage from "./pages/SignUpPage.jsx"
import NotificationsPage from './pages/NotificationsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage.jsx'
import CallPage from './pages/CallPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import OnboardingPage from "./pages/OnboardingPage.jsx"
import FriendsPage from './pages/FriendsPage.jsx'
import  { Toaster } from 'react-hot-toast';
import PageLoader from './components/PageLoader.jsx'

import useAuthUser from './hooks/useAuthUser.js'
import Layout from './components/Layout.jsx'
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  
  const {isLoading,authUser}=useAuthUser();
  
  const isAuthenticated=Boolean(authUser);
  const isOnboarded=authUser?.isOnboarded;


  const { theme } = useThemeStore();
  
  if(isLoading) return <PageLoader/>;

 


  return (
    <div className='h-screen 'data-theme={theme}>
  
     <Routes>
      
      <Route path='/' element={isAuthenticated && isOnboarded ? (<Layout showSidebar={true}><HomePage/></Layout>) : (<Navigate to={!isAuthenticated ? "/login": "/onboarding"}/>) }/>
 
      
      <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />  }/>


      <Route path="/login" element={ !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />} />

      <Route path='/notifications' element={isAuthenticated?  <Layout showSidebar={true}><NotificationsPage /></Layout>: <Navigate to="/login"/>}/>

      <Route path='/call/:id' element={isAuthenticated && isOnboarded ?(<CallPage/>):(<Navigate to={!isAuthenticated?"/login":"/onboarding"}/>)}/>

      <Route path='/chat/:id' element={isAuthenticated && isOnboarded ?(<Layout showSidebar={false}><ChatPage/></Layout>):(<Navigate to={!isAuthenticated?"/login":"/onboarding"}/>)}/>

      <Route path='/onboarding' element={isAuthenticated? (!isOnboarded? <OnboardingPage/> :<Navigate to="/"/>):<Navigate to="/login"/>}/>
       
       <Route
  path="/friends"
  element={
    isAuthenticated && isOnboarded ? (
      <Layout showSidebar={true}><FriendsPage /></Layout>
    ) : (
      <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
    )
  }
/>

     </Routes>

     <Toaster/>
     
     </div>
  )
}

export default App
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { BlogLayout } from './pages/Blog';
import { Blogs } from "./pages/Blogs";
import { Publish } from './pages/Publish';
import Home from './pages/Home';
import { AuthProvider } from './utils/context/userContext';
import ProfilePage from './pages/ProfilePage';
import { UserInteractionProvider } from './utils/context/userInteraction';

function App() {

  return (
    <>
          <AuthProvider>
            <UserInteractionProvider>

      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Home/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blog/:id" element={<BlogLayout />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/publish" element={<Publish />} />

        </Routes>
      </BrowserRouter>
            </UserInteractionProvider>
          </AuthProvider>
    </>
  )
}

export default App
import { Routes, Route, Navigate } from 'react-router-dom';

import { NotFound } from './pages/NotFound'
import { LoginForm } from './pages/Login';
import { RegisterForm } from './pages/Register';
import { Home } from './pages/Home';

import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

const links = [
  { name: 'Home', path: '/Home' },
  { name: 'Login', path: '/login' },
  { name: 'About', path: '/about' },
];

function App() {

  return (
    <>
      <Navbar links={links} />
      <Routes>
        <Route path="/" element={<Navigate to="/home"/>} />
        <Route path="/login" element={ <LoginForm /> } />
        <Route path="/register" element={ <RegisterForm /> } />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App

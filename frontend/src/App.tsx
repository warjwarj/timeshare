import { Routes, Route, Navigate } from 'react-router-dom';

import { NotFound } from './pages/NotFound'
import { LoginForm } from './pages/Login';
import { RegisterForm } from './pages/Register';
import { EventsView } from './pages/EventsView';
import { Settings } from './pages/Settings';

import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';

const links = [
  { name: 'Timeshare', path: '/home' },
];

function App() {
  return (
    <>
      <Navbar links={links} />
      <Routes>
        <Route path="/" element={<Navigate to="/home"/>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/home" element={<EventsView />} />
          <Route path="/availability" element={<div>Availability View (TODO)</div>} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App

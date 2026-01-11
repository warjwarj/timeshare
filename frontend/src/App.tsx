import { Routes, Route, Navigate } from 'react-router-dom';

import { NotFound } from './pages/NotFound'
import { LoginForm } from './pages/Login';
import { RegisterForm } from './pages/Register';
import { EventsView } from './pages/EventsView';
import { Settings } from './pages/Settings';

import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './MainLayout';
import { AvailabilityView } from './pages/AvailabilityView';

const links = [
  { name: 'Timeshare', path: '/events' },
];

function App() {
  return (
    <>
      <Navbar links={links} />
      <Routes>
        <Route path="/" element={<Navigate to="/home"/>} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/events" element={<EventsView />} />
          <Route path="/availability" element={<AvailabilityView />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App

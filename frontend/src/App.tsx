import { Routes, Route, Navigate } from 'react-router-dom';

import { NotFound } from './pages/NotFound'
import { LoginForm } from './pages/Login';
import { RegisterForm } from './pages/Register';
import { CalendarView } from './pages/CalendarView';
import { Settings } from './pages/Settings';

import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './MainLayout';
import { AvailabilityView } from './pages/AvailabilityView';
import { EventsView } from './pages/EventsView';
import { SearchView } from './pages/SearchView';

const links = [
  { name: 'Timeshare', path: '/calendar' },
];

function App() {
  return (
    <>
      <Navbar links={links} />
      <Routes>
        <Route path="/" element={<Navigate to="/calendar" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/search" element={<SearchView />} />
          <Route path="/calendar" element={<CalendarView />} />
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

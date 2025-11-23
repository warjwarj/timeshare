import { Routes, Route, Link } from 'react-router-dom';

import { Home } from '../src/pages/Home'
import { NotFound } from '../src/pages/NotFound'


function App() {
  return (
    <div>
      <nav style={{ marginBottom: '1rem' }}>
        <Link to="/">Home</Link> |
        <Link to="/about">About</Link> |
      </nav>      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App

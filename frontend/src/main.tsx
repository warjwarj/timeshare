import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
// import { AuthProvider } from './providers/AuthProvider.tsx';
import App from './App.tsx';
import '../index.css';

import configureStore from './store/store.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={configureStore}>
        <App />
      </Provider>
    </BrowserRouter>
    {/* <AuthProvider>
    </AuthProvider> */}
  </StrictMode>,
)
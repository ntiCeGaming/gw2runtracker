import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';
import { initializeDatabase } from './database/db';
import { RaidTrackerProvider } from './contexts/RaidTrackerContext';
import { UserProvider } from './contexts/UserContext';

// Initialize the IndexedDB database
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Get the base URL from the environment or default to '/'.
// This allows the app to work in subdirectories when deployed
const basename = process.env.PUBLIC_URL || '/';

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <UserProvider>
        <RaidTrackerProvider>
          <App />
        </RaidTrackerProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
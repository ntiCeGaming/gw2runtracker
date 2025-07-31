import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import RaidTracker from './pages/RaidTracker';
import RaidHistory from './pages/RaidHistory';
import RunDetails from './pages/RunDetails';
import RaidAnalytics from './pages/RaidAnalytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tracker" element={<RaidTracker />} />
          <Route path="/history" element={<RaidHistory />} />
          <Route path="/history/:id" element={<RunDetails />} />
          <Route path="/analytics" element={<RaidAnalytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
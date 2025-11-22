import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store';
import Layout from './components/Layout';
import Agenda from './pages/Agenda';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Finance from './pages/Finance';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Agenda />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/services" element={<Services />} />
            <Route path="/finance" element={<Finance />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;
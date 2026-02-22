import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { SchoolProfileProvider } from './contexts/SchoolProfileContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SchoolProfileProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </SchoolProfileProvider>
  </React.StrictMode>
);

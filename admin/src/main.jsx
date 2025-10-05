import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import PropTypes from 'prop-types';

function BootstrapTokenSaver({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const token = qs.get('token');

    if (token) {
      localStorage.setItem('admin_token', token);
      // dọn URL cho đẹp
      window.history.replaceState({}, '', window.location.pathname);
      console.log('Saved admin_token to localStorage');
    } else {
      console.log('No token in URL');
    }
    setReady(true); // ✅ báo đã xử lý xong
  }, []);

  if (!ready) return null; // hoặc loader
  return children;
}

BootstrapTokenSaver.propTypes = {
  children: PropTypes.node.isRequired,
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BootstrapTokenSaver>
        <App />
      </BootstrapTokenSaver>
    </BrowserRouter>
  </React.StrictMode>
);


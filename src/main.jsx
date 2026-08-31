import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { App } from './App';
import { store } from './store';
import { applyTheme, readStoredTheme } from './theme/applyTheme';
import './styles/tokens.css';
import './styles/stitch.css';
import './styles/reset.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/workspace.css';

applyTheme(readStoredTheme());


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter/wght.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import './styles/thema.css';
import './styles/app.css';
import './styles/installeren.css';
import './styles/training.css';
import './styles/editor.css';
import { App } from './App';
import { startServiceWorker } from './engine/update';
import { pasThemaToe } from './engine/thema';

// Clubkleuren en licht/donker meteen toepassen (geen kleurflits bij het opstarten).
pasThemaToe();

startServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

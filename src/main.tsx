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
import './styles/wedstrijd.css';
import { App } from './App';
import { startServiceWorker } from './engine/update';
import { pasThemaToe } from './engine/thema';
import { bewaardAccount, online } from './engine/account';
import { onlineBeschikbaar } from './online/config';
import { laadTaal } from './data/oefeningen';

// Clubkleuren en licht/donker meteen toepassen (geen kleurflits bij het opstarten).
pasThemaToe();

// Was je ingelogd? Dan de online-module laden (synchroniseren en teams). Anders blijft Firebase weg.
if (bewaardAccount() && onlineBeschikbaar()) void online().then((m) => m.startOnline());

startServiceWorker();

// In het Engels eerst de Engelse oefenteksten laden (een eigen bestand, ook offline beschikbaar).
void laadTaal()
  .catch(() => undefined)
  .then(() =>
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  );

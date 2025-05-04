import './global.css';
import './setup';

import { createRoot } from 'react-dom/client';

import { App } from './app';

 
createRoot(document.getElementById('app')!).render(<App />);

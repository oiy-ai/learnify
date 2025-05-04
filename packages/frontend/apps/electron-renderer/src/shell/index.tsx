import './setup';

import { events } from '@affine/electron-api';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';

async function main() {
  const handleActive = (active: boolean | undefined) => {
    document.documentElement.dataset.active = String(active);
  };
  events?.ui.onTabShellViewActiveChange(handleActive);
  mountApp();
}

function mountApp() {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('Root element not found');
  }
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

main().catch(console.error);

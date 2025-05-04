import { logger } from '../logger';
import { initAndShowMainWindow } from './main-window';

/**
 * Launch app depending on launch stage
 */
export async function launch() {
  initAndShowMainWindow().catch(e => {
    logger.error('Failed to restore or create window:', e);
  });
}

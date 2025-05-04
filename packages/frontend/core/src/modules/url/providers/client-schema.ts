import { createIdentifier } from '@toeverything/infra';

export interface ClientSchemeProvider {
  /**
   * Get the client schema in the current environment, used for the user to complete the authentication process in the browser and redirect back to the app.
   */
  getClientScheme(): string | undefined;
}

export const ClientSchemeProvider = createIdentifier<ClientSchemeProvider>(
  'ClientSchemeProvider'
);

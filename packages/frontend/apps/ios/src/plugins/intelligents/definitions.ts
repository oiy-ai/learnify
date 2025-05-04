export interface IntelligentsPlugin {
  presentIntelligentsButton(): Promise<void>;
  dismissIntelligentsButton(): Promise<void>;
}

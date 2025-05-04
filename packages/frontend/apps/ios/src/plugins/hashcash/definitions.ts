export interface HashcashPlugin {
  hash(options: {
    challenge: string;
    bits?: number;
  }): Promise<{ value: string }>;
}

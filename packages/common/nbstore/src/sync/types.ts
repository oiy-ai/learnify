export interface PeerStorageOptions<S> {
  local: S;
  remotes: Record<string, S>;
}

// Types for InstantDB and sync events
export interface SyncEvent {
  id: string
  timestamp: number
  type: "write" | "conflict" | "resolved"
  detail: string
}

export interface SyncStats {
  writes: number
  conflicts: number
  resolved: number
}

import { useRepo } from "pinia-orm"
import SyncEventModel from "../models/SyncEventModel"
import type { SyncEvent } from "../types"

export class SyncService {
  private instantDBClient: any
  private syncEventRepo = useRepo(SyncEventModel)

  constructor(instantDBClient: any) {
    this.instantDBClient = instantDBClient
  }

  // Create a new event locally and queue for sync
  createLocalEvent(eventData: Omit<SyncEvent, "id" | "timestamp">): SyncEventModel {
    const event = new SyncEventModel({
      id: this.generateId(),
      ...eventData,
      timestamp: new Date().toISOString(),
      synced: false,
      version: 1,
    })

    // Save to local store
    this.syncEventRepo.save(event)

    // Queue for background sync
    this.queueForSync(event)

    return event
  }

  // Handle incoming data from InstantDB subscription
  handleRemoteData(events: SyncEvent[]) {
    events.forEach((event) => {
      const existingEvent = this.syncEventRepo.find(event.id)

      if (existingEvent) {
        // Check for conflicts
        if (existingEvent.version !== event.version && !existingEvent.synced) {
          this.handleConflict(existingEvent, event)
        } else {
          // Update existing event
          this.syncEventRepo.save({
            ...event,
            synced: true,
          })
        }
      } else {
        // New event from remote
        this.syncEventRepo.save({
          ...event,
          synced: true,
        })
      }
    })
  }

  // Handle conflicts between local and remote versions
  private handleConflict(localEvent: SyncEventModel, remoteEvent: SyncEvent) {
    console.log("Conflict detected:", { localEvent, remoteEvent })

    // Create conflict event
    const conflictEvent = new SyncEventModel({
      id: this.generateId(),
      type: "conflict",
      name: `Conflict: ${localEvent.name}`,
      entity: localEvent.entity,
      change: {
        local: localEvent.change,
        remote: remoteEvent.change,
        localTimestamp: localEvent.timestamp,
        remoteTimestamp: remoteEvent.timestamp,
      },
      timestamp: new Date().toISOString(),
      synced: false,
      version: 1,
    })

    this.syncEventRepo.save(conflictEvent)

    // For now, use simple last-write-wins resolution
    const resolvedEvent = localEvent.mergeWith(SyncEventModel.fromInstantDBData(remoteEvent))
    this.syncEventRepo.save(resolvedEvent)
  }

  // Sync all pending local events to remote
  async syncAllPendingEvents(): Promise<void> {
    const unsyncedEvents = this.syncEventRepo.where("synced", false).get()

    for (const event of unsyncedEvents) {
      if (event.type !== "conflict") {
        // Don't sync conflict events
        await event.syncToRemote(this.instantDBClient)
      }
    }
  }

  // Queue an event for background sync
  private queueForSync(event: SyncEventModel) {
    // Simple immediate sync for now - in production you'd use a proper queue
    setTimeout(async () => {
      try {
        await event.syncToRemote(this.instantDBClient)
      } catch (error) {
        console.error("Background sync failed:", error)
      }
    }, 1000)
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get sync statistics
  getStats() {
    const events = this.syncEventRepo.all()
    return {
      total: events.length,
      writes: events.filter((e) => e.type === "write").length,
      conflicts: events.filter((e) => e.type === "conflict").length,
      resolved: events.filter((e) => e.type === "resolved").length,
      unsynced: events.filter((e) => !e.synced).length,
    }
  }

  // Clear all local events
  clearAll() {
    this.syncEventRepo.flush()
  }
}

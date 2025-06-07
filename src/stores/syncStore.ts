import { defineStore } from "pinia"
import { useRepo } from "pinia-orm"
import SyncEventModel from "../models/SyncEventModel"
import { SyncService } from "../services/SyncService"
import type { SyncEvent } from "../types"

export const useSyncStore = defineStore("sync", () => {
  const syncEventRepo = useRepo(SyncEventModel)
  let syncService: SyncService | null = null

  // Initialize sync service with InstantDB client
  function initializeSyncService(instantDBClient: any) {
    syncService = new SyncService(instantDBClient)
  }

  // Get all sync events from local store
  function getAllEvents(): SyncEventModel[] {
    return syncEventRepo.all()
  }

  // Get unsynced events
  function getUnsyncedEvents(): SyncEventModel[] {
    return syncEventRepo.where("synced", false).get()
  }

  // Create a new sync event
  function createEvent(event: Omit<SyncEvent, "id" | "timestamp">): SyncEventModel | null {
    if (!syncService) {
      console.warn("Sync service not initialized")
      return null
    }
    return syncService.createLocalEvent(event)
  }

  // Handle incoming data from InstantDB
  function handleRemoteData(events: SyncEvent[]) {
    if (!syncService) {
      console.warn("Sync service not initialized")
      return
    }
    syncService.handleRemoteData(events)
  }

  // Clear all events
  function clearAllEvents() {
    syncEventRepo.flush()
  }

  // Get statistics
  function getStats() {
    const events = getAllEvents()
    return {
      total: events.length,
      writes: events.filter((e) => e.type === "write").length,
      conflicts: events.filter((e) => e.type === "conflict").length,
      resolved: events.filter((e) => e.type === "resolved").length,
      unsynced: getUnsyncedEvents().length,
    }
  }

  // Sync all pending events
  async function syncAllPendingEvents() {
    if (!syncService) {
      console.warn("Sync service not initialized")
      return
    }
    await syncService.syncAllPendingEvents()
  }

  return {
    // State
    getAllEvents,
    getUnsyncedEvents,
    getStats,

    // Actions
    initializeSyncService,
    createEvent,
    handleRemoteData,
    clearAllEvents,
    syncAllPendingEvents,
  }
})

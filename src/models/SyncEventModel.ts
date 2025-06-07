import { Model } from "pinia-orm"
import type { SyncEvent } from "../types"

export default class SyncEventModel extends Model {
  static entity = "syncEvents"

  static fields() {
    return {
      id: this.attr(""),
      type: this.attr(""),
      name: this.attr(""),
      entity: this.attr(""),
      change: this.attr(null),
      timestamp: this.attr(""),
      synced: this.attr(false),
      version: this.attr(1),
    }
  }

  // Properties with types
  declare id: string
  declare type: string
  declare name: string
  declare entity: string
  declare change: any
  declare timestamp: string
  declare synced: boolean
  declare version: number

  // Bridge methods to sync with InstantDB
  async syncToRemote(instantDBClient: any): Promise<boolean> {
    try {
      // Convert to InstantDB format and push
      const eventData = {
        id: this.id,
        type: this.type,
        name: this.name,
        entity: this.entity,
        change: this.change,
        timestamp: this.timestamp,
        version: this.version,
      }

      await instantDBClient.transact(instantDBClient.tx.events[this.id].update(eventData))

      // Update local synced status
      this.$update({ synced: true })
      return true
    } catch (error) {
      console.error("Failed to sync event to remote:", error)
      return false
    }
  }

  static fromInstantDBData(data: SyncEvent): SyncEventModel {
    return new SyncEventModel({
      id: data.id,
      type: data.type,
      name: data.name,
      entity: data.entity,
      change: data.change,
      timestamp: data.timestamp,
      synced: true, // Coming from remote, so it's synced
      version: data.version || 1,
    })
  }

  // Conflict resolution methods
  mergeWith(otherEvent: SyncEventModel): SyncEventModel {
    // Simple last-write-wins for now
    const latestTimestamp = this.timestamp > otherEvent.timestamp ? this.timestamp : otherEvent.timestamp
    const mergedEvent = latestTimestamp === this.timestamp ? this : otherEvent

    return new SyncEventModel({
      ...mergedEvent,
      version: Math.max(this.version, otherEvent.version) + 1,
      timestamp: new Date().toISOString(),
      type: "resolved",
      synced: false, // Needs to be synced again
    })
  }
}

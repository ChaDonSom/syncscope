<template>
  <main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">SyncScope</h1>
        <p class="text-gray-600 text-lg">Local-first sync inspector & dashboard</p>
        <div class="mt-2 flex items-center space-x-4 text-sm">
          <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium"> ✨ Pinia ORM Enabled </span>
          <span class="text-gray-500"> Local-first state management with InstantDB sync </span>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Events</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Writes</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.writes }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="bg-yellow-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.694-.833-3.464 0L2.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Conflicts</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.conflicts }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="bg-orange-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Unsynced</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.unsynced }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Events -->
      <section class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Recent Sync Events</h2>
              <p class="text-sm text-gray-500 mt-1">Local-first with Pinia ORM + InstantDB sync</p>
            </div>
            <div class="flex space-x-2">
              <button
                @click="createTestEvent"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
              >
                Create Test Event
              </button>
              <button
                @click="syncStore.clearAllEvents()"
                class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="events.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m5 4v7a1 1 0 01-1 1h-2a1 1 0 01-1-1v-7m-4 0V9a1 1 0 011-1h2a1 1 0 011 1v4.01"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No sync events yet</h3>
            <p class="mt-1 text-sm text-gray-500">Create a test event to see the Pinia ORM in action</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="event in events"
              :key="event.id"
              class="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <!-- Event Type Badge -->
              <div
                :class="getEventBadgeClass(event.type)"
                class="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ event.type.toUpperCase() }}
              </div>

              <!-- Sync Status -->
              <div class="flex-shrink-0">
                <span
                  v-if="event.synced"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                >
                  ✓ Synced
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                >
                  ⏳ Local
                </span>
              </div>

              <!-- Event Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ event.name }}
                  </p>
                  <time class="text-sm text-gray-500 flex-shrink-0 ml-4">
                    {{ formatDate(event.timestamp) }}
                  </time>
                </div>
                <div class="flex items-center space-x-4 mt-1">
                  <p class="text-xs text-gray-500">ID: {{ event.id }}</p>
                  <p v-if="event.localChanges" class="text-xs text-orange-600">Local changes pending</p>
                  <p v-if="event.syncedAt" class="text-xs text-green-600">Synced: {{ formatDate(event.syncedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Debug Info -->
      <section class="mt-8 bg-gray-900 rounded-lg p-6 text-white">
        <h3 class="text-lg font-semibold mb-4">Debug Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-gray-300">InstantDB Connected:</p>
            <p class="font-mono">{{ isConnected ? "Yes" : "No" }}</p>
          </div>
          <div>
            <p class="text-gray-300">Project ID:</p>
            <p class="font-mono">{{ projectId || "Not configured" }}</p>
          </div>
          <div>
            <p class="text-gray-300">Pinia ORM Store:</p>
            <p class="font-mono">Active</p>
          </div>
        </div>

        <!-- Test Actions -->
        <div class="mt-4 flex space-x-2">
          <button
            @click="testInstantDBWrite"
            :disabled="!db"
            class="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            Test InstantDB Write
          </button>
          <button
            @click="syncStore.syncAllPendingEvents()"
            class="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors"
          >
            Sync Pending
          </button>
          <button
            @click="fetchAllData"
            :disabled="!db"
            class="px-3 py-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            Fetch Remote Data
          </button>
        </div>
      </section>

      <!-- Visual Debug Console -->
      <section class="mt-8 bg-black rounded-lg p-6 text-green-400 font-mono text-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-white">Debug Console</h3>
          <button
            @click="debugLogs = []"
            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
          >
            Clear
          </button>
        </div>

        <div class="h-64 overflow-y-auto space-y-1">
          <div v-if="debugLogs.length === 0" class="text-gray-500">Waiting for debug messages...</div>

          <div v-for="log in debugLogs" :key="log.timestamp" class="flex items-start space-x-2">
            <span class="text-gray-500 text-xs flex-shrink-0">
              {{ formatDate(log.timestamp) }}
            </span>
            <span
              :class="{
                'text-green-400': log.level === 'success',
                'text-red-400': log.level === 'error',
                'text-blue-400': log.level === 'info',
              }"
              class="text-xs flex-shrink-0 uppercase"
            >
              [{{ log.level }}]
            </span>
            <span class="text-gray-300 text-xs break-all">{{ log.message }}</span>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import { useSyncStore } from "./stores/syncStore"
import type { SyncEvent } from "./types"

// Configuration
const projectId = import.meta.env.VITE_INSTANTDB_PROJECT_ID || "your-project-id"

// Store
const syncStore = useSyncStore()

// Reactive state
const isConnected = ref(false)
const debugLogs = ref<Array<{ timestamp: number; level: "info" | "error" | "success"; message: string }>>([])

// Debug logging function
function addDebugLog(level: "info" | "error" | "success", message: string) {
  debugLogs.value.unshift({
    timestamp: Date.now(),
    level,
    message,
  })
  // Keep only last 20 logs
  if (debugLogs.value.length > 20) {
    debugLogs.value = debugLogs.value.slice(0, 20)
  }
  console.log(`[${level.toUpperCase()}]`, message)
}

// InstantDB client
let db: any = null
let unsubscribe: (() => void) | null = null

// Computed properties
const events = computed(() => {
  return syncStore.getAllEvents().sort((a, b) => b.timestamp - a.timestamp)
})

const stats = computed(() => syncStore.getStats())

// Utility functions
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function getEventBadgeClass(type: SyncEvent["type"]): string {
  switch (type) {
    case "write":
      return "bg-green-100 text-green-800"
    case "conflict":
      return "bg-yellow-100 text-yellow-800"
    case "resolved":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Create a test event using Pinia ORM
function createTestEvent() {
  const eventTypes: Array<SyncEvent["type"]> = ["write", "conflict", "resolved"]
  const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

  const testEvent = {
    type: randomType,
    name: `Test ${randomType} event created at ${new Date().toLocaleTimeString()}`,
    entity: "test",
    change: { action: "create", data: { test: true } },
  }

  const createdEvent = syncStore.createEvent(testEvent)

  if (createdEvent) {
    addDebugLog("success", `Created local event: ${createdEvent.detail}`)
  } else {
    addDebugLog("error", "Failed to create event - sync service not initialized")
  }
}

// Test functions for InstantDB
async function testInstantDBWrite() {
  if (!db) {
    addDebugLog("error", "Database not initialized")
    return
  }

  try {
    addDebugLog("info", "Testing InstantDB write...")

    const newEvent = {
      timestamp: Date.now(),
      type: "write" as const,
      detail: `Direct InstantDB test at ${new Date().toLocaleTimeString()}`,
    }

    // Use the correct InstantDB transaction API
    const { tx, id } = await import("@instantdb/core")
    await db.transact(tx.syncEvents[id()].update(newEvent))

    addDebugLog("success", `Successfully wrote test event directly to InstantDB`)
  } catch (error) {
    addDebugLog("error", `Direct write failed: ${JSON.stringify(error)}`)
  }
}

async function fetchAllData() {
  if (!db) {
    addDebugLog("error", "Database not initialized")
    return
  }

  try {
    addDebugLog("info", "Fetching all data from InstantDB...")

    // This will trigger the subscription callback
    addDebugLog("info", "Using existing subscription to fetch data")
  } catch (error) {
    addDebugLog("error", `Fetch failed: ${error}`)
  }
}

// Setup subscription and cleanup
onMounted(async () => {
  addDebugLog("info", "SyncScope dashboard with Pinia ORM mounted")
  addDebugLog("info", `Project ID: ${projectId}`)

  // Add some mock data to demonstrate Pinia ORM
  addMockData()

  // Try to initialize InstantDB
  try {
    addDebugLog("info", "Initializing InstantDB connection...")

    const { init } = await import("@instantdb/core")
    db = init({ appId: projectId })

    // Initialize sync service with InstantDB client
    syncStore.initializeSyncService(db)

    addDebugLog("success", "InstantDB client initialized and connected to Pinia ORM")

    // Subscribe to sync events
    addDebugLog("info", "Setting up query subscription...")

    unsubscribe = db.subscribeQuery({ syncEvents: {} }, (result: any) => {
      addDebugLog("info", `Query result received: ${JSON.stringify(result, null, 2)}`)

      if (result.data && result.data.syncEvents) {
        // Handle remote data through Pinia ORM
        const remoteEvents = Object.values(result.data.syncEvents) as SyncEvent[]
        syncStore.handleRemoteData(remoteEvents)
        isConnected.value = true
        addDebugLog("success", `Synced ${remoteEvents.length} events from InstantDB to Pinia ORM`)
      } else {
        addDebugLog("info", "No sync events found in InstantDB yet")
        isConnected.value = true // Still connected, just no data
      }
    })

    addDebugLog("success", "InstantDB subscription active with Pinia ORM integration")
  } catch (error) {
    addDebugLog("error", `InstantDB connection failed: ${error}`)
    addDebugLog("info", "Continuing with local-only Pinia ORM mode")
    isConnected.value = false
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

// Mock data for development/testing
function addMockData(): void {
  addDebugLog("info", "Adding mock data to Pinia ORM store...")

  const mockEvents = [
    {
      timestamp: Date.now() - 1000,
      type: "write" as const,
      detail: "User updated profile information (from Pinia ORM)",
    },
    {
      timestamp: Date.now() - 5000,
      type: "conflict" as const,
      detail: 'Concurrent edit on document "Project Plan"',
    },
    {
      timestamp: Date.now() - 10000,
      type: "resolved" as const,
      detail: "Merged changes from two clients successfully",
    },
  ]

  mockEvents.forEach((event) => {
    syncStore.createEvent(event)
  })

  addDebugLog("success", `Added ${mockEvents.length} mock events to Pinia ORM store`)
}
</script>

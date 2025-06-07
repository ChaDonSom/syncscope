<template>
  <main class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">SyncScope</h1>
        <p class="text-gray-600 text-lg">Local-first sync inspector & dashboard</p>
      </header>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Writes</p>
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
            <div class="bg-blue-100 p-3 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Resolved</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.resolved }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Events -->
      <section class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Recent Sync Events</h2>
          <p class="text-sm text-gray-500 mt-1">Live updates from your sync layer</p>
        </div>

        <div class="p-6">
          <div v-if="syncEvents.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m5 4v7a1 1 0 01-1 1h-2a1 1 0 01-1-1v-7m-4 0V9a1 1 0 011-1h2a1 1 0 011 1v4.01"
              />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No sync events yet</h3>
            <p class="mt-1 text-sm text-gray-500">Events will appear here as your app syncs data</p>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="event in syncEvents"
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

              <!-- Event Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ event.detail }}
                  </p>
                  <time class="text-sm text-gray-500 flex-shrink-0 ml-4">
                    {{ formatDate(event.timestamp) }}
                  </time>
                </div>
                <p class="text-xs text-gray-500 mt-1">Event ID: {{ event.id }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Debug Info -->
      <section class="mt-8 bg-gray-900 rounded-lg p-6 text-white">
        <h3 class="text-lg font-semibold mb-4">Debug Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-300">Connected:</p>
            <p class="font-mono">{{ isConnected ? "Yes" : "No" }}</p>
          </div>
          <div>
            <p class="text-gray-300">Project ID:</p>
            <p class="font-mono">{{ projectId || "Not configured" }}</p>
          </div>
        </div>

        <!-- Test Actions -->
        <div class="mt-4 flex space-x-2">
          <button
            @click="testInstantDBWrite"
            :disabled="!db"
            class="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            Test Write
          </button>
          <button
            @click="fetchAllData"
            :disabled="!db"
            class="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            Fetch Data
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
import { ref, computed, onMounted, onUnmounted } from "vue"
import type { SyncEvent } from "./types"

// Configuration - replace with your actual InstantDB project ID
const projectId = import.meta.env.VITE_INSTANTDB_PROJECT_ID || "your-project-id"

// Reactive state
const syncEvents = ref<SyncEvent[]>([])
const isConnected = ref(false)
const unsubscribeRef = ref<(() => void) | null>(null)
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

// InstantDB client - will be initialized when needed
let db: any = null
let unsubscribe: (() => void) | null = null

// Computed statistics
const stats = computed(() => {
  const writes = syncEvents.value.filter((e) => e.type === "write").length
  const conflicts = syncEvents.value.filter((e) => e.type === "conflict").length
  const resolved = syncEvents.value.filter((e) => e.type === "resolved").length

  return { writes, conflicts, resolved }
})

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

// Test functions for InstantDB
async function testInstantDBWrite() {
  if (!db) {
    addDebugLog("error", "Database not initialized")
    return
  }

  try {
    addDebugLog("info", "Testing InstantDB write...")

    const newEvent = {
      id: `test-${Date.now()}`,
      timestamp: Date.now(),
      type: "write",
      detail: `Test event created at ${new Date().toLocaleTimeString()}`,
    }

    await db.transact([db.tx.syncEvents[newEvent.id].update(newEvent)])

    addDebugLog("success", `Successfully wrote test event: ${newEvent.id}`)
  } catch (error) {
    addDebugLog("error", `Write failed: ${error}`)
  }
}

async function fetchAllData() {
  if (!db) {
    addDebugLog("error", "Database not initialized")
    return
  }

  try {
    addDebugLog("info", "Fetching all data from InstantDB...")

    const result = await db.query({ syncEvents: {} })
    addDebugLog("info", `Raw query result: ${JSON.stringify(result, null, 2)}`)

    if (result.data?.syncEvents) {
      addDebugLog("success", `Found ${result.data.syncEvents.length} events`)
    } else {
      addDebugLog("info", "No events found in database")
    }
  } catch (error) {
    addDebugLog("error", `Fetch failed: ${error}`)
  }
}

// Setup subscription and cleanup

onMounted(async () => {
  addDebugLog("info", "SyncScope dashboard mounted")
  addDebugLog("info", `Project ID: ${projectId}`)

  // For now, start with mock data
  addMockData()

  // Try to initialize InstantDB
  try {
    addDebugLog("info", "Initializing InstantDB connection...")

    const { init } = await import("@instantdb/core")
    db = init({ appId: projectId })

    addDebugLog("success", "InstantDB client initialized successfully")

    // Subscribe to sync events
    addDebugLog("info", "Setting up query subscription...")
    const query = db.query({ syncEvents: {} })

    unsubscribe = query.subscribe((result: any) => {
      addDebugLog("info", `Query result received: ${JSON.stringify(result, null, 2)}`)

      if (result.data && result.data.syncEvents) {
        syncEvents.value = result.data.syncEvents
        isConnected.value = true
        addDebugLog("success", `Loaded ${result.data.syncEvents.length} sync events from InstantDB`)
      } else {
        addDebugLog("info", "No sync events found in database yet")
        isConnected.value = true // Still connected, just no data
      }
    })

    addDebugLog("success", "InstantDB subscription active")
  } catch (error) {
    addDebugLog("error", `InstantDB connection failed: ${error}`)
    addDebugLog("info", "Falling back to mock data")
    isConnected.value = false
  }
})

onUnmounted(() => {
  if (unsubscribeRef.value) {
    unsubscribeRef.value()
  }
})

// Mock data for development/testing
function addMockData(): void {
  const mockEvents: SyncEvent[] = [
    {
      id: "1",
      timestamp: Date.now() - 1000,
      type: "write",
      detail: "User updated profile information",
    },
    {
      id: "2",
      timestamp: Date.now() - 5000,
      type: "conflict",
      detail: 'Concurrent edit on document "Project Plan"',
    },
    {
      id: "3",
      timestamp: Date.now() - 10000,
      type: "resolved",
      detail: "Merged changes from two clients successfully",
    },
    {
      id: "4",
      timestamp: Date.now() - 30000,
      type: "write",
      detail: "New task created in project board",
    },
  ]

  syncEvents.value = mockEvents
}
</script>

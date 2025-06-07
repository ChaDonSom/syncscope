import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"
import { init, id } from "@instantdb/admin"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize InstantDB Admin client
const db = init({
  appId: process.env.INSTANTDB_APP_ID,
  adminToken: process.env.INSTANTDB_ADMIN_TOKEN,
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: "10mb" }))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// API Key middleware (optional security layer)
const authenticateAPI = (req, res, next) => {
  const apiKey = req.headers["x-api-key"]

  if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Invalid API key" })
  }

  next()
}

// Routes

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "SyncScope Laravel Bridge",
  })
})

// Query data from InstantDB
app.post("/query", authenticateAPI, async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: "Query is required" })
    }

    const result = await db.query(query)
    res.json({ success: true, data: result })
  } catch (error) {
    console.error("Query error:", error)
    res.status(500).json({
      error: "Query failed",
      message: error.message,
    })
  }
})

// Transact (create/update/delete) data in InstantDB
app.post("/transact", authenticateAPI, async (req, res) => {
  try {
    const { operations } = req.body

    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({ error: "Operations array is required" })
    }

    // Convert operations to InstantDB transaction format
    const transactions = operations.map((op) => {
      const { table, action, data, recordId } = op

      switch (action) {
        case "update":
          return db.tx[table][recordId || id()].update(data)
        case "delete":
          if (!recordId) {
            throw new Error("Record ID is required for delete operations")
          }
          return db.tx[table][recordId].delete()
        default:
          throw new Error(`Unsupported action: ${action}`)
      }
    })

    const result = await db.transact(transactions)
    res.json({
      success: true,
      data: result,
      transactionId: result["tx-id"],
    })
  } catch (error) {
    console.error("Transaction error:", error)
    res.status(500).json({
      error: "Transaction failed",
      message: error.message,
    })
  }
})

// Authentication - Create token
app.post("/auth/create-token", authenticateAPI, async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    const token = await db.auth.createToken(email)
    res.json({ success: true, token })
  } catch (error) {
    console.error("Auth error:", error)
    res.status(500).json({
      error: "Token creation failed",
      message: error.message,
    })
  }
})

// Authentication - Sign out
app.post("/auth/sign-out", authenticateAPI, async (req, res) => {
  try {
    const { email, userId, refreshToken } = req.body

    let signOutParams = {}
    if (email) signOutParams.email = email
    if (userId) signOutParams.id = userId
    if (refreshToken) signOutParams.refresh_token = refreshToken

    if (Object.keys(signOutParams).length === 0) {
      return res.status(400).json({
        error: "Email, userId, or refreshToken is required",
      })
    }

    await db.auth.signOut(signOutParams)
    res.json({ success: true, message: "User signed out successfully" })
  } catch (error) {
    console.error("Sign out error:", error)
    res.status(500).json({
      error: "Sign out failed",
      message: error.message,
    })
  }
})

// Get presence data from rooms
app.post("/presence", authenticateAPI, async (req, res) => {
  try {
    const { namespace, room } = req.body

    if (!namespace || !room) {
      return res.status(400).json({
        error: "Namespace and room are required",
      })
    }

    const presenceData = await db.rooms.getPresence(namespace, room)
    res.json({ success: true, data: presenceData })
  } catch (error) {
    console.error("Presence error:", error)
    res.status(500).json({
      error: "Failed to get presence data",
      message: error.message,
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SyncScope Laravel Bridge running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 InstantDB App ID: ${process.env.INSTANTDB_APP_ID}`)
})

export default app

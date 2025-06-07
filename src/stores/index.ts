import { createPinia } from "pinia"
import { createORM } from "pinia-orm"
import SyncEventModel from "../models/SyncEventModel"

// Create pinia instance
export const pinia = createPinia()

// Install ORM plugin
pinia.use(createORM())

// Register models
import { useRepo } from "pinia-orm"
useRepo(SyncEventModel)

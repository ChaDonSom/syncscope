# Laravel InstantDB Integration

This directory contains a Node.js bridge service that allows Laravel applications to interface with InstantDB using the `@instantdb/admin` SDK.

## Architecture

```
Laravel App → HTTP API → Node.js Bridge Service → InstantDB Admin SDK → InstantDB
```

## Setup

1. **Install dependencies:**
   ```bash
   cd bridge-service
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your InstantDB credentials
   ```

3. **Start the bridge service:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
```http
GET /health
```

### Query Data
```http
POST /query
Content-Type: application/json

{
  "query": { "syncEvents": {} }
}
```

### Create/Update Data
```http
POST /transact
Content-Type: application/json

{
  "operations": [
    {
      "table": "syncEvents",
      "action": "update",
      "data": {
        "timestamp": 1625097600000,
        "type": "write",
        "detail": "Event from Laravel"
      }
    }
  ]
}
```

### Authentication
```http
POST /auth/create-token
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Laravel Integration

See `laravel-example/` directory for a complete Laravel service class that integrates with this bridge service.

# Project Documentation

## 1. Business Context
This project is a simple REST API for a tuk-tuk tracking system. It provides access to geographic and fleet-related data such as provinces, districts, stations, vehicles, and vehicle location pings.

The system helps stakeholders view the operational areas of tuk-tuks and track their recent movement history using ping data.

## 2. Assumptions and Clarifications
- Data is stored in a local JSON file named `seed.json` and loaded into memory at startup.
- The application does not use a database.
- Resource IDs in the data are represented as string values such as `P001`, `D001`, `S001`, `V001`.
- Route names follow REST-style conventions using lowercase nouns and hyphen-separated path segments.
- Pings are POSTed to a vehicle and stored in memory (not persisted to disk).
- Authentication via JWT (JSON Web Token) is required for all routes except `/auth/login`.

## 3. Tech Stack
- **Runtime**: Node.js
- **Framework**: Express 5.x
- **Port**: 3000

## 4. Data Model
The API works with the following resource types:

### Province
| Field | Type |
|---|---|
| `province_id` | string |
| `name` | string |

### District
| Field | Type |
|---|---|
| `district_id` | string |
| `name` | string |
| `province_id` | string |

### Station
| Field | Type |
|---|---|
| `station_id` | string |
| `name` | string |
| `district_id` | string |

### Vehicle
| Field | Type |
|---|---|
| `vehicle_id` | string |
| `registration_number` | string |
| `device_id` | string |
| `station_id` | string |

### Ping
| Field | Type |
|---|---|
| `ping_id` | string |
| `vehicle_id` | string |
| `latitude` | number |
| `longitude` | number |
| `speed` | number |
| `timestamp` | string (ISO 8601) |

## 5. Authentication

All routes (except `POST /auth/login`) require a valid JWT sent via the `Authorization` header.

### Login

`POST /auth/login` accepts `username` and `password` in the request body and returns a signed JWT.

| Credential | Value |
|---|---|
| username | `police` |
| password | `nibm2024` |

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Authenticated requests

Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

| Status | Condition |
|---|---|
| 401 | `Authorization` header is absent or does not start with `Bearer ` |
| 403 | Token is invalid or expired |

## 6. API Routes

### Provinces
| Method | Path | Description |
|---|---|---|
| GET | `/provinces` | Returns all provinces |
| GET | `/provinces/:id` | Returns a single province or `null` |

### Districts
| Method | Path | Description |
|---|---|---|
| GET | `/districts` | Returns all districts |
| GET | `/districts/:id` | Returns a single district or `null` |

### Stations
| Method | Path | Description |
|---|---|---|
| GET | `/stations` | Returns all stations |
| GET | `/stations/:id` | Returns a single station or `null` |

### Vehicles
| Method | Path | Description |
|---|---|---|
| GET | `/vehicles` | Returns all vehicles |
| GET | `/vehicles/:id` | Returns a vehicle with a `last_ping` field |
| GET | `/vehicles/:id/pings` | Returns all pings for a vehicle |
| POST | `/vehicles/:vehicleId/pings` | Creates a new ping for a vehicle |
| GET | `/vehicles/:id/last-position` | Returns the latest ping for a vehicle |

## 7. Write Endpoint Detail

### POST /vehicles/:vehicleId/pings
Creates a new location ping for a vehicle.

**Request headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request body:**
```json
{
  "latitude": 6.9271,
  "longitude": 79.8612,
  "speed": 25
}
```

**Validation order and status codes:**

| Status | Condition |
|---|---|
| 401 | `Authorization` header is absent or malformed |
| 403 | Token is invalid or expired |
| 404 | `:vehicleId` does not match any vehicle in the system |
| 400 | Body missing `latitude`, `longitude`, or `speed` |
| 201 | Ping created successfully |

**Successful response (201):**
Headers: `Location: /vehicles/:vehicleId/pings/:pingId`, `ETag: "<ping_id>"`, `Last-Modified: <timestamp>`

```json
{
  "ping_id": "PG0011",
  "vehicle_id": "V001",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "speed": 25,
  "timestamp": "2026-07-12T10:30:00.000Z"
}
```

## 8. ID Normalization

The `normalizeVehicleKeyId` function converts various ID formats (`V001`, `v-01`, `v001`, `V1`) to a canonical `v-NN` form:

```
normalizeVehicleKeyId("V001") → "v-01"
normalizeVehicleKeyId("V050") → "v-50"
```

This is used by `resolveVehicleId` to match vehicles across different ID formats.

## 9. Helper Functions

| Function | Purpose |
|---|---|
| `authenticateToken(req, res, next)` | JWT middleware — verifies `Authorization: Bearer <token>` |
| `normalizeVehicleKeyId(id)` | Converts vehicle ID to canonical `v-NN` format |
| `resolveVehicleId(id)` | Resolves various ID formats to the actual `vehicle_id` in data |
| `lastPing(vehicleId)` | Returns the most recent ping for a vehicle (sorted by timestamp descending) |

## 10. Implementation Order
1. Set up the Express server and mount the router.
2. Load `seed.json` into memory at startup.
3. Implement collection routes for provinces, districts, stations, and vehicles.
4. Implement member routes for each resource using path parameters.
5. Implement the vehicle ping read route.
6. Implement `POST /auth/login` and JWT middleware.
7. Implement the POST ping endpoint.
8. Test the API with sample requests using `curl` or a browser.

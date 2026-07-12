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
- Authentication via `X-API-Key` header is required for write operations.

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

Write endpoints require an `X-API-Key` header. Each vehicle has a unique API key derived from its ID.

Device key mapping (built at startup):
```
{ "v-01": "key_v01", "v-02": "key_v02", ..., "v-50": "key_v50" }
```

| Status | Condition |
|---|---|
| 401 | `X-API-Key` header is absent |
| 404 | Vehicle ID does not exist in the vehicles array (checked before key validation) |
| 403 | Provided key does not match the vehicle's expected key |

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
- `X-API-Key` (required) — the vehicle's device key
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
| 401 | `X-API-Key` header is absent |
| 404 | `:vehicleId` does not match any vehicle in the system |
| 403 | `X-API-Key` does not match `deviceKeys[vehicleId]` |
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

## 8. Device Key Generation

Keys are generated from vehicle IDs at server startup:

```
normalizeVehicleKeyId("V001") → "v-01" → deviceKey = "key_v01"
normalizeVehicleKeyId("V050") → "v-50" → deviceKey = "key_v50"
```

The normalization function accepts various input formats (`V001`, `v-01`, `v001`, `V1`) and converts them to a canonical `v-NN` form.

## 9. Helper Functions

| Function | Purpose |
|---|---|
| `normalizeVehicleKeyId(id)` | Converts vehicle ID to canonical `v-NN` format |
| `resolveVehicleId(id)` | Resolves various ID formats to the actual `vehicle_id` in data |
| `lastPing(vehicleId)` | Returns the most recent ping for a vehicle (sorted by timestamp descending) |

## 10. Implementation Order
1. Set up the Express server and mount the router.
2. Load `seed.json` into memory at startup.
3. Implement collection routes for provinces, districts, stations, and vehicles.
4. Implement member routes for each resource using path parameters.
5. Implement the vehicle ping read route.
6. Implement `deviceKeys` generation and the POST ping endpoint with auth.
7. Test the API with sample requests using `curl` or a browser.

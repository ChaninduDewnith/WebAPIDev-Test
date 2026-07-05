# Project Documentation

## 1. Business Context
This project is a simple REST API for managing and retrieving geographic and vehicle-related data. It is designed to expose read-only endpoints for provinces, districts, stations, vehicles, and vehicle pings using sample data from a local JSON file.

The API is intended for learning and demonstration purposes, showing how a basic Express.js application can serve structured data without a database or authentication layer.

## 2. Assumptions and Clarifications
- The API is read-only and does not support create, update, or delete operations.
- Data is stored in a local JSON file named seed.json.
- The application does not use a database.
- No authentication or authorization is required.
- Resource IDs in the data are represented as string values such as P001, D001, S001, and V001.
- Route names follow simple REST-style conventions using lowercase nouns and hyphen-separated path segments where appropriate.

## 3. Data Model
The API works with the following resource types:

### Province
- province_id: string
- name: string

### District
- district_id: string
- name: string
- province_id: string

### Station
- station_id: string
- name: string
- district_id: string

### Vehicle
- vehicle_id: string
- registration_number: string
- device_id: string
- station_id: string

### Ping
- ping_id: string
- vehicle_id: string
- latitude: number
- longitude: number
- timestamp: string

## 4. API Routes
### Provinces
- GET /provinces
- GET /provinces/:provinceId

### Districts
- GET /districts
- GET /districts/:districtId

### Stations
- GET /stations
- GET /stations/:stationId

### Vehicles
- GET /vehicles
- GET /vehicles/:vehicleId
- GET /vehicles/:vehicleId/pings

## 5. Request and Response Representations
### GET /provinces
Response: an array of province objects.

Example response:
```json
[
  {
    "province_id": "P001",
    "name": "Western"
  }
]
```

### GET /provinces/:provinceId
Response: a single province object or null if not found.

### GET /vehicles/:vehicleId
Response: a single vehicle object plus a last_ping field containing the latest ping for that vehicle.

Example response:
```json
{
  "vehicle_id": "V001",
  "registration_number": "ABC-1001",
  "device_id": "DEV001",
  "station_id": "S001",
  "last_ping": {
    "ping_id": "PG0007",
    "vehicle_id": "V001",
    "latitude": 8.702673,
    "longitude": 79.784365,
    "timestamp": "2026-06-30T08:00:00Z"
  }
}
```

### GET /vehicles/:vehicleId/pings
Response: an array of ping objects belonging to the requested vehicle.

## 6. Implementation Order
1. Set up the Express server and mount the router.
2. Load seed.json into memory at startup.
3. Implement collection routes for provinces, districts, stations, and vehicles.
4. Implement member routes for each resource using path parameters.
5. Implement the vehicle ping route.
6. Test the API with sample requests using curl or a browser.

## 7. Notes
This project focuses on the basics of routing, JSON response handling, and reading from a static data source. It is ideal for beginners learning API design and Express.js.

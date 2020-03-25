[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# HEIOT

HEIOT is an IoT platform to manage IoT devices and their delivered data.
The user can overlook all devices in lists grouped by the actual condition distinguishing between the need of the platform's manager to take further actions. The user is enabled to create tags and masterdata by her-/himself in order to group the devices semantically.
Moreover, there is a detailed view of each device where all data is displayed and visualized by interactive charts and tables.
The platform also includes an analytical service to detect anomalies in the device's data.

HEIOT was a project ("ISE project") implemented by a group of students from the University of Heidelberg.

## Setting up HEIOT

### Deploying the platform

To deploy HEIOT please follow instructions from <https://github.com/HEIOT/ise_2019_deployment>

### Starting the platform locally

1. [Set up docker based development environment](https://github.com/HEIOT/ise_2019_dev_infra)
2. Start application

   ```bash
   npm run docker-up
   ```

3. In your browser go to http://ise.local/

## Tooling

For a smooth developing experience, it is recommended to use VS Code. Install the following VS Code plugins for code formatting and linting:

- Prettier (by Esben Petersen)
- TSLint (by Microsoft)
- Vetur (by Pine Wu)

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run lint`: Run ESLint
- `npm run docker-build` Build necessary images for development
- `npm run docker-up`: Bring up application
- `npm run docker-test`: Run backend test in docker compose
- `npm run docker-attach`: Attach to running backend container
- `npm run docker-down`: Shutdown dev docker-compose setup

## Run tests with docker while enforcing the pre-build of the image if required

- see ise_2019_dev_infra for details

## Run tests locally without docker

- `npm run test`
  To run the test locally you need to have the server infrastructure running separately (e.g. NATS, Redis, DB, ...)

## Setup backend infrastructure

### Use the infrastructure hosted by incontext.technology GmbH

- contact incontex.technology to get access

### Alternatively, install infrastructure on localhost

The Moleculer framework requires the NATS infrastructure as a transporter:

- Install NATS with [NATS Installation](https://nats-io.github.io/docs/nats_server/installation.html)
- Starts NATS with `nats-server`

If also required (essentially for caching), install and start a local Redis server:

- Linux: see https://redis.io/topics/quickstart
- MacOS: use Homebrew with `brew install redis`

### Setup database

- Install PostgreSQL database locally (https://www.postgresql.org/download/)
- copy the .env-default and name it .env
- fill the empty spots in the .env file: DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT
- if you want another db-name you can change the DB_NAME field
- run "npm run db:dev:up" to start the dev environment (or db:test:up or db:prod:up)

## Usage of the platform

How to use the UI please check (https://github.com/HEIOT/ise_2019_frontend)

## Usage of the API

#### UpdateDevice

update name, device id, tags and master data of a device

- URL: /api/devicemanagement/updateDevice
- Method: POST
- Required URL Params:
  - id=[string]
  - name=[string]
  - device_id=[string]
- Optional URL Params:
  - master_data=[Object]
  - tags=[Array String]
- Success Code: 200
- Error:
  - Code: 404 Not found
  - Content: { error : "The device does not exists!" }

Example:

```typescript
axios.post("/api/devicemanagement/updateDevice", {
{
    "name": "Alexarr",
    "device_id": 9876543210,
    "id": 77,
    "master_data":
        { "location": "Schriesheim", "color": "red", "temperature": "3000"},
    "tags": [
        "abc",
        "def"
        ]
}
})
```

#### Register Device

create name, device id, tags and master data of a device

- URL: /api/devicemanagement/registerDevice
- Method: POST
- Required URL Params
  - name=[string]
  - device_id=[string]
- Optional URL Params
  - master_data=[Object]
  - tags=[Array String]
- Success Code: 200
- Error
  - Code: 422 INVALID PARMETERS
  - Content: { error : "The device name and device ID must not be empty!" }

Example:

```typescript
axios.post("/api/devicemanagement/registerDevice", {
{
"name": "Alexarr",
"device_id": 9876543210,
"master_data":{
        "location": "Schriesheim", "color": "red", "temperature": "3000"},
"tags": [
        "abc",
        "def"]
})
```

#### Delete Device

delete device by its id

- URL: /api/devicemanagement/deleteDevice
- Method: POST
- Required URL Params
  - id=[string]
- Success Code: 200
- Error Code: 422 INVALID PARMETERS

Example:

```typescript
axios.post("/api/devicemanagement/deleteDevice", {
  id: "123"
});
```

#### CreateTag

creates a new tag with a name

- URL: /api/devicemanagement/createTag
- Method: POST
- Required URL Params:
  - tag=[string]
- Success Code: 200
- Error Code: 422 INVALID PARMETERS

Example:

```typescript
axios.post("/api/devicemanagement/createTag", {
  tag: "temperature"
});
```

#### DeleteTag

delete tag by its name

- URL: /api/devicemanagement/deleteTag
- Method: POST
- Required URL Params:
  - tag=[string]
- Success Code: 200
- Error Code: 422 INVALID PARMETERS

Example:

```typescript
axios.post("/api/devicemanagement/deleteTag", {
  tag: "temperature"
});
```

#### GetDevice

get a device by its id

- URL: /api/devicemanagement/getDevice
- Method: GET
- Required URL Params:
  - id=[string]
- Success Code: 200
- Error Code: 422 INVALID PARMETERS

Example:

```typescript
axios.post("/api/devicemanagement/getDevice", {
  id: "1"
});
```

#### GetAllDevices

get all devices

- URL: /api/devicemanagement/getAllDevices
- Method: GET
- Success Code: 200
- Error Code: 500

Example:

```typescript
axios.get("/api/devicemanagement/getAllDevices");
```

#### GetTags

get all tags

- URL: /api/devicemanagement/getTags
- Method: GET
- Success Code: 200
- Error Code: 500

Example:

```typescript
axios.get("/api/devicemanagement/getTags");
```

#### GetCategories

get all categories

- URL: /api/devicemanagement/getCategories
- Method: GET
- Success Code: 200
- Error Code: 500

Example:

```typescript
axios.get("/api/devicemanagement/getCategories");
```

#### CreateCategory

create a category by its name

- URL: /api/devicemanagement/createCategory
- Method: POST
- Required URL Params:
  - category=[string]
- Success Code: 200
- Error
  - Code: 422 INVALID PARMETERS
  - Content: { error : "This category already exists!" }

Example:

```typescript
axios.post("/api/devicemanagement/createCategory", {
  category: color
});
```

#### ModifyCategory

modify/rename an existing category

- URL: /api/devicemanagement/modifyCategory
- Method: POST
- Required URL Params:
  - oldCategory=[string]
  - category=[string]
- Success Code: 200
- Error Code: 422 INVALID PARMETERS

Example:

```typescript
axios.post("/api/devicemanagement/modifyCategory", {
  oldCategory: oldMasterDataCategory,
  category: newMasterDataCategory
});
```

#### DeleteCategory

deletes category with given id

- URL: /api/devicemanagement/deleteCategory
- Method: POST
- Required URL Params:
  - category=[string]
- Data Params:
  - { "category": "temperature" }
- Success Response:
  - Code: 200
  - Error Response:
- Error
  - Code: 422 ERR_SOMETHING
  - Content: { error : "You can not delte this category!" }
    OR
  - Code: 422 ERR_SOMETHING
  - Content: { error : "The category must not be empty!" }

Example:

```typescript
axios.post(urls.masterDataManagement.deleteCategory, {
  category: masterdataCategory
});
```

#### ChangeState

change state of an existing device

- URL: /api/devicemanagement/changestate
- Method: POST
- Required URL Params:
  - id=[string]
  - state=[string]
- Success Code: 200
- Error Code: 422 INVALID PARMETERS

Example:

```typescript
axios.post("/api/devicemanagement/changeState", {
  id: "10",
  state: "warning"
});
```

#### GetDataForDeviceWithTimeRange

get DeviceData from start to endDate

- URL: /api/devicemanagement/getDataForDeviceWithTimeRange
- Method: GET
- Required URL Params:
  - startDate=[string]
  - endDate=[string]
  - id=[string]
- Success Code: 200
- Error Code: 422 INVALID PARMETERS

Example:

```typescript
const startDate = "2019-12-15T11:00:00.000Z";
const endDate = "2019-12-15T12:00:00.000Z";

axios.post("/api/devicemanagement/getDataForDeviceWithTimeRange", {
  id: 1,
  startDate: oldMasterDataCategory,
  endDate: newMasterDataCategory
});
```

#### GetLatestDataForDevice

get latest Data for an existing device

- URL: /api/devicemanagement/getLatestDataForDevice
- Method: GET
- Required URL Params:
  - id=[string]
- Success Code: 200
- Error Code: 422 INVALID PARMETERS

Example:

```typescript
axios.post("/api/devicemanagement/getLatestDataForDevice", {
  id: 1
});
```

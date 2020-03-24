[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# service-nodejs-template

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

## Use the infrastructure hosted by incontext.technology GmbH

- contact incontex.technology to get access

## Alternatively, install infrastructure on localhost

The Moleculer framework requires the NATS infrastructure as a transporter:

- Install NATS with [NATS Installation](https://nats-io.github.io/docs/nats_server/installation.html)
- Starts NATS with `nats-server`

If also required (essentially for caching), install and start a local Redis server:

- Linux: see https://redis.io/topics/quickstart
- MacOS: use Homebrew with `brew install redis`

## Setup database

- Install PostgreSQL database locally (https://www.postgresql.org/download/)
- copy the .env-default and name it .env
- fill the empty spots in the .env file: DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT
- if you want another db-name you can change the DB_NAME field
- run "npm run db:dev:up" to start the dev environment (or db:test:up or db:prod:up)

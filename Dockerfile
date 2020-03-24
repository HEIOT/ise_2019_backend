FROM node:12-alpine as base
RUN apk add postgresql-client bash
# always use a subfolder
# https://stackoverflow.com/questions/47382957/docker-build-image-glob-error-error-eperm-operation-not-permitted-scandir
RUN mkdir /app
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

FROM base as dev
CMD ["sh", "-c", "npm run db:dev:up && npm run dev"]

FROM base as builder
COPY ./ ./
RUN npm run build

FROM node:12-alpine AS prod
RUN apk add postgresql-client bash
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/
COPY --from=builder /app/config /app/config
COPY --from=builder /app/knexfile.js /app/knexfile.js
COPY setup-db.sh /app/
ENV NODE_ENV=prod
CMD ["npm", "start"]

FROM builder as test
ENV NODE_ENV=test
CMD ["sh", "-c", "npm run db:dev:up && npm run dev"]



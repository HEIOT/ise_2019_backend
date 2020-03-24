import { config } from "dotenv";
config();

export = {
  NODE_ENV: "",
  port: 7002,
  version: "docker_supplied_no_version",

  jwt: {
    secret: "secret"
  },

  db: {
    user: process.env.DB_USERNAME,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    url: ""
  },

  transporter: process.env.TRANSPORTER
};

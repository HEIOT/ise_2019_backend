"use strict";
import { BrokerOptions } from "moleculer";

/**
 * Moleculer ServiceBroker configuration file
 *
 * More info about options: https://moleculer.services/docs/0.13/broker.html#Broker-options
 *
 * Overwrite options in production:
 * ================================
 * 	You can overwrite any option with environment variables.
 * 	For example to overwrite the "logLevel", use `LOGLEVEL=warn` env var.
 * 	To overwrite a nested parameter, e.g. retryPolicy.retries, use `RETRYPOLICY_RETRIES=10` env var.
 *
 * 	To overwrite broker’s deeply nested default options, which are not presented in "moleculer.config.ts",
 * 	via environment variables, use the `MOL_` prefix and double underscore `__` for nested properties in .env file.
 * 	For example, to set the cacher prefix to `MYCACHE`, you should declare an env var as `MOL_CACHER__OPTIONS__PREFIX=MYCACHE`.
 */
const brokerConfig: BrokerOptions = {

  // Enable/disable logging or use custom logger. More info: https://moleculer.services/docs/0.13/logging.html
  logger: true,
  logLevel: "debug",
  logFormatter: "default",
  logObjectPrinter: undefined,
  // {{#needTransporter}}

  // Define transporter.
  // More info: https://moleculer.services/docs/0.13/networking.html
  transporter: process.env.TRANSPORTER,
  // {{/needTransporter}}
  // {{#needCacher}}

  serializer: "JSON",

  // Limit of calling level. If it reaches the limit,
  // broker will throw an MaxCallLevelError error. (Infinite loop protection)
  maxCallLevel: 100,

  // Number of seconds to send heartbeat packet to other nodes.
  heartbeatInterval: 5,
  // Number of seconds to wait before setting node to unavailable status.
  heartbeatTimeout: 15,

  // Tracking requests and waiting for running requests before shutdowning.
  // More info: https://moleculer.services/docs/0.13/fault-tolerance.html
  tracking: {
    // Enable feature
    enabled: false,
    // Number of milliseconds to wait before shutdowning the process
    shutdownTimeout: 5000
  },

  // Disable built-in request & emit balancer. (Transporter must support it, as well.)
  disableBalancer: false,

  // Settings of Service Registry. More info: https://moleculer.services/docs/0.13/registry.html
  registry: {
    // Define balancing strategy.
    // Available values: "RoundRobin", "Random", "CpuUsage", "Latency"
    strategy: "RoundRobin",
    // Enable local action call preferring.
    preferLocal: true
  },

  // Settings of bulkhead feature.
  // More info: https://moleculer.services/docs/0.13/fault-tolerance.html#Bulkhead
  bulkhead: {
    // Enable feature.
    enabled: false,
    // Maximum concurrent executions.
    concurrency: 10,
    // Maximum size of queue
    maxQueueSize: 100
  },

  // Enable parameters validation. More info: https://moleculer.services/docs/0.13/validating.html
  validation: true,
  // Custom Validator class for validation.
  validator: undefined,

  // Enable metrics function. More info: https://moleculer.services/docs/0.13/metrics.html
  metrics: true,
  // Rate of metrics calls. 1 means to measure every request, 0 means to measure nothing.
  metricsRate: 1,

  // Register internal services ("$node").
  // More info: https://moleculer.services/docs/0.13/services.html#Internal-services
  internalServices: true,
  // Register internal middlewares.
  // More info: https://moleculer.services/docs/0.13/middlewares.html#Internal-middlewares
  internalMiddlewares: true,

  // Watch the loaded services and hot reload if they changed.
  // You can also enable it in Moleculer Runner with `--hot` argument
  hotReload: false,

  // Register custom middlewares
  middlewares: [],

  // Called after broker created.
  created(broker): any {},

  // Called after broker starte.
  started(broker): any {},

  // Called after broker stopped.
  stopped(broker): any {},

  // Register custom REPL commands.
  replCommands: undefined
};

export = brokerConfig;

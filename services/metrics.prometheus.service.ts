
const promService = require("moleculer-prometheus");

import { ServiceSchema } from "moleculer";


const prometheusService: ServiceSchema = {
    name: "prometheus",
    mixins: [promService],
    settings: {
        port: 3030,
        collectDefaultMetrics: true,
        timeout: 5 * 1000,
    }
};

export = prometheusService;
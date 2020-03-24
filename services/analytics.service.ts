import { ServiceSchema } from "moleculer";
import {
  ISensorData,
  ISensorValue,
  ISensorValueSimple,
  ISpike,
  IAnomaly,
  IThresholdDevice
} from "../typings/typings";
import { getSpikes } from "../utils/analytical-methods";
import * as anomalyConf from "../config/anomaly/anomaly-config.json";

let dropoutList: string[] = [];
let dropoutDetectionInterval: NodeJS.Timeout;

const environment = process.env.NODE_ENV || "dev";

const config = require("../knexfile")[environment];
const knex = require("knex")(config);

// initialize Error Handling
const { MoleculerError } = require("moleculer").Errors;

let deviceData: any = {};

const analyticsService: ServiceSchema = {
  name: "analytics",

  /**
   * Service settings
   */
  settings: {},

  /**
   * Service dependencies
   */
  dependencies: ["devicemanagement"],

  /**
   * Actions
   */
  actions: {
    async updateDeviceData(ctx): Promise<any> {
      const inputJson: ISensorData = ctx.params as ISensorData;
      // update current device data with incoming new values

      const deviceIds = Object.keys(deviceData);
      const isNewDevice = !deviceIds.includes(inputJson.deviceId);
      if (isNewDevice) {
        deviceData = {
          ...deviceData,
          [inputJson.deviceId]: {}
        };
      }
      inputJson.sensors.forEach((sensorData: ISensorValue) => {
        const isNewAttribute = !Object.keys(
          deviceData[inputJson.deviceId]
        ).includes(sensorData.name);
        if (isNewAttribute) {
          deviceData = {
            ...deviceData,
            [inputJson.deviceId]: {
              ...deviceData[inputJson.deviceId],
              [sensorData.name]: []
            }
          };
        }
        deviceData = {
          ...deviceData,
          [inputJson.deviceId]: {
            ...deviceData[inputJson.deviceId],
            [sensorData.name]: [
              ...deviceData[inputJson.deviceId][sensorData.name],
              { value: sensorData.value, timestamp: sensorData.date.v }
            ].slice(-500) // limit sensor data to the latest 500 entries
          }
        };
      });
      // trigger anomaly detection methods below, after update

      // Spike detection
      const spikes: ISpike[] = (this as any).detectSpikes();
      console.log("found spikes: ", spikes.length);
      spikes.forEach(async (spike: ISpike) => {
        const anomaly: IAnomaly = {
          device_id: parseInt(spike.id, 10),
          attribute: spike.attribute,
          type: "spike",
          timestamp: spike.timestamp
        };
        console.log("about to store spike as anomaly: ", anomaly);
        const anomalyId: string = await (this as any).storeAnomaly(anomaly);
        await (this as any).changeDeviceState(
          ctx,
          spike.id,
          "warning",
          anomalyId
        );
      });

      // Dropout detection
      // Filter out device from dropout list if it was updated
      dropoutList = dropoutList.filter(
        (id: string) => id !== inputJson.deviceId
      );

      // Threshold detection
      const thresholds: IThresholdDevice[] = (this as any).detectThreshold(
        inputJson,
        anomalyConf.threshold
      );
      console.log("found thresholds: ", thresholds.length);
      thresholds.forEach(async (threshold: IThresholdDevice) => {
        console.log("threshold: ", JSON.stringify(threshold));
        const anomaly: IAnomaly = {
          device_id: threshold.device_id,
          attribute: threshold.attribute,
          type: "threshold",
          timestamp: threshold.timestamp
        };
        console.log("about to store threshold as anomaly");
        const anomalyId: string = await (this as any).storeAnomaly(anomaly);
        await (this as any).changeDeviceState(
          ctx,
          threshold.device_id,
          threshold.state,
          anomalyId
        );
      });
    },
    getDeviceData(): any {
      return deviceData;
    },
    async getAllAnomalies(ctx): Promise<IAnomaly[]> {
      const anomalyData: IAnomaly[] = await knex("anomaly").select(
        "device_id",
        "attribute",
        "type",
        "timestamp"
      );

      return anomalyData;
    },

    async getAnomaliesByDeviceId(ctx): Promise<IAnomaly[]> {
      const anomalyData: IAnomaly[] = await knex("anomaly")
        .where("device_id", ctx.params.device_id)
        .select("device_id", "attribute", "type", "timestamp");

      return anomalyData;
    },
    async storeAnomaly(ctx): Promise<void> {
      await (this as any).storeAnomaly(ctx.params);
    },
    getDropoutList(): string[] {
      return dropoutList;
    },
    async bootstrapDropoutDetection(ctx): Promise<void> {
      (this as any).bootstrapDropoutDetection(ctx, ctx.params);
    }
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {
    detectSpikes(): ISpike[] {
      const deviceIds = Object.keys(deviceData);
      let allSpikes: ISpike[] = [];
      deviceIds.forEach((id: string) => {
        const attributes = Object.keys(deviceData[id]);
        attributes.forEach((attr: string) => {
          const values: ISensorValueSimple[] = deviceData[id][attr];
          allSpikes = [
            ...allSpikes,
            ...getSpikes(
              values,
              anomalyConf.spikeDetection.lag, // lag of the moving average window
              anomalyConf.spikeDetection.threshold, // the maximum number of standard deviations a datapoint can be away from some moving mean (z-score)
              anomalyConf.spikeDetection.influence, // the influence (between 0 and 1) of new signals on the mean and standard deviation
              id,
              attr
            )
          ];
        });
      });
      return allSpikes;
    },
    async changeDeviceState(
      ctx,
      id: string,
      state: "urgent" | "warning",
      anomalyId: string
    ): Promise<void> {
      const stateValues: any = {
        info: 3,
        urgent: 2,
        warning: 1,
        ok: 0
      };
      const currentState = (await ctx.call(
        "devicemanagement.getLatestStateOfDevice",
        { id }
      ))[0].state;
      if (stateValues[state] >= stateValues[currentState]) {
        console.log("device state is about to change", anomalyId);
        console.log("device state:", state);
        await ctx.call("devicemanagement.changeState", {
          id,
          state,
          anomaly_id: anomalyId
        });
      }
    },
    storeAnomaly(anomaly: IAnomaly): Promise<string> {
      return knex("anomaly")
        .insert(anomaly, ["anomaly_id"])
        .then((anomalyId: any[]) => anomalyId[0].anomaly_id)
        .catch((e: any) => {
          throw new MoleculerError("Storing failed", 422, "ERR_SOMETHING", {});
        });
    },
    async bootstrapDropoutDetection(ctx, interval: number): Promise<void> {
      if (dropoutDetectionInterval) {
        clearInterval(dropoutDetectionInterval);
      }

      dropoutList = await ctx.call("devicemanagement.getAllDeviceIds");

      dropoutDetectionInterval = setInterval(async () => {
        const dropouts = dropoutList;
        dropouts.forEach(async (dropout: string) => {
          const anomaly: IAnomaly = {
            device_id: parseInt(dropout, 10),
            attribute: "",
            type: "dropout",
            timestamp: Math.floor(Date.now() / 1000)
          };
          const anomalyId: string = await (this as any).storeAnomaly(anomaly);
          await (this as any).changeDeviceState(
            ctx,
            anomaly.device_id,
            "urgent",
            anomalyId
          );
        });
        dropoutList = await ctx.call("devicemanagement.getAllDeviceIds");
      }, interval);
    },
    detectThreshold(
      data: ISensorData,
      thresholdObj: { urgent: any; warning: any }
    ): IThresholdDevice[] {
      const tempData = data;
      const thresholds: IThresholdDevice[] = [];
      tempData.sensors.forEach((attr: ISensorValue) => {
        const isUrgent = thresholdObj.urgent[attr.name]
          ? attr.value >= thresholdObj.urgent[attr.name]
          : false;
        const isWarning = thresholdObj.warning[attr.name]
          ? attr.value >= thresholdObj.warning[attr.name]
          : false;
        const metaData: any = {
          device_id: parseInt(tempData.deviceId, 10),
          attribute: attr.name,
          timestamp: tempData.date.v
        };
        if (isUrgent) {
          const threshold: IThresholdDevice = {
            ...metaData,
            state: "urgent"
          };
          thresholds.push(threshold);
        } else if (isWarning) {
          const threshold: IThresholdDevice = {
            ...metaData,
            state: "warning"
          };
          thresholds.push(threshold);
        }
      });
      return thresholds;
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created(): Promise<void> {
    return Promise.resolve();
  },

  /**
   * Service started lifecycle event handler
   */
  async started(): Promise<void> {
    // bootstrap dropout detection
    (this as any).bootstrapDropoutDetection(
      this.broker,
      anomalyConf.dropoutDetection.interval
    );
  },

  /**
   * Service stopped lifecycle event handler
   */
  stopped(): Promise<void> {
    return Promise.resolve();
  }
};

export = analyticsService;

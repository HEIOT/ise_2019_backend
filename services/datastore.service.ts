import { IData, IDataFlat } from "../typings/typings";

import { ServiceSchema } from "moleculer";
const environment = process.env.NODE_ENV || "dev";
const config = require("../knexfile")[environment];
const knex = require("knex")(config);

const standardLatestDataLimit = 10;

const datastoreService: ServiceSchema = {
  name: "datastore",

  /**
   * Service settings
   */
  settings: {},

  /**
   * Service dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    async getValuesForDevice(ctx): Promise<IData[]> {
      /**
       * This function returns an ordered list of IData[]-elements which consists out of
       * a single value type from a single device. The necessary parameters are:
       * device_id
       * device_data_value_name
       * limit: how many elements are part of the list
       * offset: the offset for the amount parameter
       */

      const limit = ctx.params.limit || 100;
      const offset = ctx.params.offset || 0;

      const flatData: IDataFlat[] = await knex("device_data")
        .join(...(this as any).getDataJoin())
        .select((this as any).getDataSelect())
        .where({
          "device_data.device_id": ctx.params.device_id,
          "device_data_value.name": ctx.params.device_data_value_name
        })
        .orderBy("date", "desc")
        .limit(limit)
        .offset(offset);
      return (this as any).mergeDataForOneDevice(flatData);
    },

    async getDataForDeviceWithTimeRange(ctx): Promise<IData[]> {
      const flatData: IDataFlat[] = await knex("device_data")
        .join(...(this as any).getDataJoin())
        .select((this as any).getDataSelect())
        .where("device_data.device_id", ctx.params.device_id)
        .whereBetween("device_data.date", [
          ctx.params.startDate,
          ctx.params.endDate
        ]);

      return (this as any).mergeDataForOneDevice(flatData);
    },

    async getLatestDataForDevice(ctx): Promise<any[]> {
      const limit = ctx.params.limit || standardLatestDataLimit;
      const dates: any[] = await knex("device_data")
        .select("date")
        .where("device_id", ctx.params.device_id)
        .orderBy("date", "desc")
        .limit(limit);

      const mappedDates = dates.map(({ date }) => date);

      const flatData: IDataFlat[] = await knex("device_data")
        .join(...(this as any).getDataJoin())
        .select((this as any).getDataSelect())
        .where("device_data.device_id", ctx.params.device_id)
        .whereIn("device_data.date", mappedDates);

      return (this as any).mergeDataForOneDevice(flatData);
    }
  },

  /**
   * Events
   */
  events: {
    "device.DATA_INSERTED": {
      async handler(ctx): Promise<void> {
        try {
          const results: any[] = await knex("device_data").insert(
            {
              device_id: ctx.params.deviceId,
              date: ctx.params.date.s
            },
            ["id"]
          );
          const createdId: string = results[0].id;

          await knex("device_data_value").insert(
            ctx.params.sensors.map((sensor: any) => ({
              data_id: createdId,
              name: sensor.name,
              type: sensor.type,
              value: sensor.value
            }))
          );

          ctx.call("analytics.updateDeviceData", { ...ctx.params });
        } catch (e) {
          return;
        }
      }
    }
  },

  /**
   * Methods
   */
  methods: {
    getDataJoin(): string[] {
      return [
        "device_data_value",
        "device_data.id",
        "=",
        "device_data_value.data_id"
      ];
    },
    getDataSelect(): object {
      return {
        device_id: "device_data.device_id",
        date: "device_data.date",
        value_name: "device_data_value.name",
        value_type: "device_data_value.type",
        value: "device_data_value.value"
      };
    },
    mergeDataForOneDevice(allData: IDataFlat[]): IData[] {
      const mergedDataObject = allData.reduce((acc: any, data: IDataFlat) => {
        if (!acc[data.date]) {
          // tslint:disable-next-line: no-object-mutation
          acc[data.date] = {
            deviceId: data.device_id,
            date: data.date,
            data: []
          };
        }
        acc[data.date].data.push({
          name: data.value_name,
          type: data.value_type,
          value: data.value
        });
        return acc;
      }, {});
      const retval: IData[] = [];
      for (const data in mergedDataObject) {
        if (mergedDataObject.hasOwnProperty(data)) {
          retval.push(mergedDataObject[data]);
        }
      }
      return retval;
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
  started(): Promise<void> {
    return Promise.resolve();
  },

  /**
   * Service stopped lifecycle event handler
   */
  stopped(): Promise<void> {
    return Promise.resolve();
  }
};

export = datastoreService;

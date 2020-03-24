import {
  IAnomaly,
  ITag,
  IDeviceTag,
  IMasterData,
  IId,
  IDevice,
  IHistoricalState
  // IDeviceIncontext
} from "../typings/typings";
import { ServiceSchema } from "moleculer";

// load appropriate config depending on environment
const environment = process.env.NODE_ENV || "dev";

// initialize knex instance
const config = require("../knexfile")[environment];
const knex = require("knex")(config);

// initialize Error Handling
const { MoleculerError } = require("moleculer").Errors;

const deviceManagementService: ServiceSchema = {
  name: "devicemanagement",

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
    async addTags(ctx): Promise<void> {
      // build an array for the subsequent insertion of device id and tag ids into table DeviceTag

      if (ctx.params.tags && ctx.params.tags.length) {
        const knexTagArray: IDeviceTag[] = [];
        for (const tag of ctx.params.tags) {
          const knexTagJson: IDeviceTag = {
            device_id: ctx.params.id,
            tag_id: tag
          };
          knexTagArray.push(knexTagJson);
        }
        // insert device id and tag ids into table DeviceTag
        await knex("device_tag").insert(knexTagArray);
      }
    },

    async addMasterData(ctx): Promise<void> {
      // initialize arrays for the MasterData insertions
      if (ctx.params.master_data) {
        const knexMasterDataArray: IMasterData[] = ctx.params.master_data.map(
          (entry: { category_id: any; value: any }) =>
            ({
              device_id: ctx.params.id,
              category_id: entry.category_id,
              value: entry.value
            } as IMasterData)
        );

        // insert device ids, category ids and values into table MasterData
        await knex("master_data").insert(knexMasterDataArray);
      }
    },

    async registerDevice(ctx): Promise<void> {
      // insert device name and device id into table Device and extract assigned id
      if (ctx.params.name && ctx.params.device_id) {
        const id: string = (await knex("device").insert(
          {
            name: ctx.params.name,
            device_id: ctx.params.device_id
          },
          ["id"]
        ))[0].id;

        // add tags to device
        ctx.call("devicemanagement.addTags", {
          id,
          tags: ctx.params.tags
        });

        // add master data to device and extract master data ids
        ctx.call("devicemanagement.addMasterData", {
          id,
          master_data: ctx.params.master_data
        });

        ctx.call("devicemanagement.changeState", {
          id,
          state: "ok"
        });

        // registering device at instance of incontext
        // ctx.call("device.register", {
        //   businessId: ctx.params.device_id,
        //   deviceId: ctx.params.device_id
        // } as IDeviceIncontext);
      } else {
        throw new MoleculerError(
          "The device name and device ID must not be empty!",
          422,
          "ERR_SOMETHING",
          {}
        );
      }
    },

    async deleteDevice(ctx): Promise<void> {
      if (ctx.params.id) {
        const id = ctx.params.id;

        // const deviceId = await knex("device")
        await knex("device")
          .where("id", id)
          .select("device_id");

        await knex("device_tag")
          .where("device_id", id)
          .del();

        await knex("master_data")
          .where("device_id", id)
          .del();

        await knex("device")
          .where("id", id)
          .del();

        // await ctx.call("device.delete", {
        //   businessId: deviceId[0].device_id
        // });
      } else {
        throw new MoleculerError(
          "The device does not exist!",
          404,
          "ERR_SOMETHING",
          {}
        );
      }
    },

    async updateDevice(ctx): Promise<void> {
      if (ctx.params.id) {
        await knex("device_tag")
          .where("device_id", ctx.params.id)
          .del();

        await knex("master_data")
          .where("device_id", ctx.params.id)
          .del();

        const tagArray: string[] = ctx.params.tags;

        const addTags: IDeviceTag[] = tagArray.map(
          tag =>
            ({
              device_id: ctx.params.id,
              tag_id: tag
            } as IDeviceTag)
        );

        const addMasterData: IMasterData[] = ctx.params.master_data.map(
          (entry: { category_id: any; value: any }) =>
            ({
              device_id: ctx.params.id,
              category_id: entry.category_id,
              value: entry.value
            } as IMasterData)
        );

        await knex("device_tag").insert(addTags);

        await knex("master_data").insert(addMasterData);

        const updateDeviceData: IDevice = {
          name: ctx.params.name,
          device_id: ctx.params.device_id
        };

        const updateId: IId = {
          id: ctx.params.id
        };

        await knex("device")
          .where(updateId)
          .update(updateDeviceData);
      } else {
        throw new MoleculerError(
          "The device does not exist!",
          404,
          "ERR_SOMETHING",
          {}
        );
      }
    },

    async createTag(ctx): Promise<void> {
      const knexTag: ITag = {
        name: ctx.params.tag
      };
      try {
        await knex("tag").insert(knexTag);
      } catch (e) {
        if (e.code === "23505") {
          throw new MoleculerError(
            "This tag already exists!",
            500,
            "ERR_SOMETHING",
            {}
          );
        }
        if (e.code === "23502") {
          throw new MoleculerError(
            "This tag must not be empty!",
            422,
            "ERR_SOMETHING",
            {}
          );
        }
      }
    },

    async deleteTag(ctx): Promise<void> {
      if (ctx.params.tag) {
        try {
          await knex("tag")
            .where("name", ctx.params.tag)
            .del();
        } catch (e) {
          throw new MoleculerError(
            "You can not delete this tag!",
            422,
            "ERR_SOMETHING",
            {}
          );
        }
      } else {
        throw new MoleculerError(
          "The tag that you want to delete must not be empty!",
          422,
          "ERR_SOMETHING",
          {}
        );
      }
    },

    async getDevice(ctx): Promise<any> {
      const deviceDefaultData = await knex("device")
        .where("device.id", ctx.params.id)
        .select("device.id", "device.name", "device.device_id");
      const masterData = await knex("master_data")
        .where("master_data.device_id", ctx.params.id)
        .select("category_id", "value");
      const masterDataMap = new Map();
      masterData.forEach((element: { category_id: any; value: any }) => {
        masterDataMap.set(element.category_id, element.value);
      });
      const masterDataObject: IMasterData[] = Array.from(masterDataMap).map(
        (entry: string[]) =>
          ({
            category_id: entry[0],
            value: entry[1]
          } as IMasterData)
      );
      const deviceTag = await knex("device_tag")
        .where("device_tag.device_id", ctx.params.id)
        .select("tag_id");
      const deviceTagArray = [];
      for (const entry of deviceTag) {
        deviceTagArray.push(entry.tag_id);
      }

      const latestState = await knex("state_history")
        .where("device_id", ctx.params.id)
        .select("anomaly_id", "state")
        .orderBy("timestamp", "desc")
        .first();

      const anomaly: IAnomaly = await knex("anomaly")
        .where("anomaly_id", latestState.anomaly_id)
        .first();

      const device = {
        id: deviceDefaultData[0].id,
        state: latestState.state,
        name: deviceDefaultData[0].name,
        device_id: deviceDefaultData[0].device_id,
        master_data: masterDataObject,
        tags: deviceTagArray,
        anomaly: anomaly ? anomaly : null
      };
      return device;
    },

    async getAllDevices(ctx): Promise<any> {
      const deviceIds = await knex("device").select("device.id");
      const allDevices = [];
      for (const entry of deviceIds) {
        const currentDevice = await ctx.call("devicemanagement.getDevice", {
          id: entry.id
        });
        allDevices.push(currentDevice);
      }
      return allDevices;
    },

    async getAllDeviceIds(): Promise<string[]> {
      const allDevices = await knex("device").select("device.id");
      const allIds: string[] = allDevices.map(
        (device: { id: string; name: string; device_id: string }) => device.id
      );
      return allIds;
    },

    async createCategory(ctx): Promise<any> {
      try {
        await knex("category").insert({ name: ctx.params.category });
      } catch (e) {
        if (e.code === "23505") {
          throw new MoleculerError(
            "This category already exists!",
            422,
            "ERR_SOMETHING",
            {}
          );
        }
        if (e.code === "23502") {
          throw new MoleculerError(
            "This category must not be empty!",
            422,
            "ERR_SOMETHING",
            {}
          );
        }
      }
    },

    async modifyCategory(ctx): Promise<void> {
      if (ctx.params.category && ctx.params.oldCategory) {
        try {
          await knex("category")
            .where("name", "=", ctx.params.oldCategory)
            .update({ name: ctx.params.category });
        } catch (e) {
          throw new MoleculerError(
            "You can not change the category, because it already exists!",
            422,
            "ERR_SOMETHING",
            {}
          );
        }
      } else {
        throw new MoleculerError(
          "The new category must not be empty!",
          422,
          "ERR_SOMETHING",
          {}
        );
      }
    },

    async deleteCategory(ctx): Promise<void> {
      if (ctx.params.category) {
        try {
          await knex("category")
            .where("name", ctx.params.category)
            .del();
        } catch (e) {
          throw new MoleculerError(
            "You can not delete this category!",
            422,
            "ERR_SOMETHING",
            {}
          );
        }
      } else {
        throw new MoleculerError(
          "The category must not be empty!",
          422,
          "ERR_SOMETHING",
          {}
        );
      }
    },

    async getTags(): Promise<any> {
      const tags = await knex("tag").select();
      const tagArray = [];
      for (const element of tags) {
        tagArray.push(element.name);
      }
      return tagArray;
    },

    async getCategories(): Promise<any> {
      const categories = await knex("category").select();
      const categoryArray = [];
      for (const element of categories) {
        categoryArray.push(element.name);
      }
      return categoryArray;
    },

    async changeState(ctx): Promise<void> {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() + 1);
      const historicalState: IHistoricalState = {
        timestamp,
        device_id: ctx.params.id,
        state: ctx.params.state,
        anomaly_id: ctx.params.anomaly_id ? ctx.params.anomaly_id : null
      };
      await knex("state_history").insert(historicalState);
    },

    async getLatestStatesOfDevice(ctx): Promise<any> {
      const latestStates = await knex("state_history")
        .where("device_id", ctx.params.id)
        .select("state", "timestamp")
        .orderBy("timestamp", "desc");
      return latestStates;
    },

    async getLatestStateOfDevice(ctx): Promise<any> {
      const latest = await knex("state_history")
        .where("device_id", ctx.params.id)
        .select("state")
        .orderBy("timestamp", "desc")
        .limit(1);
      return latest;
    }
  },

  /**
   * Events
   */
  events: {},

  /**
   * Methods
   */
  methods: {},

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
    console.log("Service up");
    this.logger.info("Service is up");
    knex
      .raw("select 1+1 as result")
      .then(() => {
        this.logger.info("Connected to DB");
        return Promise.resolve();
      })
      .catch((err: any) => {
        this.logger.error(err);
        this.broker.fatal("no db connection", err, true);
        return Promise.reject(err);
      });
    return Promise.resolve();
  },

  /**
   * Service stopped lifecycle event handler
   */
  stopped(): Promise<void> {
    return Promise.resolve();
  }
};

export = deviceManagementService;

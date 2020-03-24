// import moleculer = require('moleculer');
import { /*Context, ServiceBroker,*/ ServiceSchema } from "moleculer";
// import { v4 } from "uuid";

const deviceService: ServiceSchema = {
  name: "device",

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
    /**
     * Say a 'Hello'
     *
     * @returns
     */
    async register(ctx): Promise<void> {
      // const all = await ctx.call("devices.getAll");
      const deviceId = ctx.params.deviceId.toString();
      const businessId = ctx.params.businessId.toString();
      // We use here the type `Record<string, any>` as generic type for an object structure
      // The exact type of the object should be used if well defined and known
      const expected: Record<string, any> = {
        deviceId,
        businessId,
        type: "dummy"
      };
      /*const response = */
      await ctx.call<DEVICES_REGISTERED>("devices.register", {
        body: expected
      });
      return Promise.resolve();
    },

    /*async deleteAll(ctx) {
      const all = await ctx.call("devices.getAll");
      for (let value in all) {
        ctx.call<DEVICES_DESTROYED>("devices.delete", {
          params: { businessId: all[value].businessId }
        });
      }
    },*/

    async getAll(ctx): Promise<void> {
      const all = await ctx.call("devices.getAll");
      console.log(all);
      return Promise.resolve();
    },

    async delete(ctx): Promise<void> {
      const expected: Record<string, any> = {
        businessId: ctx.params.businessId.toString()
      };
      await ctx.call<DEVICES_DESTROYED>("devices.delete", {
        params: expected
      });
      return Promise.resolve();
    },

    /*async getAllServices(ctx): Promise<void> {
      const all = await ctx.call("$node.actions");
      console.log(all);
      return Promise.resolve();
    },*/

    async update(ctx): Promise<void> {
      const all = await ctx.call("devices.getAll");
      const businessId = all[0].businessId;
      const deviceID = 456;
      const facility = "test";
      const location: ReadonlyArray<any> = [1, 2, 3];
      const position = 987;
      const sim = 321;
      const active = false;
      const internalID = 654;
      const expected: Record<string, any> = {
        deviceID,
        businessId,
        facility,
        location,
        position,
        sim,
        active,
        internalID,
        type: "dummy"
      };
      const response = await ctx.call<DEVICES_UPDATED>("devices.update", {
        body: expected,
        params: businessId
      });
      console.log(response);
      return Promise.resolve();
    },

    async addData(ctx): Promise<void> {
      const response = await ctx.call("devices.addData", {
        body: ctx.params.data
      });
      console.log(response);
      return response;
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
    return Promise.resolve();
  },

  /**
   * Service stopped lifecycle event handler
   */
  stopped(): Promise<void> {
    return Promise.resolve();
  }
};

export = deviceService;

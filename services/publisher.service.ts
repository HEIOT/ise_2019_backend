import { ServiceSchema } from "moleculer";

const publisherService: ServiceSchema = {
  name: "publisher",

  /**
   * Actions
   */
  actions: {
    async addData(ctx): Promise<void> {
      const response = await ctx.call("devices.addData", {
        body: ctx.params.data
      });
      return response;
    },
    async addDataDirectly(ctx): Promise<any> {
      ctx.emit("device.DATA_INSERTED", { params: ctx.params.data });
    }
  },

  events: {},

  methods: {},

  created(): Promise<void> {
    return Promise.resolve();
  },

  started(): Promise<void> {
    return Promise.resolve();
  },

  stopped(): Promise<void> {
    return Promise.resolve();
  }
};

export = publisherService;

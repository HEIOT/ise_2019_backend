import chai from "chai";
import config from "config";
import { ServiceBroker } from "moleculer";
import deviceManagementService from "../services/device-management.service";

const assert = chai.assert;

const knexConfig = require("../knexfile").test;
const knex = require("knex")(knexConfig);

const incontextServiceStub = {
  name: "device",
  actions: {
    register: () => Promise.resolve(),
    getAll: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    update: () => Promise.resolve()
  }
};

/*
TESTS
*/

describe("device management service test", () => {
  const broker = new ServiceBroker({
    nodeID: "test-app",
    transporter: config.get("transporter"),
    logger: true,
    logLevel: "fatal"
  });

  broker.createService(deviceManagementService);
  broker.createService(incontextServiceStub);

  before(function(): any {
    this.timeout(30000);
    return Promise.all([
      broker.start(),
      knex.migrate
        .rollback()
        .then(() => knex.migrate.latest())
        .then(() => knex.seed.run())
    ]);
  });

  after(() => {
    return Promise.all([broker.stop(), knex.migrate.rollback()]);
  });

  describe("device management", () => {
    it("should get all device ids correctly", async () => {
      const allDeviceIds: string[] = await broker.call(
        "devicemanagement.getAllDeviceIds"
      );
      const targetIds = ["1", "2", "3", "4", "5", "6", "7", "8"];
      assert(allDeviceIds.toString() === targetIds.toString());
    });
  });

  describe("tag management", () => {
    it("should create tag correctly", async () => {
      const addTag = "test--tag";

      await broker.call("devicemanagement.createTag", {
        tag: addTag
      });
      const allTags = await knex("tag").map((tag: any) => tag.name);

      assert.include(allTags, addTag);
    });

    it("should remove tag correctly", async () => {
      const removeTag = "photo";

      await broker.call("devicemanagement.deleteTag", {
        tag: removeTag
      });
      const allTags = await knex("tag").map((tag: any) => tag.name);

      assert.notInclude(allTags, removeTag);
    });

    it("should add tags to specified device correctly", async () => {
      const newTags = ["thermo", "air"];
      const deviceId = 1;

      await broker.call("devicemanagement.addTags", {
        id: deviceId,
        tags: ["thermo", "air"]
      });
      const allTags = await knex("device_tag").where("device_id", deviceId);
      const allTagIds = allTags.map((tag: any) => tag.tag_id);

      for (const tag of newTags) {
        assert.include(allTagIds, tag);
      }
    });
  });

  describe("masterdata management", () => {
    it("should add masterdata to specified device correctly", async () => {
      await broker.call("devicemanagement.addMasterData", {
        id: 1,
        master_data: [
          {
            category_id: "celsius",
            value: "100"
          },
          {
            category_id: "humidity",
            value: "100"
          }
        ]
      });
      const newMasterData = await knex("master_data").where("device_id", 1);
      assert(newMasterData.length === 3);
    });
  });

  describe("masterdata category management", () => {
    it("should add category correctly", async () => {
      const newCategory = "TestCategory";
      await broker.call("devicemanagement.createCategory", {
        category: newCategory
      });
      const newCategoryInDb = await knex("category").where("name", newCategory);

      assert.exists(newCategoryInDb);
    });

    it("should modify category correctly", async () => {
      const oldCategory = "lumen";
      const newCategory = "newlumen";
      await broker.call("devicemanagement.modifyCategory", {
        oldCategory,
        category: newCategory
      });
      const allCategories = (await knex("category")).map(
        (item: any) => item.name
      );

      assert.include(allCategories, newCategory);
      assert.notInclude(allCategories, oldCategory);
    });

    it("should delete category correctly", async () => {
      await broker.call("devicemanagement.deleteCategory", {
        category: "lumen"
      });
      const allCategories = (await knex("category")).map(
        (item: any) => item.name
      );

      assert.notInclude(allCategories, "lumen");
      assert.equal(allCategories.length, 4);
    });

    it("should not add existing category", async () => {
      const newCategory = "lumen";
      await broker.call("devicemanagement.createCategory", {
        category: newCategory
      });
      const newCategoryInDb = await knex("category");

      assert.equal(newCategoryInDb.length, 5);
    });
  });

  describe("state management", () => {
    it("should change state of a device correctly", async () => {
      await broker.call("devicemanagement.changeState", {
        id: 1,
        state: "urgent"
      });

      const device = await broker.call("devicemanagement.getDevice", {
        id: 1
      });
      assert(device.state, "urgent");
    });

    it("should get the list of latest states of the device", async () => {
      await broker.call("devicemanagement.changeState", {
        id: 1,
        state: "info"
      });
      await broker.call("devicemanagement.changeState", {
        id: 1,
        state: "warning"
      });
      await broker.call("devicemanagement.changeState", {
        id: 1,
        state: "ok"
      });

      const latestStates = await broker.call(
        "devicemanagement.getLatestStatesOfDevice",
        {
          id: 1
        }
      );
      assert(latestStates.length === 5);
    });
  });

  describe("device management", () => {
    it("should add device correctly", async () => {
      const tags = ["air", "thermo"];
      const master_data = [
        {
          category_id: "celsius",
          value: "100"
        },
        {
          category_id: "humidity",
          value: "20"
        }
      ];

      const newDevice = {
        name: "TestDevice",
        device_id: "TestId"
      };

      await broker.call("devicemanagement.registerDevice", {
        ...newDevice,
        tags,
        master_data
      });

      const newCreatedDevice = await knex("device").where(
        "device.device_id",
        newDevice.device_id
      );

      assert.exists(newCreatedDevice);
    });

    it("should get device correctly", async () => {
      const deviceInstanceFromService = await broker.call(
        "devicemanagement.getDevice",
        {
          id: 1
        }
      );

      assert.exists(deviceInstanceFromService);
      assert.property(deviceInstanceFromService, "master_data");
      assert.property(deviceInstanceFromService, "tags");
      assert.propertyVal(
        deviceInstanceFromService.master_data[2],
        "category_id",
        "newlumen"
      );
      assert.propertyVal(
        deviceInstanceFromService.master_data[0],
        "value",
        "100"
      );
    });

    it("should update device correctly", async () => {
      const device = {
        id: 1,
        name: "NewName",
        device_id: "NewDeviceId"
      };
      const newTags = ["thermo", "air"];
      const masterData = [
        {
          category_id: "celsius",
          value: "50"
        }
      ];

      await broker.call("devicemanagement.updateDevice", {
        ...device,
        master_data: masterData,
        tags: newTags
      });

      const newDevice = await broker.call("devicemanagement.getDevice", {
        id: 1
      });

      assert.equal(newDevice.name, "NewName");
      assert.equal(newDevice.device_id, "NewDeviceId");
      assert.include(newDevice.tags, "thermo");
      assert.notInclude(newDevice.tags, "photo");
    });

    it("should delete devices correctly", async () => {
      // TODO
      await broker.call("devicemanagement.deleteDevice", { id: 1 });
      await knex("device").where("id", 1);
      await knex("device_tag").where("device_id", 1);
      await knex("master_data").where("device_id", 1);
      assert(true);
    });
  });
}).timeout(20000);

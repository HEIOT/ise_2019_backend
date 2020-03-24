import chai from "chai";
import config from "config";
import { ServiceBroker } from "moleculer";
import datastoreService from "../services/datastore.service";
import { IData } from "../typings/typings";

const assert = chai.assert;

const knexConfig = require("../knexfile").test;
const knex = require("knex")(knexConfig);

/*
TESTS
*/

describe("datastore service test", () => {
  const broker = new ServiceBroker({
    nodeID: "test-app",
    transporter: config.get("transporter"),
    logger: true,
    logLevel: "fatal"
  });

  broker.createService(datastoreService);

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

  describe("getValuesForDevice", () => {
    it("should get the right amount of datapoints", async () => {
      const deviceId = 1;
      const deviceDataValueName = "pm10";
      const amountValue = null;
      const offsetValue = null;

      const deviceList: IData[] = await broker.call(
        "datastore.getValuesForDevice",
        {
          device_id: deviceId,
          device_data_value_name: deviceDataValueName,
          amount: amountValue,
          offset: offsetValue
        }
      );
      const countEntries = 48;

      assert.equal(deviceList.length, countEntries);
    });

    it("should get latest data from a device", async () => {
      const deviceId = 1;
      const limit = 8;

      const latestDeviceData: IData[] = (await broker.call(
        "datastore.getLatestDataForDevice",
        { limit, device_id: deviceId }
      )).sort(sortIDataWithDate);

      assert.equal(latestDeviceData.length, limit);

      const latestDate: any[] = await knex("device_data")
        .select("date")
        .where("device_id", deviceId)
        .orderBy("date", "desc")
        .limit(1);
      const eigthLatestDate: any[] = await knex("device_data")
        .select("date")
        .where("device_id", deviceId)
        .orderBy("date", "desc")
        .limit(1)
        .offset(limit - 1);

      assert.equal(
        new Date(eigthLatestDate[0].date).getTime(),
        new Date(latestDeviceData[0].date).getTime()
      );
      assert.equal(
        new Date(latestDate[0].date).getTime(),
        new Date(latestDeviceData[latestDeviceData.length - 1].date).getTime()
      );
    });

    it("should include all data values in device data", async () => {
      const device_id = 1;
      const data: IData = (await broker.call(
        "datastore.getLatestDataForDevice",
        {
          device_id,
          limit: 1
        }
      ))[0];

      const latestData: { id: string } = (await knex("device_data")
        .where({
          device_id
        })
        .orderBy("date", "desc")
        .limit(1))[0];

      const allDataValues: any[] = await knex("device_data_value").where({
        data_id: latestData.id
      });

      for (const name of data.data.map(a => a.name)) {
        assert.include(allDataValues.map(a => a.name), name);
      }
    });

    it("get data only in given time range", async () => {
      const startDate = "2019-12-15T11:00:00.000Z";
      const endDate = "2019-12-15T12:00:00.000Z";

      const data: IData[] = await broker.call(
        "datastore.getDataForDeviceWithTimeRange",
        {
          startDate,
          endDate,
          device_id: 1
        }
      );

      const sortedDates = data.sort(sortIDataWithDate);
      const greatestDate = new Date(sortedDates[sortedDates.length - 1].date);
      const smallestDate = new Date(sortedDates[0].date);
      assert.isAtLeast(smallestDate.getTime(), new Date(startDate).getTime());
      assert.isAtLeast(greatestDate.getTime(), new Date(startDate).getTime());
      assert.isAtMost(smallestDate.getTime(), new Date(endDate).getTime());
      assert.isAtMost(greatestDate.getTime(), new Date(endDate).getTime());
    });
  });
});

function sortIDataWithDate(a: IData, b: IData): number {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();

  return dateA - dateB;
}

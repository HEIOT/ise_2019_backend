import chai from "chai";
import analyticsService from "../services/analytics.service";
import { getSpikes } from "../utils/analytical-methods";
import { ISpike, ISensorData, IAnomaly } from "../typings/typings";
import config from "config";
import { ServiceBroker } from "moleculer";
import deviceManagementService from "../services/device-management.service";

const assert = chai.assert;

/*
TESTS
*/

describe("analytics service test", () => {
  const broker = new ServiceBroker({
    nodeID: "test-app",
    transporter: config.get("transporter"),
    logger: true,
    logLevel: "fatal"
  });

  broker.createService(deviceManagementService);
  broker.createService(analyticsService);
  broker.createService(deviceManagementService);

  before(() => broker.start());
  after(() => broker.stop());

  describe("analytics", () => {
    it("convert input jsons correctly", async () => {
      const test: ISensorData[] = [
        {
          deviceId: "1",
          date: { s: "2019-12-15 12:00:00", tz: "+01:00", v: 1576411200 },
          sensors: [
            {
              name: "no2",
              type: "number",
              value: 3.7,
              date: { s: "2019-12-15 12:00:00", tz: "+01:00", v: 1576411200 }
            },
            {
              name: "o3",
              type: "number",
              value: 28.9,
              date: { s: "2019-12-15 12:00:00", tz: "+01:00", v: 1576411200 }
            },
            {
              name: "p",
              type: "number",
              value: 1002.5,
              date: { s: "2019-12-15 12:00:00", tz: "+01:00", v: 1576411200 }
            }
          ]
        },
        {
          deviceId: "1",
          date: { s: "2019-12-15 13:00:00", tz: "+01:00", v: 1576414800 },
          sensors: [
            {
              name: "no2",
              type: "number",
              value: 4,
              date: { s: "2019-12-15 13:00:00", tz: "+01:00", v: 1576414800 }
            },
            {
              name: "o3",
              type: "number",
              value: 30,
              date: { s: "2019-12-15 13:00:00", tz: "+01:00", v: 1576414800 }
            },
            {
              name: "p",
              type: "number",
              value: 1003,
              date: { s: "2019-12-15 13:00:00", tz: "+01:00", v: 1576414800 }
            }
          ]
        },
        {
          deviceId: "2",
          date: { s: "2019-12-15 12:00:00", tz: "+01:00", v: 1576411200 },
          sensors: [
            {
              name: "x",
              type: "number",
              value: 0,
              date: { s: "2019-12-15 12:00:00", tz: "+01:00", v: 1576411200 }
            },
            {
              name: "p",
              type: "number",
              value: 1111,
              date: { s: "2019-12-15 12:00:00", tz: "+01:00", v: 1576411200 }
            }
          ]
        },
        {
          deviceId: "2",
          date: { s: "2019-12-15 13:00:00", tz: "+01:00", v: 1576414800 },
          sensors: [
            {
              name: "no2",
              type: "number",
              value: 31.7,
              date: { s: "2019-12-15 13:00:00", tz: "+01:00", v: 1576414800 }
            },
            {
              name: "o3",
              type: "number",
              value: 8.9,
              date: { s: "2019-12-15 13:00:00", tz: "+01:00", v: 1576414800 }
            },
            {
              name: "p",
              type: "number",
              value: 2202.5,
              date: { s: "2019-12-15 13:00:00", tz: "+01:00", v: 1576414800 }
            }
          ]
        }
      ];
      const promises: any = [];
      test.forEach(async (item: ISensorData) => {
        promises.push(broker.call("analytics.updateDeviceData", { ...item }));
      });
      await Promise.all(promises);
      const formatted = await broker.call("analytics.getDeviceData");
      const target = {
        "1": {
          no2: [
            { value: 3.7, timestamp: 1576411200 },
            { value: 4, timestamp: 1576414800 }
          ],
          o3: [
            { value: 28.9, timestamp: 1576411200 },
            { value: 30, timestamp: 1576414800 }
          ],
          p: [
            { value: 1002.5, timestamp: 1576411200 },
            { value: 1003, timestamp: 1576414800 }
          ]
        },
        "2": {
          no2: [{ value: 31.7, timestamp: 1576414800 }],
          o3: [{ value: 8.9, timestamp: 1576414800 }],
          p: [
            { value: 1111, timestamp: 1576411200 },
            { value: 2202.5, timestamp: 1576414800 }
          ],
          x: [{ value: 0, timestamp: 1576411200 }]
        }
      };

      function convertToString(obj: any): string {
        const keys = Object.keys(obj).sort();
        let res = keys.toString();
        keys.forEach((key: string) => {
          const attributes = Object.keys(obj[key]).sort();
          res += attributes.toString();
          attributes.forEach((attr: string) => {
            res += obj[key][attr]
              .map((data: any) => JSON.stringify(data))
              .toString();
          });
        });
        return res;
      }
      assert(convertToString(formatted) === convertToString(target));
    });

    it("should detect spikes", () => {
      const test: any = {
        "1": {
          no2: [
            { value: 3.7, timestamp: 1576411200 },
            { value: 4, timestamp: 1576414800 },
            { value: 4.1, timestamp: 1576414900 },
            { value: 4.4, timestamp: 1576415900 },
            { value: 4.2, timestamp: 1576416000 },
            { value: 7, timestamp: 1576417900 },
            { value: 10, timestamp: 1576418900 },
            { value: 4.1, timestamp: 1576419900 },
            { value: 4.1, timestamp: 1576419901 },
            { value: 4.0, timestamp: 1576419902 },
            { value: 0, timestamp: 1576419903 }
          ]
        },
        "2": {
          p: [
            { value: 1111, timestamp: 1576411200 },
            { value: 2202.5, timestamp: 1576414800 }
          ],
          x: [{ value: 0, timestamp: 1576414800 }]
        }
      };

      const target: ISpike[] = [
        {
          id: "1",
          timestamp: 1576417900,
          attribute: "no2",
          value: 7,
          moving_average: 4.08
        },
        {
          id: "1",
          timestamp: 1576419903,
          attribute: "no2",
          value: 0,
          moving_average: 4.4
        }
      ];
      const objectIds = Object.keys(test);
      let allSpikes: ISpike[] = [];
      objectIds.forEach((id: string) => {
        const attributes = Object.keys(test[id]);
        attributes.forEach((attr: string) => {
          allSpikes = [
            ...allSpikes,
            ...getSpikes(test[id][attr], 5, 3.5, 0.5, id, attr)
          ];
        });
      });
      assert(target.toString() === allSpikes.toString());
    });
  }).timeout(20000);

  describe("anomaly services", () => {
    function convertToString(obj: any): string {
      const keys = Object.keys(obj).sort();
      let res = keys.toString();
      keys.forEach((key: string) => {
        res += obj[key];
      });
      return res;
    }

    const anomalies: IAnomaly[] = [
      {
        device_id: 1,
        attribute: "p",
        type: "spike",
        timestamp: 1000000987654
      },
      {
        device_id: 1,
        attribute: "p",
        type: "spike",
        timestamp: 19191919191919
      },
      {
        device_id: 2,
        attribute: "p",
        type: "spike",
        timestamp: 19191919191919
      },
      {
        device_id: 2,
        attribute: "no2",
        type: "spike",
        timestamp: 19191919191919
      }
    ];

    it("should store anomaly in database", async () => {
      await broker.call("analytics.storeAnomaly", { ...anomalies[0] });
      await broker.call("analytics.storeAnomaly", { ...anomalies[1] });
      await broker.call("analytics.storeAnomaly", { ...anomalies[2] });
      await broker.call("analytics.storeAnomaly", { ...anomalies[3] });

      const anomaliesFromDB: IAnomaly[] = await broker.call(
        "analytics.getAnomaliesByDeviceId",
        {
          device_id: 1
        }
      );

      assert(
        convertToString(anomalies[0]) === convertToString(anomaliesFromDB[0])
      );
      assert(
        convertToString(anomalies[1]) === convertToString(anomaliesFromDB[1])
      );
    });

    it("should get all anomalies", async () => {
      const allAnomaliesFromDB: IAnomaly[] = await broker.call(
        "analytics.getAllAnomalies"
      );
      let currStr = "";
      let targetStr = "";

      allAnomaliesFromDB.forEach((anomaly: IAnomaly) => {
        currStr += convertToString(anomaly);
      });

      anomalies.forEach((anomaly: IAnomaly) => {
        targetStr += convertToString(anomaly);
      });
      assert(currStr === targetStr);
    });
  }).timeout(20000);
}).timeout(20000);

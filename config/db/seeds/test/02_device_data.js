const airQualityData = require("../air-quality-data");

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("device_data")
    .del()
    .then(async () => {
      knex("device_data")
        .where(true)
        .del();

      const groupedValues = groupAirQualityData(airQualityData);
      console.log("Datei geladen");
      for (let city in groupedValues) {
        for (let date in groupedValues[city].dates) {
          let id = (await knex("device_data").insert(
            {
              device_id: groupedValues[city].device_id,
              date: date
            },
            ["id"]
          ))[0].id;

          await knex("device_data_value").insert(
            groupedValues[city].dates[date].map(data => ({
              ...data,
              data_id: id
            }))
          );
        }
      }

      return;
    });
};

function groupAirQualityData(data) {
  return data.reduce((acc, item) => {
    const cityId = getCityId(item);
    if (!acc[cityId])
      acc[cityId] = {
        device_id: cityId,
        dates: {}
      };

    if (!acc[cityId].dates[item.date.s]) acc[cityId].dates[item.date.s] = [];

    acc[cityId].dates[item.date.s].push({
      name: item.name,
      type: item.type,
      value: item.value
    });
    return acc;
  }, {});
}

const nameMappings = {
  Heidelberg: 1,
  Mannheim: 2,
  Karlsruhe: 3,
  Heilbronn: 4,
  Heppenheim: 5,
  Kaiserslautern: 6,
  Worms: 7,
  Wiesloch: 8
};

function getCityId(data) {
  for (let city in nameMappings) {
    if (data.city.includes(city)) return nameMappings[city];
  }
  return "unknown";
}

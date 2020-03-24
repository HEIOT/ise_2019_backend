exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("master_data")
    .del()
    .then(function() {
      // Inserts seed entries
      knex("master_data")
        .where(true)
        .del();
      return knex("master_data").insert([
        { device_id: 1, category_id: "lumen", value: "100" },
        { device_id: 2, category_id: "celsius", value: "16" },
        { device_id: 3, category_id: "humidity", value: "80" }
      ]);
    });
};

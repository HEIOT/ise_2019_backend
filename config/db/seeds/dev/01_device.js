exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("device")
    .del()
    .then(function() {
      // Inserts seed entries
      knex("device")
        .where(true)
        .del();
      return knex("device").insert([
        { name: "Air Quality Heidelberg", device_id: "aq_heidelberg", id: 1 },
        { name: "Air Quality Mannheim", device_id: "aq_mannheim", id: 2 },
        { name: "Air Quality Karlsruhe", device_id: "aq_karlsruhe", id: 3 },
        { name: "Air Quality Heilbronn", device_id: "aq-heilbronn", id: 4 },
        { name: "Air Quality Heppenheim", device_id: "aq-heppenheim", id: 5 },
        {
          name: "Air Quality Kaiserslautern",
          device_id: "aq-kaiserslautern",
          id: 6
        },
        { name: "Air Quality Worms", device_id: "aq-worms", id: 7 },
        { name: "Air Quality Wiesloch", device_id: "aq-wiesloch", id: 8 }
      ]);
    })
    .then(function() {
      // updates the auto increment sequence to match the amount of inserts made above
      // select setval('device_id_seq', (select max(id) from device));
      return knex.raw(
        "SELECT setval('device_id_seq', (SELECT MAX(id) from \"device\"));"
      );
    });
};

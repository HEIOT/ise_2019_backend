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
        { name: "Air Quality Heidelberg", device_id: "aq_heidelberg" },
        { name: "Air Quality Mannheim", device_id: "aq_mannheim" },
        { name: "Air Quality Karlsruhe", device_id: "aq_mannheim" },
        { name: "Air Quality Heilbronn", device_id: "aq-heilbronn" },
        { name: "Air Quality Heppenheim", device_id: "aq-heppenheim" },
        {
          name: "Air Quality Kaiserslautern",
          device_id: "aq-kaiserslautern"
        },
        { name: "Air Quality Worms", device_id: "aq-worms" },
        { name: "Air Quality Wiesloch", device_id: "aq-wiesloch" }
      ]);
    });
};

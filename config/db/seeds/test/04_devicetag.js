exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("device_tag")
    .del()
    .then(function() {
      // Inserts seed entries
      knex("device_tag")
        .where(true)
        .del();
      return knex("device_tag").insert([
        { device_id: 1, tag_id: "photo" },
        { device_id: 2, tag_id: "thermo" },
        { device_id: 3, tag_id: "air" }
      ]);
    });
};

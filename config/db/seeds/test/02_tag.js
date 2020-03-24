exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("tag")
    .del()
    .then(function() {
      // Inserts seed entries
      knex("tag")
        .where(true)
        .del();
      return knex("tag").insert([
        { name: "photo" },
        { name: "thermo" },
        { name: "air" }
      ]);
    });
};

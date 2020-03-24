exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("category")
    .del()
    .then(function() {
      // Inserts seed entries
      knex("category")
        .where(true)
        .del();
      return knex("category").insert([
        { name: "lumen" },
        { name: "celsius" },
        { name: "humidity" }
      ]);
    });
};

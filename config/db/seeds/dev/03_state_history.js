exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex("state_history")
    .del()
    .then(function() {
      // Inserts seed entries
      knex("state_history")
        .where(true)
        .del();
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() + 1);
      return knex("state_history").insert([
        { device_id: 1, state: "ok", timestamp },
        { device_id: 2, state: "ok", timestamp },
        { device_id: 3, state: "ok", timestamp },
        { device_id: 4, state: "ok", timestamp },
        { device_id: 5, state: "ok", timestamp },
        { device_id: 6, state: "ok", timestamp },
        { device_id: 7, state: "ok", timestamp },
        { device_id: 8, state: "ok", timestamp }
      ]);
    });
};

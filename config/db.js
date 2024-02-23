require("dotenv").config();
const pg = require("pg");
pg.types.setTypeParser(1114, (str) => str); // timestamp without timezone parser disabled

const Pool = require("pg").Pool;
const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
});

module.exports = pool;

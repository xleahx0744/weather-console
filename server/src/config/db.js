 // Load environment variables
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT), // <-- important
});
console.log('Connecting to PG:', process.env.DB_HOST, Number(process.env.DB_PORT));
// A helper function to easily run queries
module.exports = {
  query: (text, params) => pool.query(text, params),
};

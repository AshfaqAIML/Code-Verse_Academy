require('dotenv').config();

let pool = null;

try {
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
} catch (error) {
  pool = null;
}

module.exports = {
  query: async (text, params) => {
    if (!pool) {
      return { rows: [], rowCount: 0, text, params };
    }
    return pool.query(text, params);
  },
};

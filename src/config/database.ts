require('dotenv').config();

module.exports = {
  dialect: process.env.DB_DIARECT,
  storage: process.env.DB_STORAGE,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
}

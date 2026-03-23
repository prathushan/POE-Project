// import mysql from 'mysql2/promise';
 
// export const db = mysql.createPool({
//   host: process.env.MYSQLHOST || 'localhost',
//   user: process.env.MYSQLUSER || 'root',
//   password: process.env.MYSQLPASSWORD || '',
//   database: process.env.MYSQLDATABASE || 'poe'
// });

import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

export const db = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});
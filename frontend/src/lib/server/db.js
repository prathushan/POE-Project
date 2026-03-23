// import mysql from 'mysql2/promise';
 
// export const db = mysql.createPool({
//   host: process.env.MYSQLHOST || 'localhost',
//   user: process.env.MYSQLUSER || 'root',
//   password: process.env.MYSQLPASSWORD || '',
//   database: process.env.MYSQLDATABASE || 'poe'
// });



// import mysql from 'mysql2/promise';
// import { env } from '$env/dynamic/private';

// export const db = mysql.createPool({
//   host: env.MYSQLHOST || 'localhost',
//   user: env.MYSQLUSER || 'root',
//   password: env.MYSQLPASSWORD || '',
//   database: env.MYSQLDATABASE || 'poe',
// });


import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';
 
export const db = mysql.createPool({
  host: env.MYSQLHOST || 'localhost',
  user: env.MYSQLUSER || 'root',
  password: env.MYSQLPASSWORD || '',
  database: env.MYSQL_DATABASE || 'poe', // 👈 FIX HERE
});
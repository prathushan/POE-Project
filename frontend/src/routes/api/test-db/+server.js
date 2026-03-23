// src/routes/api/test-db/+server.js
 
import { db } from '$lib/server/db';
 
export const GET = async () => {
  try {
    const [rows] = await db.execute('SELECT 1 as test');
    return new Response(JSON.stringify(rows));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }));
  }
};
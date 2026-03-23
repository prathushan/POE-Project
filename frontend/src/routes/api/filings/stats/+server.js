import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET = async () => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        COUNT(DISTINCT company_name) as companies,
        COUNT(DISTINCT filer_name) as filers
      FROM filings
    `);

    return json(rows[0]);

  } catch (err) {
    console.log('STATS ERROR:', err);
    return json({ message: 'Server error' }, { status: 500 });
  }
};
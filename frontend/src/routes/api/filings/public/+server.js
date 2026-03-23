import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET = async () => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id,
        accession_number,
        company_name,
        company_cik,
        filer_name,
        filer_cik,
        def14a_link,
        item_number,
        contact_name,
        contact_email,
        pdf_s3_key,
        pdf_filename,
        subject,
        description,
        created_at,
        status
      FROM filings
      WHERE LOWER(status) = 'approved'
      ORDER BY created_at DESC
    `);

    return json(rows);

  } catch (err) {
    console.log('PUBLIC API ERROR:', err);
    return json({ message: 'Server error' }, { status: 500 });
  }
};
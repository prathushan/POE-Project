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
        contact_name,
        contact_email,
        def14a_link,
        item_number,
        pdf_s3_key,
        pdf_filename,
        description,
        subject,
        status,
        created_at
      FROM filings
      ORDER BY created_at DESC
    `);

    return json(rows);

  } catch (err) {
    console.log('FETCH FILINGS ERROR:', err);
    return json({ message: 'Server error' }, { status: 500 });
  }
};
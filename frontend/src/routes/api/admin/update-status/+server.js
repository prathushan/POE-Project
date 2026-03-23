import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const POST = async ({ request }) => {
  try {
    const { id, status, note } = await request.json();

    await db.execute(
      `UPDATE filings 
       SET status = ?, admin_note = ?
       WHERE id = ?`,
      [status, note || null, id]
    );

    return json({ success: true });

  } catch (err) {
    console.log('UPDATE ERROR:', err);
    return json({ message: 'Server error' }, { status: 500 });
  }
};
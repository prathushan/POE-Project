import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const POST = async ({ request }) => {
  try {
    const { id } = await request.json();

    await db.execute(
      'DELETE FROM filings WHERE id = ?',
      [id]
    );

    return json({ success: true });

  } catch (err) {
    console.log('DELETE ERROR:', err);
    return json({ message: 'Server error' }, { status: 500 });
  }
};
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const POST = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    const [rows] = await db.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      [email]
    );

    if (rows.length === 0) {
      return json({ message: 'Admin not found' }, { status: 401 });
    }

    const admin = rows[0];

    // 🔥 TEMP: plain text comparison
    if (password !== admin.password_hash) {
      return json({ message: 'Invalid password' }, { status: 401 });
    }

    return json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });

  } catch (err) {
    console.log('❌ ADMIN LOGIN ERROR:', err);
    return json({ message: 'Server error' }, { status: 500 });
  }
};
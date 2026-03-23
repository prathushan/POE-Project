import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
  const { email, password } = await request.json();

  const [rows] = await db.execute(
    'SELECT * FROM users WHERE email=?',
    [email]
  );

  if (rows.length === 0) {
    return json({ message: 'User not found' }, { status: 400 });
  }

  const user = rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return json({ message: 'Wrong password' }, { status: 400 });
  }

  // ✅ IMPORTANT: send user data
  return json({
  success: true,
  user: {
    id: user.id,
    email: user.email,
    org_name: user.org_name,
    cik: user.cik,
    contact_name: user.contact_name
  }
});
};
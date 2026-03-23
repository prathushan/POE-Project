import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db';

export const POST = async ({ request }) => {
  const {
    email,
    password,
    cik,
    filer_name,
    contact_name
  } = await request.json();

  if (!email || !password || !cik || !contact_name) {
    return json({ message: 'All required fields must be filled' }, { status: 400 });
  }

  const formattedCIK = cik.padStart(10, '0');

  // 🚫 Block personal emails
  const blocked = [
    'gmail.com','yahoo.com','hotmail.com','outlook.com',
    'aol.com','icloud.com','mail.com','protonmail.com'
  ];

  const domain = email.split('@')[1];

  if (blocked.includes(domain)) {
    return json({ message: 'Use company email' }, { status: 400 });
  }

  // 🔍 CHECK EXISTING USER (email OR cik)
  const [existing] = await db.execute(
    'SELECT * FROM users WHERE email=? OR cik=?',
    [email, formattedCIK]
  );

  if (existing.length > 0) {
    return json(
      { message: 'Matched record already exists. Please sign in instead.' },
      { status: 400 }
    );
  }

  // 🔍 CIK lookup
  const [rows] = await db.execute(
    'SELECT org_name FROM cik_registry WHERE cik=?',
    [formattedCIK]
  );

  let finalOrg = '';
  let verified = false;

  if (rows.length > 0) {
    finalOrg = rows[0].org_name;
    verified = true;
  } else {
    finalOrg = filer_name;
  }

  const hash = await bcrypt.hash(password, 10);

  await db.execute(
    `INSERT INTO users 
    (org_name, cik, email, contact_name, password_hash, verified)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [finalOrg, formattedCIK, email, contact_name, hash, verified]
  );

  return json({ success: true, org_name: finalOrg });
};
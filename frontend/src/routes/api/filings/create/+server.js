import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import fs from 'fs';
import path from 'path';

export const POST = async ({ request }) => {
  console.log('🔥 API HIT');

  try {
    const formData = await request.formData();

    const def14a_link = formData.get('def14a_link');
    const item_number = formData.get('item_number') || null;
    const subject = formData.get('subject');
    const description = formData.get('description') || null;
    const contact_name = formData.get('contact_name') || null;
    const file = formData.get('file');

    console.log('📥 FORM DATA:', {
      def14a_link,
      item_number,
      subject,
      description,
      contact_name,
      file: file?.name
    });

    if (!file || !subject || !def14a_link) {
      return json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 📦 SAVE FILE
    const uploadDir = 'static/uploads';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + '-' + file.name;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    console.log('📁 FILE SAVED:', filepath);

    // 🔢 ACCESSION
    const accession = 'PX-' + Date.now();

    // 👤 USER
    let user = {};
    try {
      user = JSON.parse(request.headers.get('x-user') || '{}');
    } catch (e) {
      console.log('⚠️ USER PARSE ERROR');
    }

    console.log('👤 USER:', user);

    // 🚨 HARD SAFETY FALLBACKS (prevents DB crash)
    const safeUser = {
      id: user.id || null,
      org_name: user.org_name || 'Unknown Company',
      cik: user.cik || '',
      email: user.email || 'test@example.com',
      contact_name: user.contact_name || 'Unknown Contact'
    };

    console.log('🛡️ SAFE USER:', safeUser);

    // 🚀 INSERT
    console.log('🚀 INSERTING INTO DB...');

    const [result] = await db.execute(
      `INSERT INTO filings 
      (accession_number, company_name, company_cik, def14a_link,
       item_number, filer_user_id, filer_name, filer_cik,
       contact_name, contact_email, pdf_s3_key, pdf_filename,
       subject, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        accession,
        safeUser.org_name,
        safeUser.cik,
        def14a_link,
        item_number,
        safeUser.id,
        safeUser.org_name,
        safeUser.cik,
        contact_name || safeUser.contact_name,
        safeUser.email,
        filepath,
        filename,
        subject,
        description,
        'pending' // ✅ IMPORTANT
      ]
    );

    console.log('✅ INSERT SUCCESS:', result);

    return json({ success: true });

  } catch (err) {
    console.log('❌ FULL ERROR:', err);

    return json(
      { message: err.message || 'Server error' },
      { status: 500 }
    );
  }
};
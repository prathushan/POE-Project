<script>
  import { onMount } from 'svelte';

  let user = null;

  let def14a_link = '';
  let item_number = '';
  let subject = '';
  let description = '';
  let contact_name = '';
  let file = null;

  // ✅ Load user safely
  onMount(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      user = JSON.parse(stored);
    }
  });

  function handleFile(e) {
    file = e.target.files[0];
  }

  async function submitFiling() {
    if (!def14a_link || !subject || !file) {
      alert('Required fields missing');
      return;
    }

    if (!user) {
      alert('User not logged in');
      return;
    }

    const formData = new FormData();

    formData.append('def14a_link', def14a_link);
    formData.append('item_number', item_number);
    formData.append('subject', subject);
    formData.append('description', description);
    formData.append('contact_name', contact_name);
    formData.append('file', file);

    try {
      const res = await fetch('/api/filings/create', {
        method: 'POST',
        headers: {
          // 🔥 CRITICAL FIX — send user
          'x-user': JSON.stringify(user)
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert('Filing submitted successfully!');

        // ✅ reset form
        def14a_link = '';
        item_number = '';
        subject = '';
        description = '';
        contact_name = '';
        file = null;
      } else {
        alert('Error: ' + data.message);
      }

    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  }
</script>

<div class="auth-wrapper">
  <div class="auth-card">

    <div class="auth-logo">POE</div>

    <h2>Submit Filing</h2>

    {#if user}
      <p class="auth-sub">
        Filing as <strong>{user.org_name}</strong>
      </p>

      <div class="info-box">
        <p><strong>Company:</strong> {user.org_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>CIK:</strong> {user.cik}</p>
      </div>
    {/if}

    <label>DEF14A Link *</label>
    <input bind:value={def14a_link} placeholder="SEC filing link" />

    <label>Item Number</label>
    <input bind:value={item_number} placeholder="Optional item number" />

    <label>Subject *</label>
    <input bind:value={subject} placeholder="Filing subject" />

    <label>Description</label>
    <textarea bind:value={description} placeholder="Optional details"></textarea>

    <label>Contact Name</label>
    <input bind:value={contact_name} placeholder="Optional override" />

    <label>Upload PDF *</label>
    <input type="file" on:change={handleFile} />

    <button class="btn-auth" on:click={submitFiling}>
      SUBMIT FILING
    </button>

  </div>
</div>
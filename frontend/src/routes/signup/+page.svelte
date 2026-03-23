<script>


  import { goto } from '$app/navigation';

  let filer_name = $state('');
  let cik = $state('');
  let email = $state('');
  let contact_name = $state('');
  let password = $state('');
  let org_name = $state('');
  let message = $state('');

  async function checkCIK() {
    if (cik.length < 5) return;

    const res = await fetch(`/api/cik?cik=${cik}`);
    const data = await res.json();

    if (data.found) {
      org_name = data.org_name;

      // 🔥 auto-fill filer name also
      filer_name = data.org_name;
    } else {
      org_name = '';
    }
  }

  async function signup() {
    if (!email || !password || !cik || !contact_name) {
      message = 'All fields required';
      return;
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        cik,
        filer_name,
        contact_name
      })
    });

    const data = await res.json();

    if (data.success) {
      message = 'Signup successful! Redirecting...';

      localStorage.setItem('user', JSON.stringify({
        email,
        org_name: data.org_name
      }));

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      message = data.message;
    }
  }
</script>

<div class="auth-wrapper">
  <div class="auth-card">

    <div class="auth-logo">POE</div>

    <h2>Create Account</h2>
    <p class="auth-sub">
      Register your organization to submit exempt solicitations on the Proxy Open Exchange.
    </p>

    <label>Filer Name *</label>
    <input bind:value={filer_name} placeholder="i.e., Organization or Shareholder Name/Entity" />

    <label>Filer CIK Number *</label>
    <input bind:value={cik} on:input={checkCIK} placeholder="10-digit Central Index Key" />

    <div class="helper-links">
      <a href="#">Look up your CIK on SEC EDGAR →</a>
      <a href="#">Don't have a CIK? Register here →</a>
    </div>

    <label>Organization Email *</label>
    <input bind:value={email} placeholder="e.g., name@organization.org" />

    <small class="note">
      Must match your organization's email domain. Consumer emails are not accepted.
    </small>

    <div class="row">
      <div>
        <label>Contact Name *</label>
        <input bind:value={contact_name} placeholder="Full name" />
      </div>

      <div>
        <label>Password *</label>
        <input type="password" bind:value={password} placeholder="Min. 8 characters" />
      </div>
    </div>

    <button class="btn-auth" on:click={signup}>
      CREATE ACCOUNT
    </button>

    <p class="auth-footer">
      Already have an account?
      <!-- <a href="/login">Sign in</a> -->
       <a href="#" on:click={() => goto('/login')}>Sign in</a>
    </p>

    <p>{message}</p>

  </div>
</div>
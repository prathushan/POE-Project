<!-- <script>
  let email = $state('');
  let password = $state('');

  async function login() {
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    window.location.href = '/dashboard';
  }
</script> -->
<script>
  let email = $state('');
  let password = $state('');
  let message = $state('');

  async function login() {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
      // ✅ store FULL user
      localStorage.setItem('user', JSON.stringify(data.user));

      message = 'Login successful! Redirecting...';

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } else {
      message = data.message;
    }
  }
</script>


<div class="auth-wrapper">
  <div class="auth-card">

    <div class="auth-logo">POE</div>

    <h2>Sign In</h2>
    <p class="auth-sub">Sign in to submit exempt solicitations.</p>

    <label>Email</label>
    <input bind:value={email} placeholder="your@organization.org" />

    <label>Password</label>
    <input type="password" bind:value={password} placeholder="Password" />

    <button class="btn-auth" on:click={login}>SIGN IN</button>

    <p class="auth-footer">
      Don't have an account?
      <a href="/signup">Create one</a>
    </p>

  </div>
</div>
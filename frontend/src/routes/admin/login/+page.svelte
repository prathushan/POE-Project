
<script>
  let email = '';
  let password = '';

  async function login() {
    console.log('LOGIN DATA:', email, password); // 🔍 debug

    if (!email || !password) {
      alert('Please enter credentials');
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('admin', JSON.stringify(data.admin));
        window.location.href = '/admin/dashboard';
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  }
</script>

<div class="auth-wrapper">
  <div class="auth-card">

    <div class="auth-logo">POE</div>

    <h2>Admin Portal</h2>
    <p class="auth-sub">Sign in to review and manage filings.</p>

    <!-- 🔥 IMPORTANT: NO default value, user must type -->
    <input
      placeholder="Enter admin username"
      bind:value={email}
    />

    <input
      type="password"
      placeholder="Enter password"
      bind:value={password}
    />

    <button class="btn-auth" on:click={login}>
      SIGN IN
    </button>

    <!-- <p class="hint">Use: admin / admin123</p> -->

  </div>
</div>

<style>
  .auth-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f1ec;
  }

  .auth-card {
    width: 400px;
    padding: 40px;
    background: white;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .auth-logo {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 3px solid #d4af37;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #1f3b5b;
  }

  h2 {
    margin-bottom: 5px;
    color: #1f3b5b;
  }

  .auth-sub {
    font-size: 14px;
    margin-bottom: 20px;
    color: #666;
  }

  input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }

  .btn-auth {
    width: 100%;
    padding: 12px;
    background: #1f3b5b;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
  }

  .hint {
    margin-top: 15px;
    font-size: 12px;
    color: #999;
  }
</style>
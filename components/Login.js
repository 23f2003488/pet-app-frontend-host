const Login = {
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
          <input type="text" v-model="username" placeholder="Username" required :disabled="loading" />
          <input type="password" v-model="password" placeholder="Password" required :disabled="loading" />
          <button type="submit" :disabled="loading" :class="{ loading: loading }">
            <span v-if="!loading">Login</span>
            <span v-else><span class="spinner"></span> Logging you in...</span>
          </button>
        </form>
        <p class="register-link">
          Don't have an account? <router-link to="/register"><a href="#/register">Register here</a></router-link>
        </p>
      </div>
    </div>
  `,
  data() {
    return {
      username: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      try {
        const response = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/authentication/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        const result = await response.json();

        if (!response.ok) {
          alert("❌ Login failed: " + (result.message || "Invalid credentials"));
          this.loading = false;
          return;
        }

        localStorage.setItem("accessToken", result.access_token);
        alert("✅ Login successful!");
        if(this.username==='admin'){
          window.location.hash = "#/admindashboard";
        }else{
          window.location.hash = "#/dashboard";
        }
        
      } catch (error) {
        alert("❌ Login error1: " + error.message);
        console.error("Login failed:", error);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      alert("⚠️ You're already logged in.");
      window.location.hash = "#/dashboard";
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #e1f5fe;
        text-align: center;
      }

      .login-box {
        background: #ffffff;
        padding: 40px;
        border-radius: 30px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        width: 300px;
        animation: fadeIn 0.5s ease;
      }

      h2 {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        color: #0288d1;
        margin-bottom: 20px;
      }

      input[type="text"],
      input[type="password"] {
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        border: 2px solid #b3e5fc;
        border-radius: 20px;
        box-sizing: border-box;
        font-size: 1rem;
      }

      button {
        background-color: #0288d1;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 1rem;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        margin-top: 10px;
      }

      button.loading {
        background-color: #81d4fa;
        cursor: not-allowed;
        opacity: 0.7;
      }

      button.loading .spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid white;
        border-top: 2px solid #0288d1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
      }

      button:hover:not(.loading) {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(2, 136, 209, 0.3);
      }

      .register-link {
        margin-top: 15px;
        font-size: 0.9rem;
        color: #555;
      }

      .register-link a {
        color: #0288d1;
        text-decoration: none;
        font-weight: bold;
      }

      .register-link a:hover {
        text-decoration: underline;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

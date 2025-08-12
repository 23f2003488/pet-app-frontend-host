const Register = {
  template: `
    <div class="register-container">
      <div class="register-box">
        <h2>Register</h2>
        <form @submit.prevent="handleRegister">
          <input type="email" v-model="email" placeholder="Email" required />
          <input type="text" v-model="username" placeholder="Username" required />
          <input type="password" v-model="password" placeholder="Password" required />
          <select v-model="age" required>
            <option disabled value="">Select Age</option>
            <option v-for="n in 7" :key="n" :value="n + 7">{{ n + 7 }}</option>
          </select>
          <button type="submit">Create Account</button>
        </form>
        <p class="login-link">
          Already have an account? <router-link to="/login"><a href="#/login">Login here</a></router-link>
        </p>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      username: '',
      password: '',
      age: ''
    };
  },
  methods: {
    async handleRegister() {
      try {
        const response = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/authentication/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: this.email,
            username: this.username,
            password: this.password,
            age: parseInt(this.age),
            role: "Child"
          })
        });

        const data = await response.json();

        if (response.ok) {
          alert("🎉 Registration successful! You can now login.");
          window.location.hash = "#/login";
        } else {
          alert("❌ Registration failed: " + (data?.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("🚨 Network or server error during registration.");
      }
    }
  },
  mounted() {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      alert("⚠️ You're already logged in. Please logout to register a new account.");
      window.location.hash = "#/dashboard";
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f3e5f5;
        text-align: center;
      }

      .register-box {
        background: #ffffff;
        padding: 40px;
        border-radius: 30px;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        width: 320px;
        animation: fadeIn 0.5s ease;
      }

      h2 {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        color: #ab47bc;
        margin-bottom: 20px;
      }

      input[type="text"],
      input[type="password"],
      input[type="email"],
      select {
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        border: 2px solid #e1bee7;
        border-radius: 20px;
        font-size: 1rem;
        box-sizing: border-box;
      }

      select {
        background-color: #f9f9f9;
      }

      button {
        background-color: #ab47bc;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 1rem;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        margin-top: 10px;
      }

      button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(171, 71, 188, 0.3);
      }

      .login-link {
        margin-top: 15px;
        font-size: 0.9rem;
        color: #555;
      }

      .login-link a {
        color: #ab47bc;
        text-decoration: none;
        font-weight: bold;
      }

      .login-link a:hover {
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
    `;
    document.head.appendChild(style);
  }
};

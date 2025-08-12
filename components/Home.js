const Home = {
  template: `
    <div class="home-container">
      <div class="home-content">
        <h1>Welcome to Pawket Money!</h1>
        <p>Manage your virtual pet and learn to handle money wisely.</p>
       <button class="play-button" @click="goToNext">PLAY</button>
      </div>
    </div>
  `,
   methods: {
    goToNext() {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (user) {
        window.location.hash = "#/dashboard";
      } else {
        window.location.hash = "#/login";
      }
    }
  },
  mounted() {
    const style = document.createElement('style')
    style.textContent = `
      .home-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('assets/img/backgrounds/indoor.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;
}


      .home-content {
  background: rgba(255, 255, 255, 0.76); /* translucent white */
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(10px);   /* for Safari */
  padding: 40px;
  border-radius: 30px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  animation: popIn 0.6s ease-out;
  color: #000;
}


      h1 {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        font-size: 2.5rem;
        margin-bottom: 10px;
        color: #ff4081;
      }

      p {
        font-size: 1.2rem;
        margin-bottom: 20px;
        color: #555;
      }

      .play-button {
        background-color: #ff4081;
        border: none;
        border-radius: 25px;
        padding: 12px 30px;
        font-size: 1.2rem;
        color: white;
        cursor: pointer;
        font-weight: bold;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .play-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 12px rgba(255, 64, 129, 0.3);
      }

      @keyframes popIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)
  }
}

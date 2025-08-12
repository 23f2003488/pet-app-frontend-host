const Dashboard = {
  template: `
    <div class="dashboard-container">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Preparing your dashboard...</p>
      </div>

      <div v-else>
        <!-- Top Icons -->
        <div class="top-icons">
          <button class="icon-button graph-button" @click="goToProgress" title="View Progress">
            <i class="fas fa-chart-line"></i>
          </button>
          <button class="help-button" @click="goToHelp" title="Help">❓</button>
        </div>

        <audio id="barkSound" src="assets/sounds/bark.mp3"></audio>

        <!-- Pet -->
        <img class="pet-image" :src="petImage" alt="Virtual Pet" @mouseenter="playBark" />

        <!-- Left Panel -->
        <div class="left-panel">
          <div class="bar hunger-bar">
            <label>Hunger</label>
            <div class="bar-fill" :style="{ width: hunger + '%' }">
              <span class="bar-text">{{ hunger }}%</span>
            </div>
          </div>
          <div class="bar happiness-bar">
            <label>Happiness</label>
            <div class="bar-fill" :style="{ width: happiness + '%' }">
              <span class="bar-text">{{ happiness }}%</span>
            </div>
          </div>
          <button class="small-button shop-button" @click="goToShop">Shop</button>
        </div>

        <!-- Stats Box -->
        <div class="stat-box">
          <div><strong>Coins:</strong> {{ money }}</div>
          <div><strong>XP:</strong> {{ xp }}</div>
        </div>

        <!-- Quest -->
        <button class="big-button quest-button" @click="goToQuest">Start Quest</button>
        <button class="power-button" @click="handleLogout" title="Logout">
          <i class="fas fa-power-off"></i>
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      hunger: 100,
      happiness: 100,
      money: 0,
      xp: 0,
      petImage: "assets/img/pets/pet2.png",
      loading: true
    };
  },
  methods: {
    async handleLogout() {
      const accessToken = localStorage.getItem("accessToken");
      try {
        await fetch("https://iitmod-lifeskills.onrender.com/api/v1/authentication/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
      } catch (err) {
        console.warn("Logout request failed:", err.message);
      }
      localStorage.removeItem("accessToken");
      alert("You have been logged out.");
      window.location.hash = "#/login";
    },
    goToShop() {
      window.location.hash = "#/shop";
    },
    goToHelp() {
      window.location.hash = "#/help";
    },
    goToQuest() {
      window.location.hash = "#/quest";
    },
    goToProgress() {
      window.location.hash = "#/progress";
    },
    playBark() {
      const sound = document.getElementById("barkSound");
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    },
  },
  mounted() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("❌ No access token found. Please log in again.");
      window.location.hash = "#/login";
      return;
    }

    const fetchUserData = (retry = false) => {
      fetch("https://iitmod-lifeskills.onrender.com/api/v1/users/get", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch user data");
          return response.json();
        })
        .then((data) => {
          this.money = data.userStats?.money ?? 0;
          this.xp = data.userStats?.experience ?? 0;
          this.hunger = data.petInfo?.hunger ?? 100;
          this.happiness = data.petInfo?.happiness ?? 100;
          this.loading = false;
        })
        .catch((error) => {
          console.error("⚠️ Dashboard load error:", error.message);
          if (!retry && (error.message.includes("NetworkError") || error.message.includes("Failed to fetch"))) {
            setTimeout(() => fetchUserData(true), 500);
          } else {
            alert("❌ Failed to load your data. Please log in again.");
            localStorage.removeItem("accessToken");
            window.location.hash = "#/login";
          }
        });
    };

    fetchUserData();

    // Inject style
    const style = document.createElement("style");
    style.textContent = `

      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255,255,255,0.85);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 1.2rem;
        font-family: 'Comic Sans MS', cursive;
        color: #333;
      }

      .loading-spinner {
        border: 6px solid #f3f3f3;
        border-top: 6px solid #42a5f5;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

    
      .dashboard-container {
        position: relative;
        height: 100vh;
        width: 100%;
        background-image: url('assets/img/backgrounds/dash-bg.jpeg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        font-family: 'Comic Sans MS', cursive, sans-serif;
        overflow: hidden;
      }
       
      .top-icons {
  position: absolute;
  top: 100px;
  right: 10px;
  display: flex;
  gap: 12px;
  z-index: 10;
  align-items: center;
}

/* Power button (red) */
.power-button {
  background-color: #ff3b3b;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
  margin-top: 508px;
  margin-left: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.power-button:hover {
  transform: scale(1.1);
  background-color: #d62828;
}

/* Help button (blue) */
.help-button {
  background-color:rgb(93, 191, 247);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.help-button:hover {
  transform: scale(1.1);
  background-color: #1976d2;
}



      .left-panel {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1;
      }

      .bar {
        width: 150px;
        background: #ffe0b2;
        border-radius: 20px;
        padding: 5px;
        box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
      }

      .bar label {
        font-size: 0.85rem;
        margin-left: 5px;
      }

      .bar-fill {
        height: 16px;
        border-radius: 15px;
        transition: width 0.3s ease;
        margin-top: 4px;
      }

      .hunger-bar .bar-fill {
        background-color: #ffa726;
      }

      .happiness-bar .bar-fill {
        background-color: #42a5f5;
      }

      .small-button {
        background-color: #ab47bc;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        cursor: pointer;
        min-width: 90px;
        min-height: 36px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transition: all 0.2s ease-in-out;
      }

      .small-button:hover {
        transform: scale(1.05);
      }

      .shop-button {
        background-color: rgb(252, 149, 70);
        font-weight: bold;
        color: #333;
      }
        .bar-fill {
  position: relative;
  height: 16px;
  border-radius: 15px;
  transition: width 0.3s ease;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.bar-text {
  position: absolute;
  width: 100%;
  text-align: center;
  z-index: 1;
}

      .graph-button {
  position: absolute;
  top: 1px;
  right: 50px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 70%;
  font-size: 1.3rem;
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.3s ease;
}

.graph-button:hover {
  transform: scale(1.1);
  background-color: #388e3c;
}


      .stat-box{
        background-color:rgb(249, 155, 100);
        border: 1px solid black;
        width: 110px;
        height: 50px;
        padding-left: 10px;
        padding-top: 5px;
        padding-bottom: 5px;
        margin-left: 1200px;
        margin-top: 20px;
        border-radius: 10px;
      }

      .big-button.quest-button {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #66bb6a;
        padding: 16px 40px;
        font-size: 1.2rem;
        border-radius: 30px;
        font-weight: bold;
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        transition: all 0.2s ease-in-out;
      }

      .quest-button:hover {
        transform: translateX(-50%) scale(1.05);
      }

      .pet-image {
        position: absolute;
        top: 67%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 200px;
        height: auto;
        z-index: 1;
        animation: float 2.5s ease-in-out infinite;
      }

      @keyframes float {
        0%   { transform: translate(-50%, -50%) scale(1); }
        50%  { transform: translate(-50%, -52%) scale(1.03); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
};

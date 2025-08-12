const Help = {
  template: `
    <div class="help-container">
      <div class="help-box">
        <h2>📖 Game Guide: Take Care of Your Pet!</h2>

        <p>Welcome to <strong>Pawket Money</strong> 🐾 – where you care for your pet while learning money skills!</p>

        <ul>
          <li>💖 <strong>Keep your pet Happy & Fed:</strong><br/>
            Your pet has <span class="highlight">Hunger</span> and <span class="highlight">Happiness</span> bars.<br/>
            Don’t let them drop below 10%! Or you’ll lose:<br/>
            <span class="penalty">❌ -50 XP</span> for Hunger, and <span class="penalty">❌ -50 XP</span> for Happiness!
          </li>

          <li>🧠 <strong>Attempt Quizzes:</strong><br/>
            Earn rewards by playing quizzes!<br/>
            ✅ <span class="reward">+10 XP</span> and <span class="reward">+20 Coins</span> for every correct answer.<br/>
            ❌ <span class="penalty">-5 XP</span> for every wrong answer.
          </li>

          <li>🛍️ <strong>Visit the Shop:</strong><br/>
            Buy food to refill the Hunger bar 🍎<br/>
            Buy costumes & accessories 🎩 to cheer up your pet!
          </li>

          <li>🎁 <strong>Unlock Surprise Gifts:</strong><br/>
            Complete <span class="highlight">500 XP</span>, <span class="highlight">1000 XP</span>, etc. to unlock special rewards!<br/>
           
          </li>

          <li>🎯 <strong>What’s Your Goal?</strong><br/>
            Keep your pet happy, smart, and stylish! 😎<br/>
            Master your XP and Coins like a money hero! 💰🧠
          </li>
        </ul>

        <button class="back-button" @click="goToDashboard">Back to Dashboard</button>
      </div>
    </div>
  `,
  methods: {
    goToDashboard() {
      window.location.hash = "#/dashboard";
    }
  },
  mounted() {
    const style = document.createElement("style");
    style.textContent = `
      .help-container {
        background-color: #f3e5f5;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Comic Sans MS', cursive, sans-serif;
        padding: 20px;
      }

      .help-box {
        background: #fff;
        padding: 30px 40px;
        border-radius: 30px;
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        width: 600px;
        max-width: 90%;
        color: #333;
      }

      h2 {
        color: #8e24aa;
        margin-bottom: 20px;
        text-align: center;
      }

      ul {
        padding-left: 20px;
        margin-bottom: 20px;
      }

      li {
        margin-bottom: 16px;
        line-height: 1.5;
      }

      .highlight {
        color: #d81b60;
        font-weight: bold;
      }

      .reward {
        color: #43a047;
        font-weight: bold;
      }

      .penalty {
        color: #e53935;
        font-weight: bold;
      }

      .back-button {
        background-color: #8e24aa;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 1rem;
        cursor: pointer;
        display: block;
        margin: 0 auto;
        box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        transition: transform 0.2s ease-in-out;
      }

      .back-button:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
  }
};

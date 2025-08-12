const Quest = {
  template: `
    <div class="quest-container">
      <div v-if="loading" class="loader-overlay">
        <div class="spinner"></div>
      </div>

      <div v-else class="quest-box">
        <h2>🗺️ Quest Time!</h2>
        <p class="intro-text">Your quest is to answer the questions correctly!</p>

        <div v-if="quizLocked" class="locked-msg">
          🕒 You’ve already taken the quest!
        </div>

        <div v-else>
          <div v-for="(q, index) in questions" :key="index" class="question-block">
            <p><strong>Q{{ index + 1 }}: {{ q.question_text }}</strong></p>

            <div v-if="q.question_type === 'mcq'">
              <div v-for="(opt, i) in q.options" :key="i">
                <label>
                  <input type="radio" :name="'q' + index" :value="opt" v-model="q.userAnswer">
                  {{ opt }}
                </label>
              </div>
            </div>

            <div v-else-if="q.question_type === 'true_false'">
              <label><input type="radio" :name="'q' + index" value="True" v-model="q.userAnswer"> True</label>
              <label><input type="radio" :name="'q' + index" value="False" v-model="q.userAnswer"> False</label>
            </div>
          </div>

          <button v-if="!submitted" class="submit-button" @click="submitQuiz" :disabled="submitting">
            Submit Answers
            <span v-if="submitting" class="mini-spinner"></span>
          </button>
        </div>

        <div v-if="showResults" class="results">
          <h3>🎉 Results</h3>
          <p>Correct Answers: {{ correctCount }}</p>
          <p>Incorrect Answers: {{ incorrectCount }}</p>
          <p>XP Earned: {{ xpEarned }}</p>
          <p>Coins Earned: ₹{{ coinsEarned }}</p>
        </div>

        <button class="submit-button" @click="goToDashboard">Back to Dashboard</button>
      </div>
    </div>
  `,
  data() {
    return {
      questions: [],
      correctCount: 0,
      incorrectCount: 0,
      xpEarned: 0,
      coinsEarned: 0,
      showResults: false,
      quizLocked: false,
      loading: true,
      submitting: false,
      submitted: false
    };
  },
  methods: {
    goToDashboard() {
      window.location.hash = "#/dashboard";
    },
    async submitQuiz() {
      const token = localStorage.getItem("accessToken");
      if (!token) return alert("Access token missing. Please login again.");

      this.submitting = true;

      // Create answers array for request
      const answersPayload = this.questions.map(q => ({
        question_id: q._id,
        answer: q.userAnswer
      }));

      try {
        const res = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/questions/submit/many", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ answers: answersPayload })
        });

        const data = await res.json();
        const results = data.results || [];

        let correct = 0, xp = 0, money = 0;

        results.forEach((result, index) => {
          if (result.success && result.status === "CORRECT") {
            correct++;
            xp += this.questions[index].reward_experience;
            money += this.questions[index].reward_money;
          }
        });

        this.correctCount = correct;
        this.incorrectCount = this.questions.length - correct;
        this.xpEarned = xp;
        this.coinsEarned = money;
        this.showResults = true;
        this.submitted = true;
      } catch (error) {
        console.error("❌ Submission failed:", error.message);
        alert("Something went wrong during submission.");
      }

      this.submitting = false;
    },
    async fetchQuestions() {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const res = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/questions/get", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        this.questions = data.questions.map(q => ({ ...q, userAnswer: "" }));
        this.loading = false;
      } catch (err) {
        console.error("❌ Failed to fetch questions:", err.message);
        alert("Error loading questions. Please try again later.");
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchQuestions();

    const style = document.createElement("style");
    style.textContent = `
      .quest-container {
        background-color: #fffde7;
        min-height: 100vh;
        padding: 50px 0;
        font-family: 'Comic Sans MS', cursive, sans-serif;
        position: relative;
      }

      .quest-box {
        background: #fff;
        padding: 30px;
        border-radius: 30px;
        width: 90%;
        max-width: 600px;
        margin: 0 auto;
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      }

      .quest-box h2 {
        position: sticky;
        top: 0;
        background: #fff;
        padding: 10px;
        z-index: 10;
        border-radius: 15px 15px 0 0;
      }

      .intro-text {
        margin-bottom: 20px;
        color: #333;
      }

      .locked-msg {
        color: #ff7043;
        font-size: 1.1rem;
        font-weight: bold;
      }

      .question-block {
        margin: 20px 0;
        text-align: left;
      }

      label {
        display: block;
        margin: 5px 0;
      }

      .submit-button {
        margin-top: 20px;
        background-color: #66bb6a;
        color: white;
        border: none;
        padding: 12px 25px;
        border-radius: 25px;
        font-size: 1rem;
        cursor: pointer;
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
      }

      .submit-button:hover {
        transform: scale(1.05);
      }

      .results {
        margin-top: 30px;
        background-color: #e8f5e9;
        border-radius: 20px;
        padding: 20px;
      }

      .results p {
        font-size: 1rem;
        margin: 10px 0;
      }

      .loader-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #fffde7;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #ccc;
        border-top: 5px solid #ff7043;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .mini-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        margin-left: 10px;
        border: 3px solid #fff;
        border-top: 3px solid #ff7043;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        vertical-align: middle;
      }

      .submit-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
        filter: blur(0.5px);
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

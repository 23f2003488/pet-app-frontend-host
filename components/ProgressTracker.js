const ProgressTracker = {
  template: `
    <div class="progress-container">
      <div class="progress-box" v-if="loaded">
        <h2>Your Progress Overview</h2>

        <div class="stats-grid">
          <div><strong>Total XP:</strong> {{ progress.experience }}</div>
          <div><strong>Total Earnings:</strong> ₹{{ progress.total_earnings }}</div>
          <div><strong>Total Spent:</strong> ₹{{ progress.total_spent }}</div>
          <div><strong>Balance:</strong> ₹{{ progress.money_balance }}</div>
          <div><strong>Correct:</strong> {{ progress.correct_questions }}</div>
          <div><strong>Incorrect:</strong> {{ progress.incorrect_questions }}</div>
        </div>

        <canvas id="progressChart" height="200"></canvas>

        <h3>Recent Transactions</h3>
        <ul class="transactions">
          <li v-for="tx in paginatedTransactions" :key="tx.id">
            <span>{{ formatDate(tx.date) }}</span> —
            <strong>{{ tx.category }}</strong>:
            {{ tx.transaction_type }} ₹{{ tx.amount }}
          </li>
        </ul>

        <!-- Pagination Controls -->
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">← Prev</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next →</button>
        </div>

        <button class="back-button" @click="goToDashboard">Back to Pet</button>
      </div>

      <div v-else class="loading-screen">
        <div class="loader"></div>
        <p>Loading your progress...</p>
      </div>
    </div>
  `,
  data() {
    return {
      progress: {},
      transactions: [],
      chartLabels: [],
      xpSeries: [],
      moneySeries: [],
      loaded: false,
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.transactions.length / this.itemsPerPage);
    },
    paginatedTransactions() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.transactions.slice(start, start + this.itemsPerPage);
    }
  },
  methods: {
    async fetchData() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please log in again.");
        window.location.hash = "#/login";
        return;
      }

      try {
        const resProg = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/progress", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resProg.ok) throw new Error("Progress request failed");
        this.progress = await resProg.json();

        const resTxns = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/transactions/get?limit=100", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resTxns.ok) throw new Error("Transactions request failed");
        const txData = await resTxns.json();
        this.transactions = (txData.transactions || []).reverse();


        this.prepareChartData();
        this.loaded = true;
        this.$nextTick(() => this.drawChart());
      } catch (err) {
        console.error(err);
        alert("Failed to load progress. Please try again later.");
        window.location.hash = "#/dashboard";
      }
    },
    prepareChartData() {
  const grouped = {};
  this.transactions.forEach(t => {
    const day = new Date(t.date).toLocaleDateString("en-GB");
    if (!grouped[day]) grouped[day] = { xp: 0, money: 0 };
    if (t.category === "Experience") grouped[day].xp += t.amount;
    if (t.category === "Money" && t.transaction_type === "Credit") grouped[day].money += t.amount;
  });

  const dates = Object.keys(grouped).sort((a, b) =>
    new Date(a.split("/").reverse().join("-")) - new Date(b.split("/").reverse().join("-"))
  );
  const lastDates = dates.slice(-10);

  // Calculate cumulative totals
  let cumulativeXP = 0;
  let cumulativeMoney = 0;
  this.chartLabels = lastDates;
  this.xpSeries = [];
  this.moneySeries = [];

  lastDates.forEach(d => {
    cumulativeXP += grouped[d].xp;
    cumulativeMoney += grouped[d].money;
    this.xpSeries.push(cumulativeXP);
    this.moneySeries.push(cumulativeMoney);
  });
}
,
    drawChart() {
      const ctx = document.getElementById("progressChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: this.chartLabels,
          datasets: [
            {
              label: "XP Earned",
              data: this.xpSeries,
              borderColor: "#4caf50",
              backgroundColor: "rgba(76, 175, 80, 0.2)",
              fill: true,
              tension: 0.3
            },
            {
              label: "Money Earned",
              data: this.moneySeries,
              borderColor: "#ff9800",
              backgroundColor: "rgba(255, 152, 0, 0.2)",
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    },
    formatDate(dt) {
      return new Date(dt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
    },
    goToDashboard() {
      window.location.hash = "#/dashboard";
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    }
  },
  mounted() {
    const style = document.createElement("style");
    style.textContent = `
      .progress-container {
        font-family: 'Comic Sans MS', cursive, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: #f0f9f4;
        padding: 20px;
        overflow: auto;
      }

      .progress-box {
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        max-width: 500px;
        width: 100%;
        text-align: center;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        font-size: 1.1rem;
        color: #333;
        margin-bottom: 20px;
      }

      .transactions {
        list-style: none;
        text-align: left;
        padding: 0;
        margin-top: 15px;
      }

      .transactions li {
        background: #e8f5e9;
        padding: 8px 12px;
        border-radius: 8px;
        margin-bottom: 6px;
        font-size: 0.95rem;
      }

      .pagination {
        margin: 15px 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
      }

      .pagination button {
        background-color: #81c784;
        border: none;
        padding: 6px 14px;
        border-radius: 20px;
        color: white;
        font-weight: bold;
        cursor: pointer;
      }

      .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .back-button {
        margin-top: 20px;
        background: #66bb6a;
        color: white;
        border: none;
        padding: 10px 25px;
        border-radius: 20px;
        font-size: 1rem;
        cursor: pointer;
      }

      .back-button:hover {
        background: #4caf50;
      }

      .loading-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #555;
        font-size: 1.2rem;
        height: 100vh;
      }

      .loader {
        border: 4px solid #eee;
        border-top: 4px solid #66bb6a;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        animation: spin 1s linear infinite;
        margin-bottom: 12px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    this.fetchData();
  }
};

const AdminDashboard = {
  template: `
    <div>
      <div v-if="!isReady" class="initial-page-loader">
        <p>🚀 Initializing Dashboard...</p>
      </div>

      <div v-show="isReady" class="admin-container">
        <div class="admin-header">
          <h2> Admin Dashboard</h2>
          <button class="back-to-dash-btn" @click="handleLogout">Logout</button>
        </div>

        <div class="admin-tabs">
          <button @click="activeTab = 'questions'" :class="{ active: activeTab === 'questions' }">Manage Questions</button>
          <button @click="activeTab = 'shop'" :class="{ active: activeTab === 'shop' }">Manage Shop Items</button>
        </div>

        <div v-if="pageLoading" class="loading-indicator">Loading data, please wait...</div>

        <div v-if="activeTab === 'questions' && !pageLoading" class="admin-section">
            <div class="section-header">
                <h3> Quiz Questions</h3>
                <button class="add-new-btn" @click="openAddQuestionModal">➕ Add Question</button>
            </div>
            <div class="admin-grid">
                <div v-for="(q, index) in questions" :key="q._id" class="admin-card">
                    <p class="card-title"><strong>Q{{ index + 1 }}:</strong> {{ q.question_text }}</p>
                    <p><strong>Type:</strong> {{ q.question_type.toUpperCase() }}</p>
                    <div v-if="q.options">
                        <p><strong>Options:</strong> {{ q.options.join(', ') }}</p>
                    </div>
                    <p><strong>Rewards:</strong> Coins {{ q.reward_money }} | XP {{ q.reward_experience }}</p>
                    <div class="card-actions">
                        <button class="edit-btn" @click="openEditQuestionModal(q)"> Edit</button>
                        <button class="delete-btn" @click="deleteQuestion(q._id)"> Delete</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'shop' && !pageLoading" class="admin-section">
            <div class="section-header">
                <h3> Shop Items</h3>
                <button class="add-new-btn" @click="openAddItemModal">➕ Add Shop Item</button>
            </div>
            <div class="admin-grid">
                <div v-for="item in shopItems" :key="item.id" class="admin-card">
                    <div class="shop-card-header">
                        <img :src="item.image_url" :alt="item.name" class="shop-item-img">
                        <p class="card-title">{{ item.name }}</p>
                    </div>
                    <p><strong>Category:</strong> {{ item.category }}</p>
                    
                    <p v-if="item.category === 'Gifts'"><strong>Price:</strong> XP {{ item.xp_price }}</p>
                    <p v-else><strong>Price:</strong> Coin {{ item.money_price }}</p>

                    <p><strong>Effects:</strong> Hunger: {{ item.hunger_effect }} | Happiness: {{ item.happiness_effect }}</p>
                    <p><strong>Equipable:</strong> {{ item.equipable ? 'Yes' : 'No' }}</p>
                    <div class="card-actions">
                        <button class="edit-btn" @click="openEditItemModal(item)"> Edit</button>
                        <button class="delete-btn" @click="deleteItem(item.id)"> Delete</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div v-if="showQuestionModal" class="modal-backdrop">
            <div class="modal-content">
                <h3>{{ editingQuestion ? 'Edit Question' : 'Add Question' }}</h3>
                <input class="form-input" v-model="questionForm.question_text" placeholder="Question text" />
                <select class="form-input" v-model="questionForm.question_type">
                    <option disabled value="">Select question type</option>
                    <option value="mcq">MCQ</option>
                    <option value="true_false">True/False</option>
                </select>
                <div v-if="questionForm.question_type === 'mcq'">
                    <label>Options:</label>
                    <div v-for="(opt, i) in questionForm.options" :key="i" class="option-input-group">
                        <input class="form-input" v-model="questionForm.options[i]" placeholder="Option text" />
                        <button class="remove-option-btn" @click="questionForm.options.splice(i, 1)">-</button>
                    </div>
                    <button class="add-option-btn" @click="questionForm.options.push('')">Add Option</button>
                </div>
                <input class="form-input" v-model="questionForm.correct_answer" placeholder="Correct Answer" />
                
                <div v-if="!editingQuestion">
                  <input class="form-input" v-model.number="questionForm.reward_money" placeholder="Reward Money" type="number" disabled />
                  <input class="form-input" v-model.number="questionForm.reward_experience" placeholder="Reward XP" type="number" disabled />
                </div>

                <div class="modal-actions">
                    <button class="cancel-btn" @click="closeQuestionModal">Cancel</button>
                    <button class="save-btn" @click="saveQuestion" :disabled="formLoading">
                        <span v-if="formLoading">Saving...</span>
                        <span v-else>Save</span>
                    </button>
                </div>
            </div>
        </div>
        <div v-if="showItemModal" class="modal-backdrop">
            <div class="modal-content">
                <h3>{{ editingItem ? 'Edit Item' : 'Add Item' }}</h3>
                <input class="form-input" v-model="itemForm.name" placeholder="Item name" />
                
                <select class="form-input" v-model="itemForm.category">
                    <option disabled value="">Select a Category</option>
                    <option value="Food">Food</option>
                    <option value="Costumes">Costumes</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Gifts">Gifts</option>
                </select>

                <input v-if="itemForm.category !== 'Gifts'" class="form-input" v-model.number="itemForm.money_price" placeholder="Money Price" type="number" />
                <input v-if="itemForm.category === 'Gifts'" class="form-input" v-model.number="itemForm.xp_price" placeholder="XP Price" type="number" />

                <input class="form-input" v-model.number="itemForm.hunger_effect" placeholder="Hunger Effect" type="number" />
                <input class="form-input" v-model.number="itemForm.happiness_effect" placeholder="Happiness Effect" type="number" />
                <input class="form-input" v-model="itemForm.image_url" placeholder="Image URL" />
                <label class="checkbox-label">
                    <input type="checkbox" v-model="itemForm.equipable" />
                    Is this item equipable?
                </label>
                <div class="modal-actions">
                    <button class="cancel-btn" @click="closeItemModal">Cancel</button>
                    <button class="save-btn" @click="saveItem" :disabled="formLoading">
                        <span v-if="formLoading">Saving...</span>
                        <span v-else>Save</span>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      isReady: false,
      activeTab: 'questions',
      questions: [],
      shopItems: [],
      showQuestionModal: false,
      showItemModal: false,
      editingQuestion: null,
      editingItem: null,
      pageLoading: true,
      formLoading: false,
      questionForm: {},
      itemForm: {}
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
    formatAnswer(ans) {
      if (typeof ans === 'boolean') return ans ? 'True' : 'False';
      return ans;
    },
    goToDashboard() {
      window.location.hash = "#/dashboard";
    },
    async fetchQuestions() {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/admin/question/get", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Could not fetch questions.");
        const data = await response.json();
        this.questions = data.questions || [];
      } catch (error) {
        alert(error.message);
      }
    },
    async fetchShopItems() {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/store/items", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Could not fetch shop items.");
        const data = await response.json();
        this.shopItems = Object.values(data).flat();
      } catch (error) {
        alert(error.message);
      }
    },
    openAddQuestionModal() {
      this.editingQuestion = null;
      // CHANGE 2: Reward values are now fixed for new questions
      this.questionForm = { question_text: '', question_type: 'mcq', options: [''], correct_answer: '', reward_money: 10, reward_experience: 20 };
      this.showQuestionModal = true;
    },
    openEditQuestionModal(q) {
      this.editingQuestion = q._id;
      this.questionForm = JSON.parse(JSON.stringify(q));
      this.showQuestionModal = true;
    },
    closeQuestionModal() {
      this.showQuestionModal = false;
    },
    async saveQuestion() {
      this.formLoading = true;
      try {
        const token = localStorage.getItem("accessToken");
        let url, method, body;
        if (this.editingQuestion) {
          url = "https://iitmod-lifeskills.onrender.com/api/v1/admin/question/update";
          method = "PUT";
          body = { ...this.questionForm, _id: this.editingQuestion };
        } else {
          url = "https://iitmod-lifeskills.onrender.com/api/v1/admin/question/create";
          method = "POST";
          body = this.questionForm;
        }
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error("Failed to save the question.");
        await this.fetchQuestions();
        this.closeQuestionModal();
      } catch (error) {
        alert(error.message);
      } finally {
        this.formLoading = false;
      }
    },
    async deleteQuestion(id) {
      if (!confirm("Are you sure?")) return;
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`https://iitmod-lifeskills.onrender.com/api/v1/admin/question/delete/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to delete the question.");
        this.fetchQuestions();
      } catch (error) {
        alert(error.message);
      }
    },
    openAddItemModal() {
      this.editingItem = null;
      this.itemForm = { name: '', category: 'Food', money_price: 0, xp_price: 0, hunger_effect: 0, happiness_effect: 0, equipable: false, image_url: '' };
      this.showItemModal = true;
    },
    openEditItemModal(item) {
      this.editingItem = item.id;
      this.itemForm = JSON.parse(JSON.stringify(item));
      this.showItemModal = true;
    },
    closeItemModal() {
      this.showItemModal = false;
    },
    async saveItem() {
      this.formLoading = true;
      try {
        const token = localStorage.getItem("accessToken");
        let url, method, body;
        if (this.editingItem) {
          url = "https://iitmod-lifeskills.onrender.com/api/v1/admin/store/update";
          method = "PUT";
          body = { ...this.itemForm, id: this.editingItem };
        } else {
          url = "https://iitmod-lifeskills.onrender.com/api/v1/admin/store/create";
          method = "POST";
          body = this.itemForm;
        }
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error("Failed to save the item.");
        await this.fetchShopItems();
        this.closeItemModal();
      } catch (error) {
        alert(error.message);
      } finally {
        this.formLoading = false;
      }
    },
    async deleteItem(id) {
      if (!confirm("Are you sure?")) return;
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`https://iitmod-lifeskills.onrender.com/api/v1/admin/store/delete/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to delete the item.");
        this.fetchShopItems();
      } catch(error) {
        alert(error.message);
      }
    }
  },
  async mounted() {
    this.pageLoading = true;
    await this.fetchQuestions();
    await this.fetchShopItems();
    this.pageLoading = false;

   const style = document.createElement('style');
style.textContent = `
  .initial-page-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f4f7f6;
    font-size: 1.5rem;
    color: #777;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    z-index: 9999;
  }
  :root {
    --primary-color: #9b59b6;   /* purple */
    --primary-dark: #8e44ad;
    --background-color: #fafafa;
    --card-background: #ffffff;
    --text-color: #222;
    --text-light: #666;
    --border-color: #b57edc;    /* softer purple border */
    --danger-color: #e74c3c;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    --border-radius: 8px;
  }
  .admin-container {
    padding: 20px;
    background-color: var(--background-color);
    font-family: 'Comic Sans MS', cursive, sans-serif;
    color: var(--text-color);
    min-height: 100vh;
  }

  .admin-header h2 {
    color: var(--primary-dark);
  }

  .back-to-dash-btn {
    background: var(--text-light);
    color: white;
    border: 1px solid var(--border-color);
    padding: 10px 20px;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background 0.2s;
  }

  .admin-tabs {
    margin-bottom: 25px;
    border-bottom: 2px solid var(--border-color);
  }

  .admin-tabs button {
    border: none;
    border-bottom: 3px solid transparent;
    color: var(--text-light);
    background: transparent;
  }

  .admin-tabs button.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  .admin-card {
    background: var(--card-background);
    padding: 15px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
  }

  .shop-item-img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    border: 2px solid var(--border-color);
    border-radius: 50%;
    padding: 5px;
  }

  .card-actions {
    margin-top: auto;
    padding-top: 15px;
    display: flex;
    gap: 10px;
    border-top: 1px solid var(--border-color);
  }

  .card-actions button {
    border: 1px solid var(--border-color);
    background: #f9f9f9;
  }

  .card-actions .delete-btn {
    color: var(--danger-color);
    border-color: var(--danger-color);
  }

  .add-new-btn {
    background-color: var(--primary-color);
    color: white;
    border: 1px solid var(--primary-dark);
  }

  .modal-content {
    background: white;
    padding: 25px;
    border-radius: var(--border-radius);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
     width:90%;
    max-width:500px;
    max-height:90vh;
    overflow-y:auto;
    position:relative;
  }
    .modal-backdrop {
    position: fixed; /* stays on top of everything */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;   /* center vertically */
    justify-content: center; /* center horizontally */
    z-index: 1000; /* make sure it overlays */
}

  .form-input {
    border: 1px solid var(--border-color);
    border-radius: 5px;
    font-family: 'Comic Sans MS', cursive, sans-serif;
  }

  .remove-option-btn {
    background: var(--danger-color);
    border: 1px solid var(--danger-color);
  }

  .add-option-btn {
    background: #e0e0e0;
    border: 1px solid var(--border-color);
  }
`;
document.head.appendChild(style);

this.isReady = true;

  }
};
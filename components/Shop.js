const Shop = {
  template: `
    <div class="shop-container">
      <h2>🛍️ Welcome to the Shop!</h2>

      <!-- Loader -->
      <div v-if="loading" class="loader"></div>

      <div v-else>
        <div v-for="(category, index) in categories" :key="index" class="shop-section">
          <h3>{{ category.name }}</h3>

          <div class="scroll-container">
            <button class="scroll-btn left" @click="scrollLeft(index)">&#8592;</button>

            <div class="items-wrapper" ref="wrappers">
              <div class="item-card" v-for="(item, i) in category.items" :key="i">
                <img :src="item.image_url" :alt="item.name" />
                <p class="item-name">{{ item.name }}</p>
                <div class="price-box">
                  <span class="coin-price">💰 {{ item.money_price }}</span>
                  <span class="xp-price">⭐ {{ item.xp_price }}</span>
                </div>

                <!-- Buttons -->
                <div>
                  <button 
                    v-if="item.quantity > 0"
                    class="shop-button"
                    :disabled="usingItemId === item.inventory_id"
                    @click="useItem(item)">
                    <span v-if="usingItemId === item.inventory_id">Using...</span>
                    <span v-else>Use (x{{ item.quantity }})</span>
                  </button>

                  <button 
                    v-else
                    class="shop-button" 
                    :disabled="buyingItemId === item.id"
                    @click="buyItem(item)">
                    <span v-if="buyingItemId === item.id">Processing...</span>
                    <span v-else>Buy</span>
                  </button>
                </div>
              </div>
            </div>

            <button class="scroll-btn right" @click="scrollRight(index)">&#8594;</button>
          </div>
        </div>

        <button class="submit-button" @click="goToDashboard">Back to Dashboard</button>
      </div>
    </div>
  `,
  data() {
    return {
      loading: true,
      categories: [],
      buyingItemId: null,
      usingItemId: null
    };
  },
  methods: {
    async fetchShopItems() {
      try {
        const token = localStorage.getItem("accessToken");

        // Get all shop items
        const res = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/store/items", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        // Get user inventory
        const invRes = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/inventory/get", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const invData = await invRes.json();

        const inventoryMap = {};
        invData.items.forEach(i => {
          inventoryMap[i.item._id] = {
            quantity: i.quantity,
            inventory_id: i._id
          };
        });

        // Merge inventory info into shop data
        this.categories = Object.keys(data).map(categoryName => ({
          name: categoryName,
          items: data[categoryName].map(item => ({
            ...item,
            quantity: inventoryMap[item.id]?.quantity || 0,
            inventory_id: inventoryMap[item.id]?.quantity > 0 ? inventoryMap[item.id].inventory_id : null
          }))
        }));

      } catch (err) {
        console.error("Error fetching shop items:", err);
      } finally {
        this.loading = false;
      }
    },

    async buyItem(item) {
  this.buyingItemId = item.id;
  try {
    const token = localStorage.getItem("accessToken");
    const res = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/store/purchase", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ item_id: item.id, quantity: 1 })
    });

    if (res.ok) {
      alert(`You successfully bought ${item.name}!`);

      // Clear any previous using state
      this.usingItemId = null;

      // Refresh inventory so quantity & inventory_id are accurate
      await this.fetchShopItems();

    } else {
      const errData = await res.json();
      alert(errData.message || "Purchase failed.");
    }
  } catch (err) {
    console.error("Error purchasing item:", err);
    alert("Something went wrong. Try again.");
  } finally {
    this.buyingItemId = null;
  }
},

    async useItem(item) {
      if (!item.inventory_id) return;
      this.usingItemId = item.inventory_id;
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/inventory/use", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inventory_item_id: item.inventory_id, quantity: 1 })
        });

        if (res.ok) {
          item.quantity -= 1;
          if (item.quantity <= 0) {
            item.inventory_id = null;
          }
          alert(`You used 1 ${item.name}.`);
        } else {
          const errData = await res.json();
          alert(errData.message || "Use failed.");
        }
      } catch (err) {
        console.error("Error using item:", err);
        alert("Something went wrong. Try again.");
      } finally {
        this.usingItemId = null;
      }
    },

    scrollLeft(index) {
      this.$refs.wrappers[index].scrollBy({ left: -200, behavior: 'smooth' });
    },
    scrollRight(index) {
      this.$refs.wrappers[index].scrollBy({ left: 200, behavior: 'smooth' });
    },
    goToDashboard() {
      window.location.hash = "#/dashboard";
    }
  },
  mounted() {
    this.fetchShopItems();

    const style = document.createElement('style');
    style.textContent = `
      .shop-container {
    padding: 40px;
    background-color: #fff3e0;
    font-family: 'Comic Sans MS', cursive;
    min-height: 100vh;
}

h2 {
    text-align: center;
    color: #ef6c00;
    margin-bottom: 30px;
}

.shop-section {
    margin-bottom: 40px;
}

.shop-section h3 {
    color: #fb8c00;
    margin-bottom: 10px;
    font-size: 1.3rem;
}

.scroll-container {
    position: relative;
    display: flex;
    align-items: center;
}

.scroll-btn {
    background-color: #ffa726;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1;
}

.scroll-btn:hover {
    transform: scale(1.1);
}

.items-wrapper {
    display: flex;
    overflow-x: auto;
    margin: 0 10px;
    padding: 10px;
    background: #fff;
    border-radius: 20px;
    gap: 15px;
    flex-wrap: nowrap;
}

.item-card {
    min-width: 130px;
    background-color: #ffe0b2;
    border-radius: 15px;
    text-align: center;
    padding: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    flex-shrink: 0;
}

.item-card img {
    width: 100px;
    height: 100px;
    object-fit: contain;
    margin-bottom: 8px;
}

.item-name {
    font-weight: bold;
    margin-top: 5px;
}

.price-box {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 10px;
}

.coin-price {
    background: #ffecb3;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.9rem;
}

.xp-price {
    background: #bbdefb;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.9rem;
}

.shop-button {
    background-color: #4db6ac;
    color: white;
    border: none;
    padding: 6px 14px;
    margin: 4px;
    border-radius: 15px;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease-in-out;
}

.shop-button:hover {
    transform: scale(1.15);
}

.shop-button:disabled {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
}

.submit-button {
    display: block;
    margin: 40px auto 0;
    background-color: #8e24aa;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 30px;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.submit-button:hover {
    transform: scale(1.05);
}

.loader {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 50px;
    color: #8e24aa;
}
    `;
    document.head.appendChild(style);
  }
};

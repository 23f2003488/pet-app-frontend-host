const Shop = {
  template: `
    <div class="shop-container">
      <h2>🛍️ Welcome to the Shop!</h2>

      <div v-if="loading" class="loader"></div>

      <div v-else>
        <div v-for="(category, index) in categories" :key="index" class="shop-section">
          <h3>{{ category.name }}</h3>

          <div class="scroll-container">
            <button class="scroll-btn left" @click="scrollLeft(index)">&#8592;</button>

            <div class="items-wrapper" ref="wrappers">
              <div class="item-card" v-for="(item, i) in category.items" :key="i">
                
                <div v-if="item.isGroup">
                  <img :src="getActiveVariant(item).image_url" :alt="getActiveVariant(item).name" />
                  <p class="item-name">{{ item.groupName }}</p>
                  
                  <select v-model="item.selectedVariantId" class="variant-select">
                    <option v-for="variant in item.variants" :value="variant.id" :key="variant.id">
                      {{ variant.name }}
                    </option>
                  </select>

                  <div class="effects-box">
                    <span>Happiness +{{ getActiveVariant(item).happiness_effect }}</span>
                  </div>

                  <div class="price-box">
                    <span class="coin-price">Coins: {{ getActiveVariant(item).money_price }}</span>
                  </div>
                  
                  <div class="button-container">
                    <button v-if="getActiveVariant(item).quantity > 0" class="shop-button use-button" :disabled="usingItemId === getActiveVariant(item).inventory_id" @click="useItem(getActiveVariant(item))">
                      <span v-if="usingItemId === getActiveVariant(item).inventory_id">...</span><span v-else>Use</span>
                    </button>
                    <button v-else class="shop-button buy-button" 
                      :disabled="buyingItemId === getActiveVariant(item).id || item.userOwnsOne" 
                      @click="buyItem(getActiveVariant(item))">
                       <span v-if="buyingItemId === getActiveVariant(item).id">...</span><span v-else>Buy</span>
                    </button>
                  </div>
                </div>

                <div v-else>
                  <img :src="item.image_url" :alt="item.name" />
                  <p class="item-name">{{ item.name }}</p>
                  <div class="effects-box">
                    <span>Happiness +{{ item.happiness_effect }}</span>
                    <span v-if="item.category === 'Food'">| Hunger +{{ item.hunger_effect }}</span>
                  </div>
                  <div class="price-box">
                    <span v-if="item.category === 'Gifts' || item.category === 'Theme'" class="xp-price">XP: {{ item.xp_price }}</span>
                    <span v-else class="coin-price">Coins: {{ item.money_price }}</span>
                  </div>
                  <div class="button-container">
                    <div v-if="item.category === 'Food'">
                      <div v-if="item.quantity >= 0" class="quantity-display">Qt. {{ item.quantity }}</div>
                      <div class="food-buttons">
                        <button class="shop-button buy-button" :disabled="buyingItemId === item.id" @click="buyItem(item)">
                          <span v-if="buyingItemId === item.id">...</span><span v-else>Buy</span>
                        </button>
                        <button v-if="item.quantity > 0" class="shop-button use-button" :disabled="usingItemId === item.inventory_id" @click="useItem(item)">
                          <span v-if="usingItemId === item.inventory_id">...</span><span v-else>Use</span>
                        </button>
                      </div>
                    </div>
                    <div v-else-if="item.category === 'Costumes' || item.category === 'Gifts' || item.category === 'Theme'">
                      <div v-if="item.isUnlocked">
                        <button v-if="item.is_equipped" class="shop-button unequip-button" @click="unequipItem(item)">Unequip</button>
                        <button v-else class="shop-button equip-button" @click="equipItem(item)">Equip</button>
                      </div>
                      <button v-else class="shop-button locked-button" disabled>Locked</button>
                    </div>
                    <div v-else>
                       <button v-if="item.quantity > 0" class="shop-button" :disabled="usingItemId === item.inventory_id" @click="useItem(item)">
                        <span v-if="usingItemId === item.inventory_id">...</span><span v-else>Use (x{{ item.quantity }})</span>
                      </button>
                      <button v-else class="shop-button" :disabled="buyingItemId === item.id" @click="buyItem(item)">
                        <span v-if="buyingItemId === item.id">...</span><span v-else>Buy</span>
                      </button>
                    </div>
                  </div>
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
      usingItemId: null,
      userXP: 0
    };
  },
  methods: {
    async fetchShopItems() {
      try {
        const token = localStorage.getItem("accessToken");
        const [shopRes, invRes, userRes] = await Promise.all([
          fetch("https://iitmod-lifeskills.onrender.com/api/v1/store/items", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("https://iitmod-lifeskills.onrender.com/api/v1/inventory/get", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("https://iitmod-lifeskills.onrender.com/api/v1/users/get", { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        const shopData = await shopRes.json();
        const invData = await invRes.json();
        const userData = await userRes.json();
        this.userXP = userData.userStats?.experience || 0;

        const inventoryMap = {};
        invData.items.forEach(i => {
          if (i && i.item) {
            inventoryMap[i.item._id] = {
              quantity: i.quantity,
              inventory_id: i._id
            };
          }
        });
        
        const equippedCostumeId = localStorage.getItem('equippedCostumeId');
        const equippedThemeId = localStorage.getItem('equippedThemeId');

        this.categories = Object.keys(shopData).map(categoryName => {
          let items = shopData[categoryName];

          if (categoryName === 'Accessories') {
            const accessoryGroups = {};
            const fullAccessoryList = items.map(item => ({
              ...item,
              quantity: inventoryMap[item.id]?.quantity || 0,
              inventory_id: inventoryMap[item.id]?.inventory_id,
            }));
            
            fullAccessoryList.forEach(item => {
              const groupName = item.name.split(' ')[1];
              if (!accessoryGroups[groupName]) {
                accessoryGroups[groupName] = [];
              }
              accessoryGroups[groupName].push(item);
            });
            
            items = Object.keys(accessoryGroups).map(groupName => {
              const variants = accessoryGroups[groupName];
              const userOwnsOneInGroup = variants.some(v => v.quantity > 0);
              return {
                isGroup: true,
                id: groupName,
                groupName: groupName,
                variants: variants,
                selectedVariantId: variants[0]?.id,
                userOwnsOne: userOwnsOneInGroup
              };
            });
          }

          if (categoryName === 'Gifts' || categoryName === 'Theme') {
            items.sort((a, b) => a.xp_price - b.xp_price);
          }

          return {
            name: categoryName,
            items: items.map(item => {
              if (item.isGroup) return item;
              return {
                ...item,
                quantity: inventoryMap[item.id]?.quantity || 0,
                inventory_id: inventoryMap[item.id]?.inventory_id,
                is_equipped: item.id === equippedCostumeId || item.id === equippedThemeId,
                isUnlocked: (item.category === 'Gifts' || item.category === 'Theme') ? this.userXP >= item.xp_price : true
              }
            })
          };
        });
      } catch (err) {
        console.error("Error fetching shop items:", err);
      } finally {
        this.loading = false;
      }
    },
    getActiveVariant(groupedItem) {
      return groupedItem.variants.find(v => v.id === groupedItem.selectedVariantId);
    },
    async buyItem(item) {
      this.buyingItemId = item.id;
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/store/purchase", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: item.id, quantity: 1 })
        });

        if (res.ok) {
          alert(`You successfully bought ${item.name}!`);
          await this.fetchShopItems();
        } else {
          const errData = await res.json();
          alert(errData.message || "Purchase failed.");
        }
      } catch (err) {
        alert("Something went wrong. Try again.");
      } finally {
        this.buyingItemId = null;
      }
    },
    async useItem(item) {
      this.usingItemId = item.inventory_id;
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("https://iitmod-lifeskills.onrender.com/api/v1/inventory/use", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ inventory_item_id: item.inventory_id, quantity: 1 })
        });
        if (res.ok) {
          alert(`You used 1 ${item.name}.`);
          
          // FIX: Updated logic to only affect the specific accessory type
          if (item.category === 'Accessories') {
            if (item.name.includes('Collar')) {
              localStorage.setItem('equippedCollarUrl', item.image_url);
            } else if (item.name.includes('Ball')) {
              localStorage.setItem('equippedBallUrl', item.image_url);
            } else if (item.name.includes('Bowl')) {
              localStorage.setItem('equippedBowlUrl', item.image_url);
            }
          }

          await this.fetchShopItems();
        } else {
          const errData = await res.json();
          alert(errData.message || "Use failed.");
        }
      } catch (err) {
        alert("Something went wrong. Try again.");
      } finally {
        this.usingItemId = null;
      }
    },
    async equipItem(item) {
      if (item.category === 'Costumes') {
        localStorage.removeItem('equippedCollarUrl'); // Unequip competing items
        localStorage.setItem('equippedCostumeId', item.id);
        localStorage.setItem('equippedCostumeUrl', item.image_url);
      } 
      else if (item.category === 'Gifts' || item.category === 'Theme') {
        localStorage.setItem('equippedThemeId', item.id);
        localStorage.setItem('equippedThemeUrl', item.image_url);
      }
      
      alert(`${item.name} has been equipped!`);
      await this.fetchShopItems();
    },
    async unequipItem(item) {
      if (item.category === 'Costumes') {
        localStorage.removeItem('equippedCostumeId');
        localStorage.removeItem('equippedCostumeUrl');
      } 
      else if (item.category === 'Gifts' || item.category === 'Theme') {
        localStorage.removeItem('equippedThemeId');
        localStorage.removeItem('equippedThemeUrl');
      }
      alert(`${item.name} has been unequipped.`);
      await this.fetchShopItems();
    },
    scrollLeft(index) { this.$refs.wrappers[index].scrollBy({ left: -200, behavior: 'smooth' }); },
    scrollRight(index) { this.$refs.wrappers[index].scrollBy({ left: 200, behavior: 'smooth' }); },
    goToDashboard() { window.location.hash = "#/dashboard"; }
  },
  mounted() {
    this.fetchShopItems();
    const style = document.createElement('style');
    style.textContent = `
      .shop-container { padding: 40px; background-color: #fff3e0; font-family: 'Comic Sans MS', cursive; min-height: 100vh; }
      h2 { text-align: center; color: #ef6c00; margin-bottom: 30px; }
      .shop-section { margin-bottom: 40px; }
      .shop-section h3 { color: #fb8c00; margin-bottom: 10px; font-size: 1.3rem; }
      .scroll-container { position: relative; display: flex; align-items: center; }
      .scroll-btn { background-color: #ffa726; color: white; border: none; padding: 10px 15px; border-radius: 50%; font-size: 1.2rem; cursor: pointer; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); z-index: 1; }
      .scroll-btn:hover { transform: scale(1.1); }
      .items-wrapper { display: flex; overflow-x: auto; margin: 0 10px; padding: 10px; background: #fff; border-radius: 20px; gap: 15px; flex-wrap: nowrap; }
      .item-card { min-width: 130px; background-color: #ffe0b2; border-radius: 15px; text-align: center; padding: 10px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); flex-shrink: 0; }
      .item-card img { width: 100px; height: 100px; object-fit: contain; margin-bottom: 8px; }
      .item-name { font-weight: bold; margin-top: 5px; margin-bottom: 5px; }
      .effects-box { font-size: 0.75rem; color: #6d4c41; margin-bottom: 8px; font-weight: bold; min-height: 14px; }
      .effects-box span { margin: 0 4px; }
      .price-box { display: flex; justify-content: center; gap: 8px; margin-bottom: 10px; min-height: 25px; }
      .coin-price, .xp-price { padding: 4px 8px; border-radius: 8px; font-size: 0.9rem; }
      .coin-price { background: #ffecb3; }
      .xp-price { background: #bbdefb; }
      .shop-button { background-color: #4db6ac; color: white; border: none; padding: 6px 14px; margin: 4px; border-radius: 15px; font-size: 0.8rem; cursor: pointer; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15); transition: transform 0.2s ease-in-out; }
      .shop-button:hover { transform: scale(1.15); }
      .shop-button:disabled { background-color: #ccc; color: #666; cursor: not-allowed; }
      .equip-button { background-color: #42a5f5; }
      .unequip-button { background-color: #ef5350; }
      .locked-button { background-color: #9e9e9e; color: #fff; cursor: not-allowed; }
      .submit-button { display: block; margin: 40px auto 0; background-color: #8e24aa; color: white; padding: 12px 24px; border: none; border-radius: 30px; font-size: 1rem; cursor: pointer; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); }
      .submit-button:hover { transform: scale(1.05); }
      .loader { text-align: center; font-size: 1.2rem; margin-top: 50px; color: #8e24aa; }
      .button-container { margin-top: 5px; min-height: 40px; }
      .quantity-display { font-size: 0.8rem; font-weight: bold; color: #d84315; margin-bottom: 5px; }
      .food-buttons { display: flex; justify-content: center; gap: 5px; }
      .food-buttons .shop-button { padding: 5px 10px; font-size: 0.75rem; }
      .variant-select { width: 100%; padding: 5px; border-radius: 8px; border: 1px solid #ccc; margin-top: 5px; margin-bottom: 5px; font-family: 'Comic Sans MS', cursive; }
    `;
    document.head.appendChild(style);
  }
};
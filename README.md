 Pawket Money – Frontend

**Pawket Money** is an educational gamified web app built to help school students (ages 8–14) learn **financial literacy** through managing a **virtual pet**. This is the frontend module built using **Vue.js (via CDN)**.

---

##  Features

-  Virtual pet dashboard with XP, coins, hunger & happiness bars
-  Quests with MCQs to earn XP & money
-  Shop to buy food, costumes, accessories
-  Gifts unlock based on XP and spending
-  Progress Tracker with live chart
-  Pet customization and animated behavior
-  Hover sound + interactive UI
-  Login/Registration with mock backend

---

##  Tech Stack

- **Vue 2 CDN** (no CLI or bundler)
- **HTML + CSS + JavaScript**
- Manual Routing via `router.js`
- Chart.js for XP graph
- LocalStorage + SessionStorage for mock data

---

##  Folder Structure

```
frontend/
├── assets/
│   └── img/                # All images (costumes, food, backgrounds, pets, etc.)
│   └── sounds/             # Pet sounds like bark.mp3
├── components/
│   ├── Home.js             # Welcome page with "PLAY" button
│   ├── Login.js            # Login form
│   ├── Register.js         # New user registration
│   ├── Dashboard.js        # Main pet interaction page
│   ├── Shop.js             # Item shop for food, costumes, etc.
│   ├── Quests.js           # MCQ-based quiz
│   ├── ProgressTracker.js  # XP & performance chart
│   ├── Help.js             # Game instructions/rules
├── router.js               # Manual Vue routing
├── app.js                  # Vue app setup and route mapping
├── index.html              # Entry HTML with Vue CDN
└── README.md               # You’re reading it!
```

---

##  How to Run

> No build step! Just open `index.html` directly with Live Server.

### Steps:

1. Clone this repository or download as ZIP
2. Open `frontend/index.html` in VS Code
3. Use **Live Server** extension or simply double-click the file
4. App runs at:
   ```
   http://127.0.0.1:5500/frontend/index.html#/home
   ```

---


##  Team & Contributions

>  IITM BS Data Science – 3rd Year  
>  Subject: Software Engineering Project

Frontend Team:
- **Priyanshu Agarwal** 
- **Akshaj** 

Other modules handled by backend, content, testing, and documentation teams.

---

Made with 💜 by Team Pawket Money

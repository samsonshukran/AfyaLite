document.addEventListener("DOMContentLoaded", () => {

  const checkMealBtn = document.getElementById('checkMealBtn');
  const mealInput = document.getElementById('mealInput');
  const mealRecommendation = document.getElementById('mealRecommendation');
  const mealProgressFill = document.getElementById('mealProgressFill');

  const healthyFoods = ["ugali", "rice", "beans", "githeri", "sukuma", "spinach", "fish", "chicken", "banana", "mango", "carrot", "broccoli"];
  const unhealthyFoods = ["fried", "soda", "sweets", "chips", "processed"];

  checkMealBtn.addEventListener('click', () => {
      const meal = mealInput.value.toLowerCase();
      if (!meal) {
          mealRecommendation.textContent = "Please enter what you ate today.";
          mealProgressFill.style.width = "0%";
          return;
      }

      let healthyCount = 0;
      let unhealthyCount = 0;

      healthyFoods.forEach(food => { if(meal.includes(food)) healthyCount++; });
      unhealthyFoods.forEach(food => { if(meal.includes(food)) unhealthyCount++; });

      if (healthyCount > 0 && unhealthyCount === 0) mealRecommendation.textContent = "✅ Great! Your meal looks balanced and healthy.";
      else if (healthyCount > 0 && unhealthyCount > 0) mealRecommendation.textContent = "⚠️ Mixed meal. Consider reducing unhealthy items.";
      else if (healthyCount === 0 && unhealthyCount > 0) mealRecommendation.textContent = "❌ Your meal is not very healthy. Try including vegetables or proteins.";
      else mealRecommendation.textContent = "ℹ️ Not sure about these foods. Include vegetables, grains, and proteins.";

      mealProgressFill.style.width = Math.min(healthyCount*20, 100) + "%";

      // Save today's input
      const today = new Date().toDateString();
      const meals = JSON.parse(localStorage.getItem("mealCompliance")) || {};
      meals[today] = mealInput.value;
      localStorage.setItem("mealCompliance", JSON.stringify(meals));

      updateDailyHealthScore();
  });

  // Load tips, streak, weekly summary, and initial health score
  loadTips();
  updateDailyHealthScore();
  updateStreak();
  generateWeeklySummary();
});

/* ===== Load Tips ===== */
function loadTips() {
    fetch("../data/dailyTips.json")
        .then(res => res.json())
        .then(data => {
            const dailyTips = document.getElementById("dailyTips");
            dailyTips.innerHTML = "";
            data.dailyTips.forEach(tip => {
                const li = document.createElement("li");
                li.textContent = tip;
                dailyTips.appendChild(li);
            });
        });
}

/* ===== Daily Streak ===== */
function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("lastExerciseDate");
    let streak = parseInt(localStorage.getItem("streak")) || 0;
    if (lastDate !== today) {
        streak++;
        localStorage.setItem("streak", streak);
        localStorage.setItem("lastExerciseDate", today);
    }
    document.getElementById("streakCount").textContent = streak;
}

/* ===== Daily Health Score ===== */
function updateDailyHealthScore() {
    const healthyFoods = ["ugali", "rice", "beans", "githeri", "sukuma", "spinach", "fish", "chicken", "banana", "mango", "carrot", "broccoli"];
    const meals = JSON.parse(localStorage.getItem("mealCompliance")) || {};
    const today = new Date().toDateString();
    const mealToday = meals[today] || "";

    let healthyCount = 0;
    healthyFoods.forEach(food => {
        if (mealToday.toLowerCase().includes(food)) healthyCount++;
    });

    const score = Math.min(healthyCount * 20, 100);
    const scoreFill = document.getElementById("dailyScoreFill");
    const scorePercent = document.getElementById("dailyScorePercent");
    scorePercent.textContent = score + "%";
    scoreFill.style.width = score + "%";

    const msg = document.getElementById("dailyScoreMsg");
    if (score === 100) msg.textContent = "🎉 Perfect! Your meal is balanced!";
    else if (score >= 50) msg.textContent = "👍 Good progress!";
    else if (score > 0) msg.textContent = "🥗 Keep going!";
    else msg.textContent = "Start your healthy meals today! 🌿";
}

/* ===== Weekly Exercise Summary Placeholder ===== */
function generateWeeklySummary() {
    const weeklyDiv = document.getElementById("weeklySummary");
    weeklyDiv.innerHTML = "";
    for (let i = 0; i < 7; i++) {
        const bar = document.createElement("div");
        bar.className = "day-bar";
        const label = document.createElement("span");
        label.textContent = new Date(Date.now() - (6-i)*86400000).toLocaleDateString('en-US', { weekday: 'short' });
        const fill = document.createElement("div");
        fill.className = "bar-fill";
        fill.style.height = "0%"; // placeholder
        bar.appendChild(label);
        bar.appendChild(fill);
        weeklyDiv.appendChild(bar);
    }
}



checkMealBtn.addEventListener('click', () => {
    const meal = mealInput.value.toLowerCase().trim();
    if (!meal) {
        mealRecommendation.textContent = "Please enter what you ate today.";
        mealRecommendation.className = "unknown";
        mealProgressFill.style.width = "0% ";
        return;
    }

    let healthyCount = 0;
    let unhealthyCount = 0;

    healthyFoods.forEach(food => { if(meal.includes(food)) healthyCount++; });
    unhealthyFoods.forEach(food => { if(meal.includes(food)) unhealthyCount++; });

    // Recommendation logic with classes and emojis
    if (healthyCount > 0 && unhealthyCount === 0) {
        mealRecommendation.textContent = "✅ Great! Your meal looks balanced and healthy. 🥗";
        mealRecommendation.className = "healthy";
    } else if (healthyCount > 0 && unhealthyCount > 0) {
        mealRecommendation.textContent = "⚠️ Mixed meal. Consider reducing unhealthy items. 🍛";
        mealRecommendation.className = "mixed";
    } else if (healthyCount === 0 && unhealthyCount > 0) {
        mealRecommendation.textContent = "❌ Your meal is not very healthy. Try adding vegetables or proteins. 🍅🥚";
        mealRecommendation.className = "unhealthy";
    } else {
        mealRecommendation.textContent = "ℹ️ Not sure about these foods. Include grains, proteins, and vegetables. 🥦";
        mealRecommendation.className = "unknown";
    }

    // Animate progress bar
    let progress = Math.min(healthyCount * 20, 100);
    mealProgressFill.style.width = progress + "%";

    // Save today's input
    const today = new Date().toDateString();
    const meals = JSON.parse(localStorage.getItem("mealCompliance")) || {};
    meals[today] = mealInput.value;
    localStorage.setItem("mealCompliance", JSON.stringify(meals));

    updateDailyHealthScore();
});

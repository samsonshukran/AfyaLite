document.addEventListener("DOMContentLoaded", () => {
    /* ===== Daily Healthy Tips ===== */
    const tipEl = document.getElementById('dailyTip');
    const nextBtn = document.getElementById('nextTip');
    const tips = [
        "💧 Drink at least 8 glasses of clean water daily.",
        "🥬 Include leafy greens like sukuma and spinach in your meals.",
        "🍌 Eat seasonal fruits like mango, pawpaw, bananas, guava, oranges.",
        "🥘 Eat more beans, peas, and legumes for protein.",
        "🏃‍♂️ Walk 20-30 minutes every day for fitness.",
        "🧼 Wash fruits and vegetables before eating.",
        "🍳 Use local cooking methods like boiling or steaming for healthier meals.",
        "🥥 Include coconut milk in moderation for flavor and nutrients.",
        "🍚 Prefer whole grains like brown rice and millet over refined grains.",
        "🍗 Include lean proteins like fish, chicken, eggs, and beans in your meals."
    ];

    if (tipEl && nextBtn) {
        let currentTip = 0;
        const showTip = (i) => tipEl.textContent = tips[i];
        nextBtn.addEventListener('click', () => {
            currentTip = (currentTip + 1) % tips.length;
            showTip(currentTip);
        });
        showTip(currentTip);
    }

    /* ===== Meal Checker + History ===== */
    const mealInput = document.getElementById("mealInput");
    const checkMealBtn = document.getElementById("checkMealBtn");
    const mealResult = document.getElementById("mealResult");
    const historyList = document.getElementById("historyList");

    const foodsDB = {
        carbs: { items: ["ugali", "rice", "chapati", "matoke", "githeri"], suggestion: "Ugali, Rice, Chapati" },
        proteins: { items: ["fish", "chicken", "beef", "eggs", "beans"], suggestion: "Fish, Beans, Eggs" },
        vegFruit: { items: ["sukuma", "spinach", "cabbage", "banana", "mango", "pawpaw", "orange"], suggestion: "Sukuma, Spinach, Banana" }
    };

    let history = JSON.parse(localStorage.getItem("mealHistory")) || [];

    const saveHistory = () => {
        localStorage.setItem("mealHistory", JSON.stringify(history));
        displayHistory();
    };

    const displayHistory = () => {
        historyList.innerHTML = "";
        history.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${item.meal}</strong><br>
                Result: ${item.result}<br>
                Rating: ${item.rating || "Not rated"}<br>
                <small>${item.date}</small><br>
                <button data-index="${index}" data-rating="Good">👍 Good</button>
                <button data-index="${index}" data-rating="Fair">😐 Fair</button>
                <button data-index="${index}" data-rating="Poor">👎 Poor</button>
                <hr>
            `;
            historyList.appendChild(li);
        });

        // Attach event listeners for rating buttons
        historyList.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                const rating = e.target.dataset.rating;
                history[idx].rating = rating;
                saveHistory();
            });
        });
    };

    checkMealBtn.addEventListener("click", () => {
        if (!mealInput.value.trim()) {
            mealResult.style.color = "#f39c12";
            mealResult.textContent = "⚠️ Please enter at least one food item.";
            return;
        }

        const userFoods = mealInput.value.toLowerCase().split(",").map(f => f.trim());

        const hasCarb = userFoods.some(f => foodsDB.carbs.items.includes(f));
        const hasProtein = userFoods.some(f => foodsDB.proteins.items.includes(f));
        const hasVegFruit = userFoods.some(f => foodsDB.vegFruit.items.includes(f));

        let missing = [];
        let suggestions = [];

        if (!hasCarb) { missing.push("Carbohydrates 🍚"); suggestions.push(foodsDB.carbs.suggestion); }
        if (!hasProtein) { missing.push("Protein 🍗🥚"); suggestions.push(foodsDB.proteins.suggestion); }
        if (!hasVegFruit) { missing.push("Vegetables/Fruits 🥬🍌"); suggestions.push(foodsDB.vegFruit.suggestion); }

        if (missing.length === 0) {
            mealResult.style.color = "#27ae60";
            mealResult.textContent = "✅ Balanced Meal! Great job eating healthy 💚";
        } else if (missing.length === 1) {
            mealResult.style.color = "#f39c12";
            mealResult.innerHTML = `⚠️ Almost balanced!<br>Missing: <strong>${missing[0]}</strong><br>👉 Suggestion: ${suggestions[0]}`;
        } else {
            mealResult.style.color = "#e74c3c";
            mealResult.innerHTML = `❌ Not balanced.<br>Missing: <strong>${missing.join(", ")}</strong><br>👉 Suggestions: ${suggestions.join(" | ")}`;
        }

        // Save to history
        history.unshift({
            meal: mealInput.value,
            result: missing.length === 0 ? "✅ Balanced Meal" : missing.length === 1 ? "⚠️ Almost Balanced" : "❌ Not Balanced",
            rating: "",
            date: new Date().toLocaleString()
        });

        saveHistory();
        mealInput.value = "";
    });

    displayHistory();
});

document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById('checkMealsBtn');
    checkBtn.addEventListener('click', checkMeals);
});

const carbs = ["ugali", "rice", "chapati", "matoke", "githeri"];
const proteins = ["fish", "chicken", "beef", "eggs", "beans"];
const vegetables = ["sukuma", "spinach", "cabbage", "kachumbari"];
const fruits = ["banana", "mango", "pawpaw", "orange"];

function checkMeals() {
    const meals = [
        { input: document.getElementById('breakfastInput').value, result: document.getElementById('breakfastResult') },
        { input: document.getElementById('lunchInput').value, result: document.getElementById('lunchResult') },
        { input: document.getElementById('dinnerInput').value, result: document.getElementById('dinnerResult') }
    ];

    let balancedCount = 0;

    meals.forEach(meal => {
        const text = meal.input.toLowerCase();
        if (!text) {
            meal.result.textContent = "⚠️ Please enter your meal!";
            meal.result.style.color = "#e67e22";
            return;
        }

        const hasCarb = carbs.some(f => text.includes(f));
        const hasProtein = proteins.some(f => text.includes(f));
        const hasVegFruit = vegetables.concat(fruits).some(f => text.includes(f));

        if (hasCarb && hasProtein && hasVegFruit) {
            meal.result.textContent = "✅ Balanced meal!";
            meal.result.style.color = "#27ae60";
            balancedCount++;
        } else if ((hasCarb && hasProtein) || (hasCarb && hasVegFruit) || (hasProtein && hasVegFruit)) {
            meal.result.textContent = "⚠️ Could be improved";
            meal.result.style.color = "#f39c12";
        } else {
            meal.result.textContent = "❌ Not balanced";
            meal.result.style.color = "#e74c3c";
        }
    });

    // Update progress
    const progress = (balancedCount / 3) * 100;
    document.getElementById('mealProgressFill').style.width = progress + "%";
}

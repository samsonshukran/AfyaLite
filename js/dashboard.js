// AfyaLite Dashboard - Comprehensive Health Tracker
document.addEventListener('DOMContentLoaded', function() {
    console.log('AfyaLite Dashboard initialized');
    
    // Initialize all dashboard components
    initDashboard();
});

// Main initialization function
function initDashboard() {
    // Hide loader after page loads
    setTimeout(() => {
        document.querySelector('.dashboard-loader').classList.add('fade-out');
        setTimeout(() => {
            document.querySelector('.dashboard-loader').style.display = 'none';
        }, 500);
    }, 1000);
    
    // Initialize date display
    updateCurrentDate();
    
    // Initialize all dashboard components
    initializeStats();
    initializeMealChecker();
    initializeWaterTracker();
    initializeWeeklyProgress();
    initializeGoals();
    initializeActivityFeed();
    initializeTips();
    initializeQuickActions();
    initializeModals();
    initializeEventListeners();
    
    // Calculate overall health score
    calculateOverallHealthScore();
    
    // Update totals
    updateTotalStats();
}

// ===== DATE AND TIME =====
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('currentDate').textContent = dateString;
}

// ===== STATS INITIALIZATION =====
function initializeStats() {
    // Load from localStorage
    const mealData = loadMealData();
    const waterData = loadWaterData();
    const exerciseData = loadExerciseData();
    
    // Update meal compliance
    updateMealCompliance(mealData);
    
    // Update water intake
    updateWaterStats(waterData);
    
    // Update exercise streak
    updateExerciseStreak(exerciseData);
}

function loadMealData() {
    const today = new Date().toDateString();
    return JSON.parse(localStorage.getItem('afyaLite_meals') || '{}');
}

function loadWaterData() {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
    return data[today] || { count: 0, goal: 8 };
}

function loadExerciseData() {
    return JSON.parse(localStorage.getItem('afyaLite_exercise') || '{}');
}

function updateMealCompliance(mealData) {
    const today = new Date().toDateString();
    const todayMeals = Object.keys(mealData).filter(date => 
        date === today && mealData[date].trim() !== ''
    ).length;
    
    const totalGoal = 3; // Breakfast, Lunch, Dinner
    const compliance = Math.min(todayMeals, totalGoal);
    const percentage = (compliance / totalGoal) * 100;
    
    document.getElementById('mealCompliance').textContent = `${compliance}/${totalGoal}`;
    document.getElementById('mealComplianceBar').style.width = `${percentage}%`;
}

function updateWaterStats(waterData) {
    const count = waterData.count || 0;
    const goal = waterData.goal || 8;
    const percentage = (count / goal) * 100;
    
    document.getElementById('waterIntake').textContent = `${count}/${goal}`;
    document.getElementById('waterBar').style.width = `${percentage}%`;
}

function updateExerciseStreak(exerciseData) {
    // Calculate streak from exercise data
    const streak = exerciseData.streak || 0;
    const percentage = Math.min((streak / 30) * 100, 100); // Max 30 days for 100%
    
    document.getElementById('exerciseStreak').textContent = `${streak} days`;
    document.getElementById('streakBar').style.width = `${percentage}%`;
}

// ===== MEAL CHECKER =====
function initializeMealChecker() {
    const checkMealBtn = document.getElementById('checkMealBtn');
    const mealInput = document.getElementById('mealInput');
    const mealRecommendation = document.getElementById('mealRecommendation');
    const mealProgressFill = document.getElementById('mealProgressFill');
    const mealProgressText = document.getElementById('mealProgressText');
    const mealRating = document.getElementById('mealRating');
    
    // Database of healthy and unhealthy foods
    const healthyFoods = {
        carbohydrates: ['ugali', 'rice', 'chapati', 'matoke', 'sweet potato', 'cassava', 'githeri'],
        proteins: ['beans', 'fish', 'chicken', 'beef', 'eggs', 'lentils', 'peas', 'milk'],
        vegetables: ['sukuma', 'spinach', 'cabbage', 'carrot', 'tomato', 'onion', 'broccoli', 'kale'],
        fruits: ['banana', 'mango', 'orange', 'apple', 'pineapple', 'watermelon', 'passion fruit', 'guava'],
        healthyFats: ['avocado', 'coconut', 'groundnuts', 'simsim', 'olive oil']
    };
    
    const unhealthyFoods = {
        fried: ['fried', 'deep fried', 'chips', 'fries'],
        sugary: ['soda', 'sweets', 'candy', 'cake', 'donut', 'chocolate'],
        processed: ['processed meat', 'sausage', 'hot dog', 'burger', 'pizza'],
        salty: ['crisps', 'popcorn', 'salty snacks']
    };
    
    checkMealBtn.addEventListener('click', function() {
        const meal = mealInput.value.trim().toLowerCase();
        
        if (!meal) {
            showMealResult('Please enter what you ate today.', 'unknown', 0, '-');
            return;
        }
        
        // Analyze the meal
        const analysis = analyzeMeal(meal, healthyFoods, unhealthyFoods);
        
        // Save to localStorage
        saveMealData(meal, analysis.score);
        
        // Display result
        showMealResult(analysis.message, analysis.quality, analysis.score, analysis.rating);
        
        // Update overall stats
        calculateOverallHealthScore();
        updateMealCompliance(loadMealData());
        addActivity('meal', `Checked meal: ${meal.substring(0, 30)}...`, analysis.quality);
    });
    
    function analyzeMeal(meal, healthyFoods, unhealthyFoods) {
        let healthyCount = 0;
        let unhealthyCount = 0;
        let categoriesFound = [];
        
        // Check healthy foods
        for (const [category, foods] of Object.entries(healthyFoods)) {
            for (const food of foods) {
                if (meal.includes(food)) {
                    healthyCount++;
                    if (!categoriesFound.includes(category)) {
                        categoriesFound.push(category);
                    }
                    break;
                }
            }
        }
        
        // Check unhealthy foods
        for (const [category, foods] of Object.entries(unhealthyFoods)) {
            for (const food of foods) {
                if (meal.includes(food)) {
                    unhealthyCount++;
                    break;
                }
            }
        }
        
        // Calculate score
        const categoryBonus = categoriesFound.length * 10;
        const baseScore = Math.min(healthyCount * 15, 60);
        const penalty = unhealthyCount * 15;
        let score = Math.max(0, baseScore + categoryBonus - penalty);
        
        // Determine quality
        let quality, message, rating;
        
        if (score >= 70) {
            quality = 'good';
            rating = 'Excellent';
            message = `✅ Excellent! Your meal is well-balanced with ${categoriesFound.join(', ')}.`;
        } else if (score >= 40) {
            quality = 'warning';
            rating = 'Good';
            message = `⚠️ Good meal! Contains ${categoriesFound.length} food groups.`;
        } else if (score >= 20) {
            quality = 'poor';
            rating = 'Fair';
            message = `❌ Fair meal. Try adding more variety (vegetables, proteins, etc.).`;
        } else {
            quality = 'poor';
            rating = 'Poor';
            message = `❌ Poor meal quality. Consider healthier options.`;
        }
        
        if (unhealthyCount > 0) {
            message += ' Reduce unhealthy items for better nutrition.';
        }
        
        return {
            score: score,
            quality: quality,
            message: message,
            rating: rating,
            categories: categoriesFound,
            healthyCount: healthyCount,
            unhealthyCount: unhealthyCount
        };
    }
    
    function showMealResult(message, quality, score, rating) {
        const mealRecommendation = document.getElementById('mealRecommendation');
        const mealProgressFill = document.getElementById('mealProgressFill');
        const mealProgressText = document.getElementById('mealProgressText');
        const mealRating = document.getElementById('mealRating');
        
        // Update message
        mealRecommendation.textContent = message;
        mealRecommendation.className = `result-message ${quality}`;
        
        // Update progress bar
        mealProgressFill.style.width = `${score}%`;
        mealProgressText.textContent = `${score}% Healthy`;
        
        // Update rating
        mealRating.textContent = rating;
        mealRating.className = `result-value ${quality}`;
    }
    
    function saveMealData(meal, score) {
        const today = new Date().toDateString();
        const mealData = JSON.parse(localStorage.getItem('afyaLite_meals') || '{}');
        
        if (!mealData[today]) {
            mealData[today] = [];
        }
        
        mealData[today].push({
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            meal: meal,
            score: score
        });
        
        localStorage.setItem('afyaLite_meals', JSON.stringify(mealData));
    }
}

// ===== WATER TRACKER =====
function initializeWaterTracker() {
    const addWaterBtn = document.getElementById('addWaterBtn');
    const waterGlassesContainer = document.querySelector('.water-glasses');
    const waterTodayElement = document.getElementById('waterToday');
    const waterRemainingElement = document.getElementById('waterRemaining');
    
    const goal = 8; // 8 glasses per day
    let waterCount = 0;
    
    // Load water data
    function loadWaterData() {
        const today = new Date().toDateString();
        const waterData = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
        
        if (waterData[today]) {
            waterCount = waterData[today].count || 0;
        } else {
            waterCount = 0;
            waterData[today] = { count: 0, goal: goal };
            localStorage.setItem('afyaLite_water', JSON.stringify(waterData));
        }
        
        updateWaterDisplay();
    }
    
    // Update water display
    function updateWaterDisplay() {
        // Update glasses
        waterGlassesContainer.innerHTML = '';
        for (let i = 0; i < goal; i++) {
            const glass = document.createElement('div');
            glass.className = `water-glass ${i < waterCount ? 'filled' : ''}`;
            glass.innerHTML = i < waterCount ? '<i class="fas fa-tint"></i>' : '<i class="fas fa-tint"></i>';
            glass.addEventListener('click', () => toggleGlass(i));
            waterGlassesContainer.appendChild(glass);
        }
        
        // Update stats
        waterTodayElement.textContent = waterCount;
        waterRemainingElement.textContent = goal - waterCount;
        
        // Update quick stats
        const percentage = (waterCount / goal) * 100;
        document.getElementById('waterBar').style.width = `${percentage}%`;
        document.getElementById('waterIntake').textContent = `${waterCount}/${goal}`;
    }
    
    // Toggle glass
    function toggleGlass(index) {
        if (index === waterCount - 1) {
            // Remove glass
            waterCount--;
        } else if (index === waterCount) {
            // Add glass
            waterCount++;
        }
        
        saveWaterData();
        updateWaterDisplay();
        
        if (waterCount === goal) {
            addActivity('water', '🎉 Reached daily water goal!', 'good');
        }
    }
    
    // Save water data
    function saveWaterData() {
        const today = new Date().toDateString();
        const waterData = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
        waterData[today] = { count: waterCount, goal: goal };
        localStorage.setItem('afyaLite_water', JSON.stringify(waterData));
        
        // Update overall health score
        calculateOverallHealthScore();
    }
    
    // Add water button
    addWaterBtn.addEventListener('click', function() {
        if (waterCount < goal) {
            waterCount++;
            saveWaterData();
            updateWaterDisplay();
            
            // Add activity
            addActivity('water', `Drank glass ${waterCount} of water`, 'good');
            
            // Animation
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = '';
            }, 300);
        }
    });
    
    // Initialize
    loadWaterData();
}

// ===== WEEKLY PROGRESS =====
function initializeWeeklyProgress() {
    const weekGrid = document.getElementById('weekGrid');
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const currentWeekElement = document.getElementById('currentWeek');
    
    let currentWeek = 0; // 0 = current week, -1 = last week, etc.
    
    // Generate week grid
    function generateWeekGrid(weekOffset = 0) {
        const days = [];
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate start of week (Monday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
        
        weekGrid.innerHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = day.getDate();
            const dateString = day.toDateString();
            
            // Get health data for this day
            const healthData = getDayHealthData(dateString);
            const score = healthData.score || 0;
            const isToday = dateString === new Date().toDateString();
            
            const dayElement = document.createElement('div');
            dayElement.className = 'week-day';
            dayElement.innerHTML = `
                <span class="day-name">${dayName}</span>
                <div class="day-circle ${isToday ? 'active' : score > 0 ? 'active' : 'inactive'}">
                    ${dayNumber}
                </div>
                <span class="day-score">${score}%</span>
            `;
            
            // Add click event
            dayElement.addEventListener('click', () => {
                showDayDetails(dateString, healthData);
            });
            
            weekGrid.appendChild(dayElement);
            days.push({ date: dateString, score: score });
        }
        
        // Update week label
        updateWeekLabel(weekOffset);
        
        // Update week stats
        updateWeekStats(days);
    }
    
    function getDayHealthData(dateString) {
        const mealData = JSON.parse(localStorage.getItem('afyaLite_meals') || '{}');
        const waterData = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
        const exerciseData = JSON.parse(localStorage.getItem('afyaLite_exercise') || '{}');
        
        // Calculate daily score
        let mealScore = 0;
        let waterScore = 0;
        let exerciseScore = 0;
        
        if (mealData[dateString]) {
            const meals = mealData[dateString];
            mealScore = Math.round(meals.reduce((sum, meal) => sum + (meal.score || 0), 0) / meals.length);
        }
        
        if (waterData[dateString]) {
            const water = waterData[dateString];
            waterScore = Math.round((water.count / water.goal) * 100);
        }
        
        if (exerciseData[dateString]) {
            exerciseScore = 100;
        }
        
        // Calculate overall score (weighted average)
        const overallScore = Math.round((mealScore * 0.5) + (waterScore * 0.3) + (exerciseScore * 0.2));
        
        return {
            date: dateString,
            score: overallScore,
            mealScore: mealScore,
            waterScore: waterScore,
            exerciseScore: exerciseScore
        };
    }
    
    function updateWeekLabel(weekOffset) {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7));
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        
        if (weekOffset === 0) {
            currentWeekElement.textContent = 'This Week';
        } else if (weekOffset === -1) {
            currentWeekElement.textContent = 'Last Week';
        } else {
            currentWeekElement.textContent = 
                `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
        }
    }
    
    function updateWeekStats(days) {
        const healthyDays = days.filter(day => day.score >= 70).length;
        const activeDays = days.filter(day => day.score > 0).length;
        const hydratedDays = days.filter(day => {
            const waterData = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
            return waterData[day.date] && waterData[day.date].count >= 6;
        }).length;
        
        document.getElementById('healthyDays').textContent = healthyDays;
        document.getElementById('activeDays').textContent = activeDays;
        document.getElementById('hydratedDays').textContent = hydratedDays;
    }
    
    function showDayDetails(dateString, healthData) {
        alert(`Health Details for ${dateString}:\n\n` +
              `Overall Score: ${healthData.score}%\n` +
              `Meal Score: ${healthData.mealScore}%\n` +
              `Water Score: ${healthData.waterScore}%\n` +
              `Exercise: ${healthData.exerciseScore === 100 ? 'Yes' : 'No'}`);
    }
    
    // Event listeners
    prevWeekBtn.addEventListener('click', function() {
        currentWeek--;
        generateWeekGrid(currentWeek);
    });
    
    nextWeekBtn.addEventListener('click', function() {
        currentWeek++;
        generateWeekGrid(currentWeek);
    });
    
    // Initialize
    generateWeekGrid();
}

// ===== GOALS SYSTEM =====
function initializeGoals() {
    const goalsList = document.getElementById('goalsList');
    
    const dailyGoals = [
        { id: 1, title: 'Eat 3 balanced meals', type: 'meal', target: 3, current: 0 },
        { id: 2, title: 'Drink 8 glasses of water', type: 'water', target: 8, current: 0 },
        { id: 3, title: '30 minutes of exercise', type: 'exercise', target: 1, current: 0 },
        { id: 4, title: 'Eat 5 servings of fruits/vegetables', type: 'nutrition', target: 5, current: 0 },
        { id: 5, title: 'Get 7-8 hours of sleep', type: 'sleep', target: 1, current: 0 }
    ];
    
    function updateGoals() {
        const today = new Date().toDateString();
        
        // Calculate current values
        const mealData = JSON.parse(localStorage.getItem('afyaLite_meals') || '{}');
        const waterData = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
        
        goalsList.innerHTML = '';
        let completedGoals = 0;
        
        dailyGoals.forEach(goal => {
            let current = 0;
            let completed = false;
            
            switch (goal.type) {
                case 'meal':
                    current = mealData[today] ? mealData[today].length : 0;
                    completed = current >= goal.target;
                    break;
                case 'water':
                    current = waterData[today] ? waterData[today].count : 0;
                    completed = current >= goal.target;
                    break;
                case 'exercise':
                    // Check if exercise was logged today
                    const exerciseData = JSON.parse(localStorage.getItem('afyaLite_exercise') || '{}');
                    current = exerciseData[today] ? 1 : 0;
                    completed = current >= goal.target;
                    break;
                case 'nutrition':
                    // Estimate from meal data
                    if (mealData[today]) {
                        const meals = mealData[today].join(' ').toLowerCase();
                        const fruitVegCount = (meals.match(/sukuma|spinach|cabbage|carrot|tomato|banana|mango|orange|apple/g) || []).length;
                        current = fruitVegCount;
                    }
                    completed = current >= goal.target;
                    break;
                case 'sleep':
                    // Placeholder - in real app this would come from sleep tracking
                    current = 0;
                    completed = false;
                    break;
            }
            
            if (completed) completedGoals++;
            
            const goalElement = document.createElement('div');
            goalElement.className = 'goal-item';
            goalElement.innerHTML = `
                <div class="goal-checkbox ${completed ? 'checked' : ''}">
                    ${completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="goal-content">
                    <h4>${goal.title}</h4>
                    <div class="goal-progress">
                        <div class="goal-bar">
                            <div class="goal-fill" style="width: ${Math.min((current / goal.target) * 100, 100)}%"></div>
                        </div>
                        <span class="goal-percent">${current}/${goal.target}</span>
                    </div>
                </div>
            `;
            
            // Add click event to toggle goal
            goalElement.addEventListener('click', function() {
                if (!completed) {
                    // In a real app, this would mark the goal as complete
                    alert(`Great job completing: ${goal.title}`);
                }
            });
            
            goalsList.appendChild(goalElement);
        });
        
        // Update goals complete counter
        document.getElementById('goalsComplete').textContent = `${completedGoals}/${dailyGoals.length} Complete`;
    }
    
    // Update goals periodically
    updateGoals();
    setInterval(updateGoals, 60000); // Update every minute
}

// ===== ACTIVITY FEED =====
function initializeActivityFeed() {
    const activityFeed = document.getElementById('activityFeed');
    const viewAllBtn = document.getElementById('viewAllActivity');
    
    // Load activities from localStorage
    function loadActivities() {
        const activities = JSON.parse(localStorage.getItem('afyaLite_activities') || '[]');
        displayActivities(activities.slice(-10)); // Show last 10 activities
    }
    
    // Display activities
    function displayActivities(activities) {
        activityFeed.innerHTML = '';
        
        if (activities.length === 0) {
            activityFeed.innerHTML = '<p class="no-activities">No recent activities. Start tracking your health!</p>';
            return;
        }
        
        activities.reverse().forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            
            let iconClass = '';
            let icon = '';
            
            switch (activity.type) {
                case 'meal':
                    iconClass = 'meal';
                    icon = '<i class="fas fa-utensils"></i>';
                    break;
                case 'exercise':
                    iconClass = 'exercise';
                    icon = '<i class="fas fa-running"></i>';
                    break;
                case 'water':
                    iconClass = 'water';
                    icon = '<i class="fas fa-tint"></i>';
                    break;
                case 'tip':
                    iconClass = 'tip';
                    icon = '<i class="fas fa-lightbulb"></i>';
                    break;
                default:
                    iconClass = 'meal';
                    icon = '<i class="fas fa-heartbeat"></i>';
            }
            
            const timeAgo = getTimeAgo(activity.timestamp);
            
            activityElement.innerHTML = `
                <div class="activity-icon ${iconClass}">${icon}</div>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
            
            activityFeed.appendChild(activityElement);
        });
    }
    
    // Add new activity
    function addActivity(type, message, status = 'info') {
        const activities = JSON.parse(localStorage.getItem('afyaLite_activities') || '[]');
        
        activities.push({
            type: type,
            message: message,
            status: status,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(0, activities.length - 50);
        }
        
        localStorage.setItem('afyaLite_activities', JSON.stringify(activities));
        loadActivities();
    }
    
    // Helper function to get time ago
    function getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return past.toLocaleDateString();
    }
    
    // View all button
    viewAllBtn.addEventListener('click', function() {
        const activities = JSON.parse(localStorage.getItem('afyaLite_activities') || '[]');
        displayActivities(activities);
        this.textContent = 'View Recent';
        this.onclick = function() {
            loadActivities();
            this.textContent = 'View All';
        };
    });
    
    // Initialize
    loadActivities();
    
    // Add some initial activities if none exist
    const activities = JSON.parse(localStorage.getItem('afyaLite_activities') || '[]');
    if (activities.length === 0) {
        addActivity('tip', 'Welcome to AfyaLite! Start tracking your health journey.', 'good');
        addActivity('tip', 'Log your first meal to get personalized recommendations.', 'info');
    }
    
    // Expose addActivity globally for other functions
    window.addActivity = addActivity;
}

// ===== HEALTH TIPS =====
function initializeTips() {
    const refreshTipBtn = document.getElementById('refreshTip');
    const currentTipElement = document.getElementById('currentTip');
    const tipCategoryElement = document.getElementById('tipCategory');
    const tipsHistoryElement = document.getElementById('tipsHistory');
    
    const healthTips = [
        {
            text: "Start your day with a glass of warm water with lemon to boost metabolism and aid digestion.",
            category: "Hydration"
        },
        {
            text: "Include at least one serving of leafy greens like sukuma wiki or spinach in your daily meals.",
            category: "Nutrition"
        },
        {
            text: "Aim for 30 minutes of moderate exercise daily, such as brisk walking or dancing.",
            category: "Exercise"
        },
        {
            text: "Choose whole fruits over fruit juices to get more fiber and fewer added sugars.",
            category: "Nutrition"
        },
        {
            text: "Practice mindful eating by chewing slowly and avoiding distractions during meals.",
            category: "Mindfulness"
        },
        {
            text: "Stay hydrated throughout the day by keeping a water bottle with you and sipping regularly.",
            category: "Hydration"
        },
        {
            text: "Include protein in every meal to help maintain muscle mass and keep you feeling full longer.",
            category: "Nutrition"
        },
        {
            text: "Get at least 7-8 hours of quality sleep each night for optimal health and recovery.",
            category: "Sleep"
        },
        {
            text: "Reduce salt intake by using herbs and spices like garlic, ginger, and turmeric for flavor.",
            category: "Cooking"
        },
        {
            text: "Wash fruits and vegetables thoroughly under running water before eating or cooking.",
            category: "Hygiene"
        }
    ];
    
    // Load last shown tip or show random
    function loadTip() {
        const lastTipIndex = localStorage.getItem('afyaLite_lastTipIndex');
        let tipIndex;
        
        if (lastTipIndex !== null) {
            tipIndex = (parseInt(lastTipIndex) + 1) % healthTips.length;
        } else {
            tipIndex = Math.floor(Math.random() * healthTips.length);
        }
        
        const tip = healthTips[tipIndex];
        
        currentTipElement.textContent = tip.text;
        tipCategoryElement.textContent = tip.category;
        
        // Save to history
        saveTipToHistory(tip);
        
        // Update localStorage
        localStorage.setItem('afyaLite_lastTipIndex', tipIndex);
    }
    
    // Save tip to history
    function saveTipToHistory(tip) {
        const history = JSON.parse(localStorage.getItem('afyaLite_tipHistory') || '[]');
        
        history.unshift({
            text: tip.text,
            category: tip.category,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 tips
        if (history.length > 10) {
            history.splice(10);
        }
        
        localStorage.setItem('afyaLite_tipHistory', JSON.stringify(history));
        displayTipHistory();
    }
    
    // Display tip history
    function displayTipHistory() {
        const history = JSON.parse(localStorage.getItem('afyaLite_tipHistory') || '[]');
        tipsHistoryElement.innerHTML = '';
        
        history.slice(0, 5).forEach(item => {
            const li = document.createElement('li');
            const timeAgo = getTimeAgo(item.timestamp);
            li.textContent = `${item.text.substring(0, 50)}... (${timeAgo})`;
            tipsHistoryElement.appendChild(li);
        });
    }
    
    // Helper function for time ago
    function getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffHours = Math.floor((now - past) / 3600000);
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    }
    
    // Refresh tip button
    refreshTipBtn.addEventListener('click', function() {
        loadTip();
        this.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.style.transform = '';
        }, 300);
        
        addActivity('tip', 'Viewed new health tip', 'info');
    });
    
    // Initialize
    loadTip();
    displayTipHistory();
}

// ===== QUICK ACTIONS =====
function initializeQuickActions() {
    const bmiCalculatorBtn = document.getElementById('bmiCalculator');
    const mealPlannerBtn = document.getElementById('mealPlanner');
    const exerciseLogBtn = document.getElementById('exerciseLog');
    const healthReportBtn = document.getElementById('healthReport');
    
    bmiCalculatorBtn.addEventListener('click', function() {
        document.getElementById('bmiModal').classList.add('show');
    });
    
    mealPlannerBtn.addEventListener('click', function() {
        window.location.href = '../pages/meal-planner.html';
    });
    
    exerciseLogBtn.addEventListener('click', function() {
        logExercise();
    });
    
    healthReportBtn.addEventListener('click', function() {
        generateHealthReport();
        document.getElementById('healthReportModal').classList.add('show');
    });
    
    function logExercise() {
        const today = new Date().toDateString();
        const exerciseData = JSON.parse(localStorage.getItem('afyaLite_exercise') || '{}');
        
        if (!exerciseData[today]) {
            exerciseData[today] = {
                count: 1,
                lastDate: today,
                streak: (exerciseData.streak || 0) + 1
            };
            
            // Update streak
            localStorage.setItem('afyaLite_exercise', JSON.stringify(exerciseData));
            
            // Update display
            updateExerciseStreak(exerciseData);
            
            // Add activity
            addActivity('exercise', 'Logged 30 minutes of exercise', 'good');
            
            // Show success message
            alert('✅ Exercise logged successfully! Keep up the good work!');
        } else {
            alert('Exercise already logged for today. Great job!');
        }
    }
}

// ===== MODALS =====
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Close modal when clicking close button
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });
    
    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modals.forEach(modal => modal.classList.remove('show'));
        }
    });
    
    // BMI Calculator
    const calculateBMIBtn = document.getElementById('calculateBMI');
    const weightInput = document.getElementById('weightInput');
    const heightInput = document.getElementById('heightInput');
    const bmiResult = document.getElementById('bmiResult');
    
    calculateBMIBtn.addEventListener('click', function() {
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value) / 100; // Convert cm to meters
        
        if (!weight || !height || weight <= 0 || height <= 0) {
            bmiResult.innerHTML = '<p class="bmi-error">Please enter valid weight and height.</p>';
            return;
        }
        
        const bmi = weight / (height * height);
        const category = getBMICategory(bmi);
        
        bmiResult.innerHTML = `
            <div class="bmi-value">${bmi.toFixed(1)}</div>
            <div class="bmi-category ${category.class}">${category.name}</div>
            <p class="bmi-advice">${category.advice}</p>
        `;
        
        // Add activity
        addActivity('tip', `Calculated BMI: ${bmi.toFixed(1)} (${category.name})`, 'info');
    });
    
    function getBMICategory(bmi) {
        if (bmi < 18.5) {
            return {
                name: 'Underweight',
                class: 'warning',
                advice: 'Consider increasing calorie intake with healthy foods like nuts, avocados, and whole grains.'
            };
        } else if (bmi < 25) {
            return {
                name: 'Normal Weight',
                class: 'good',
                advice: 'Great! Maintain your weight with balanced nutrition and regular exercise.'
            };
        } else if (bmi < 30) {
            return {
                name: 'Overweight',
                class: 'warning',
                advice: 'Focus on portion control and include more vegetables in your meals.'
            };
        } else {
            return {
                name: 'Obese',
                class: 'poor',
                advice: 'Consult a healthcare professional for personalized weight management advice.'
            };
        }
    }
    
    // Print report
    const printReportBtn = document.getElementById('printReport');
    printReportBtn.addEventListener('click', function() {
        window.print();
    });
}

// ===== OVERALL HEALTH SCORE =====
function calculateOverallHealthScore() {
    const today = new Date().toDateString();
    
    // Get all data
    const mealData = JSON.parse(localStorage.getItem('afyaLite_meals') || '{}');
    const waterData = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
    const exerciseData = JSON.parse(localStorage.getItem('afyaLite_exercise') || '{}');
    
    // Calculate scores
    let mealScore = 0;
    let waterScore = 0;
    let exerciseScore = 0;
    
    if (mealData[today]) {
        const meals = mealData[today];
        mealScore = Math.round(meals.reduce((sum, meal) => sum + (meal.score || 0), 0) / meals.length);
    }
    
    if (waterData[today]) {
        const water = waterData[today];
        waterScore = Math.round((water.count / water.goal) * 100);
    }
    
    if (exerciseData[today]) {
        exerciseScore = 100;
    }
    
    // Calculate overall score (weighted)
    const overallScore = Math.round((mealScore * 0.5) + (waterScore * 0.3) + (exerciseScore * 0.2));
    
    // Update display
    document.getElementById('overallHealthScore').textContent = `${overallScore}%`;
    document.getElementById('healthScoreBar').style.width = `${overallScore}%`;
    
    return overallScore;
}

// ===== HEALTH REPORT =====
function generateHealthReport() {
    const reportContent = document.getElementById('reportContent');
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    
    // Calculate statistics
    const mealData = JSON.parse(localStorage.getItem('afyaLite_meals') || '{}');
    const waterData = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
    const exerciseData = JSON.parse(localStorage.getItem('afyaLite_exercise') || '{}');
    
    // Weekly averages
    let totalMeals = 0;
    let totalWater = 0;
    let exerciseDays = 0;
    let daysWithData = 0;
    
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateString = date.toDateString();
        
        if (mealData[dateString]) {
            totalMeals += mealData[dateString].length;
            daysWithData++;
        }
        
        if (waterData[dateString]) {
            totalWater += waterData[dateString].count;
        }
        
        if (exerciseData[dateString]) {
            exerciseDays++;
        }
    }
    
    const avgMealsPerDay = totalMeals / Math.max(daysWithData, 1);
    const avgWaterPerDay = totalWater / 7;
    const exerciseFrequency = exerciseDays;
    
    // Generate report HTML
    reportContent.innerHTML = `
        <div class="report-section">
            <h4>Weekly Summary</h4>
            <div class="report-item">
                <span class="report-label">Average Meals per Day</span>
                <span class="report-value ${avgMealsPerDay >= 2 ? 'good' : 'warning'}">${avgMealsPerDay.toFixed(1)}</span>
            </div>
            <div class="report-item">
                <span class="report-label">Average Water Glasses</span>
                <span class="report-value ${avgWaterPerDay >= 6 ? 'good' : avgWaterPerDay >= 4 ? 'warning' : 'poor'}">${avgWaterPerDay.toFixed(1)}</span>
            </div>
            <div class="report-item">
                <span class="report-label">Exercise Days</span>
                <span class="report-value ${exerciseFrequency >= 3 ? 'good' : exerciseFrequency >= 1 ? 'warning' : 'poor'}">${exerciseFrequency}/7</span>
            </div>
        </div>
        
        <div class="report-section">
            <h4>Today's Status</h4>
            <div class="report-item">
                <span class="report-label">Health Score</span>
                <span class="report-value ${calculateOverallHealthScore() >= 70 ? 'good' : calculateOverallHealthScore() >= 50 ? 'warning' : 'poor'}">${calculateOverallHealthScore()}%</span>
            </div>
            <div class="report-item">
                <span class="report-label">Goals Completed</span>
                <span class="report-value">${document.getElementById('goalsComplete').textContent}</span>
            </div>
            <div class="report-item">
                <span class="report-label">Current Streak</span>
                <span class="report-value">${document.getElementById('exerciseStreak').textContent}</span>
            </div>
        </div>
        
        <div class="report-section">
            <h4>Recommendations</h4>
            <p>${generateRecommendations(avgMealsPerDay, avgWaterPerDay, exerciseFrequency)}</p>
        </div>
    `;
}

function generateRecommendations(avgMeals, avgWater, exerciseDays) {
    let recommendations = [];
    
    if (avgMeals < 2) {
        recommendations.push("Try to eat at least 3 balanced meals daily");
    }
    
    if (avgWater < 6) {
        recommendations.push("Increase water intake to 8 glasses per day");
    }
    
    if (exerciseDays < 3) {
        recommendations.push("Aim for at least 30 minutes of exercise, 3 times a week");
    }
    
    if (recommendations.length === 0) {
        return "Excellent! You're maintaining good health habits. Keep it up!";
    }
    
    return recommendations.join('. ') + '.';
}

// ===== TOTAL STATS =====
function updateTotalStats() {
    const mealData = JSON.parse(localStorage.getItem('afyaLite_meals') || '{}');
    const waterData = JSON.parse(localStorage.getItem('afyaLite_water') || '{}');
    const exerciseData = JSON.parse(localStorage.getItem('afyaLite_exercise') || '{}');
    
    // Calculate totals
    let totalMeals = 0;
    Object.values(mealData).forEach(dayMeals => {
        totalMeals += Array.isArray(dayMeals) ? dayMeals.length : 0;
    });
    
    let totalWater = 0;
    Object.values(waterData).forEach(dayWater => {
        totalWater += dayWater.count || 0;
    });
    
    const totalExercise = Object.keys(exerciseData).filter(key => key !== 'streak').length;
    const totalDays = Math.max(Object.keys(mealData).length, 
                              Object.keys(waterData).length, 
                              Object.keys(exerciseData).filter(key => key !== 'streak').length);
    
    // Update display
    document.getElementById('totalDays').textContent = totalDays;
    document.getElementById('totalMeals').textContent = totalMeals;
    document.getElementById('totalExercise').textContent = totalExercise;
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Refresh dashboard
    const refreshDashboardBtn = document.getElementById('refreshDashboard');
    refreshDashboardBtn.addEventListener('click', function() {
        // Reload all data
        initializeStats();
        calculateOverallHealthScore();
        updateTotalStats();
        
        // Show refresh animation
        this.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.style.transform = '';
        }, 300);
        
        // Show notification
        alert('Dashboard refreshed with latest data!');
    });
    
    // Export data
    const exportDataBtn = document.getElementById('exportData');
    exportDataBtn.addEventListener('click', function() {
        exportAllData();
    });
}

// ===== DATA EXPORT =====
function exportAllData() {
    const allData = {
        meals: JSON.parse(localStorage.getItem('afyaLite_meals') || '{}'),
        water: JSON.parse(localStorage.getItem('afyaLite_water') || '{}'),
        exercise: JSON.parse(localStorage.getItem('afyaLite_exercise') || '{}'),
        activities: JSON.parse(localStorage.getItem('afyaLite_activities') || '[]'),
        tips: JSON.parse(localStorage.getItem('afyaLite_tipHistory') || '[]'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `afyalite-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    // Add activity
    addActivity('tip', 'Exported all health data', 'info');
    
    alert('Data exported successfully!');
}

// Initialize dashboard when page loads
window.addEventListener('load', initDashboard);
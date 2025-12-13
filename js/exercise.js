document.addEventListener("DOMContentLoaded", () => {
    const exercises = [
        {name: "Jogging", video: "../assets/videos/jogging.mp4", description: "Boost heart rate and endurance. Great for cardiovascular health and stamina building.", recommended: 10, category: "cardio", difficulty: "easy"},
        {name: "Jumping Jacks", video: "../assets/videos/jumping_jacks.mp4", description: "Full body warm-up exercise that improves coordination and burns calories quickly.", recommended: 5, category: "cardio", difficulty: "easy"},
        {name: "Push-ups", video: "../assets/videos/pushups.mp4", description: "Strengthen chest, shoulders, triceps, and core muscles. Builds upper body strength.", recommended: 5, category: "strength", difficulty: "medium"},
        {name: "Squats", video: "../assets/videos/squats.mp4", description: "Strengthen legs, glutes, and core. Essential for lower body strength and mobility.", recommended: 7, category: "strength", difficulty: "medium"},
        {name: "Lunges", video: "../assets/videos/lunges.mp4", description: "Improve balance, coordination, and leg strength. Targets quadriceps and glutes.", recommended: 6, category: "strength", difficulty: "medium"},
        {name: "Plank", video: "../assets/videos/plank.mp4", description: "Core stability exercise that strengthens abdominal muscles and improves posture.", recommended: 3, category: "core", difficulty: "medium"},
        {name: "High Knees", video: "../assets/videos/high_knees.mp4", description: "High-intensity cardio that boosts heart rate quickly and strengthens legs.", recommended: 4, category: "cardio", difficulty: "medium"},
        {name: "Butt Kicks", video: "../assets/videos/butt_kicks.mp4", description: "Warm-up exercise that targets hamstrings and improves running form.", recommended: 4, category: "cardio", difficulty: "easy"},
        {name: "Mountain Climbers", video: "../assets/videos/mountain_climbers.mp4", description: "Full body cardio exercise that builds core strength and burns calories.", recommended: 5, category: "cardio", difficulty: "hard"},
        {name: "Burpees", video: "../assets/videos/burpees.mp4", description: "High intensity full body exercise combining strength and cardio.", recommended: 5, category: "cardio", difficulty: "hard"},
        {name: "Bicycle Crunches", video: "../assets/videos/bicycle_crunches.mp4", description: "Target oblique muscles for a stronger core and defined abs.", recommended: 4, category: "core", difficulty: "medium"},
        {name: "Tricep Dips", video: "../assets/videos/tricep_dips.mp4", description: "Isolate and strengthen triceps using body weight.", recommended: 4, category: "strength", difficulty: "medium"},
        {name: "Leg Raises", video: "../assets/videos/leg_raises.mp4", description: "Focus on lower abdominal muscles for core strength.", recommended: 4, category: "core", difficulty: "medium"},
        {name: "Russian Twists", video: "../assets/videos/russian_twists.mp4", description: "Rotational core exercise that targets obliques.", recommended: 5, category: "core", difficulty: "medium"},
        {name: "Wall Sit", video: "../assets/videos/wall_sit.mp4", description: "Isometric exercise that builds endurance in legs and glutes.", recommended: 3, category: "strength", difficulty: "easy"},
        {name: "Arm Circles", video: "../assets/videos/arm_circles.mp4", description: "Shoulder warm-up that improves mobility and prevents injury.", recommended: 3, category: "strength", difficulty: "easy"},
        {name: "Calf Raises", video: "../assets/videos/calf_raises.mp4", description: "Strengthen calf muscles for better ankle stability.", recommended: 5, category: "strength", difficulty: "easy"},
        {name: "Side Plank", video: "../assets/videos/side_plank.mp4", description: "Target oblique muscles and improve core stability.", recommended: 3, category: "core", difficulty: "hard"},
        {name: "Glute Bridges", video: "../assets/videos/glute_bridges.mp4", description: "Activate and strengthen glute muscles for better posture.", recommended: 6, category: "strength", difficulty: "easy"},
        {name: "Jump Squats", video: "../assets/videos/jump_squats.mp4", description: "Plyometric exercise that builds power and burns calories.", recommended: 5, category: "cardio", difficulty: "hard"}
    ];

    const exerciseList = document.getElementById("exerciseList");
    const totalTimeDisplay = document.getElementById("totalTime");
    const completedCountDisplay = document.getElementById("completedCount");
    const caloriesBurnedDisplay = document.getElementById("caloriesBurned");
    const filterButtons = document.querySelectorAll(".filter-btn");

    let totalSeconds = 0;
    let completedExercises = 0;
    let totalCalories = 0;
    const caloriesPerMinute = 8; // Average calories burned per minute

    // Initialize statistics
    function updateStats() {
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        totalTimeDisplay.textContent = `${String(totalHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
        completedCountDisplay.textContent = `${completedExercises}/${exercises.length}`;
        caloriesBurnedDisplay.textContent = `${totalCalories} kcal`;
    }

    // Filter exercises
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            
            // Filter exercises
            const filteredExercises = filter === "all" 
                ? exercises 
                : exercises.filter(ex => ex.category === filter);
            
            renderExercises(filteredExercises);
        });
    });

    // Render exercises
    function renderExercises(exercisesToRender) {
        exerciseList.innerHTML = '';
        
        exercisesToRender.forEach((ex, idx) => {
            const card = document.createElement("div");
            card.className = `exercise-card ${ex.category}`;
            card.dataset.category = ex.category;
            
            card.innerHTML = `
                <div class="video-container">
                    <video src="${ex.video}" loop muted poster="../assets/images/placeholder.jpg"></video>
                    <div class="video-overlay">
                        <h3 class="exercise-name">${ex.name}</h3>
                    </div>
                </div>
                <div class="card-content">
                    <p class="description">${ex.description}</p>
                    <div class="exercise-meta">
                        <span class="recommendation">
                            <i class="fas fa-clock"></i>
                            ${ex.recommended} mins
                        </span>
                        <span class="difficulty ${ex.difficulty}">${ex.difficulty.toUpperCase()}</span>
                    </div>
                    <div class="exercise-controls">
                        <button class="start-btn">
                            <i class="fas fa-play"></i> Start
                        </button>
                        <button class="stop-btn">
                            <i class="fas fa-pause"></i> Pause
                        </button>
                        <button class="reset-btn">
                            <i class="fas fa-redo"></i> Reset
                        </button>
                    </div>
                    <div class="timer-container">
                        <span class="timer-label">
                            <i class="fas fa-hourglass-half"></i> Time:
                        </span>
                        <span class="timer">00:00</span>
                    </div>
                </div>
            `;

            exerciseList.appendChild(card);

            // Timer logic
            const startBtn = card.querySelector(".start-btn");
            const stopBtn = card.querySelector(".stop-btn");
            const resetBtn = card.querySelector(".reset-btn");
            const timerDisplay = card.querySelector(".timer");
            const video = card.querySelector("video");
            const recommendedSeconds = ex.recommended * 60;

            let timer = 0;
            let interval = null;
            let isCompleted = false;

            startBtn.addEventListener("click", () => {
                if (!interval) {
                    video.play();
                    interval = setInterval(() => {
                        timer++;
                        totalSeconds++;
                        totalCalories = Math.floor(totalSeconds * caloriesPerMinute / 60);
                        
                        const mins = String(Math.floor(timer / 60)).padStart(2, '0');
                        const secs = String(timer % 60).padStart(2, '0');
                        timerDisplay.textContent = `${mins}:${secs}`;

                        updateStats();

                        if (timer >= recommendedSeconds && !isCompleted) {
                            clearInterval(interval);
                            interval = null;
                            isCompleted = true;
                            completedExercises++;
                            card.classList.add("completed");
                            timerDisplay.textContent = `${mins}:${secs} ✅`;
                            updateStats();
                            
                            // Show completion notification
                            showNotification(`${ex.name} completed! Great job!`);
                        }

                    }, 1000);
                }
            });

            stopBtn.addEventListener("click", () => {
                if (interval) {
                    video.pause();
                    clearInterval(interval);
                    interval = null;
                }
            });

            resetBtn.addEventListener("click", () => {
                video.pause();
                video.currentTime = 0;
                clearInterval(interval);
                interval = null;
                if (isCompleted) {
                    completedExercises--;
                    isCompleted = false;
                    card.classList.remove("completed");
                }
                timer = 0;
                timerDisplay.textContent = "00:00";
                updateStats();
            });

            // Video click to play/pause
            video.addEventListener("click", () => {
                if (video.paused) {
                    video.play();
                    if (!interval) startBtn.click();
                } else {
                    video.pause();
                    if (interval) stopBtn.click();
                }
            });
        });
    }

    // Notification function
    function showNotification(message) {
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(to right, #27ae60, #2ecc71);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = "slideOut 0.3s ease";
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add notification animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Initial render
    renderExercises(exercises);
    updateStats();
});
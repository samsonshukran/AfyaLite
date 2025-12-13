const fs = require('fs');

const categories = [
  "nutrition", "hydration", "fitness", "stress", "immunity", 
  "maternal", "child", "digestion", "diabetes", "heart",
  "skin_care", "eye_health", "hair_care", "sleep", "weight_management",
  "elderly_care", "first_aid", "food_safety", "cooking_tips", "budget_nutrition",
  "seasonal_care", "travel_health", "oral_health", "mental_health", "hygiene"
];

const situations = {
  nutrition: ["poor diet", "malnutrition", "vitamin deficiency", "energy levels", "balanced meals"],
  hydration: ["dehydration", "hot weather", "exercise", "illness", "daily intake"],
  fitness: ["inactive", "weight loss", "muscle gain", "flexibility", "endurance"],
  stress: ["anxiety", "work pressure", "mental fatigue", "burnout", "relaxation"],
  immunity: ["frequent illness", "cold season", "weak immune system", "recovery", "prevention"],
  maternal: ["pregnancy", "postpartum", "breastfeeding", "nutrition needs", "energy"],
  child: ["growth", "development", "appetite", "healthy habits", "immunity"],
  digestion: ["constipation", "bloating", "indigestion", "gut health", "regularity"],
  diabetes: ["blood sugar", "weight management", "diet control", "monitoring", "prevention"],
  heart: ["blood pressure", "cholesterol", "heart health", "circulation", "prevention"],
  skin_care: ["dry skin", "acne", "sun protection", "aging", "hydration"],
  eye_health: ["eye strain", "vision", "dry eyes", "protection", "nutrition"],
  hair_care: ["hair loss", "dry hair", "growth", "scalp health", "shine"],
  sleep: ["insomnia", "quality", "routine", "restoration", "duration"],
  weight_management: ["obesity", "weight loss", "maintenance", "metabolism", "portion control"],
  elderly_care: ["aging", "mobility", "nutrition", "hydration", "cognitive health"],
  first_aid: ["injuries", "burns", "cuts", "sprains", "emergency"],
  food_safety: ["storage", "preparation", "cooking", "hygiene", "preservation"],
  cooking_tips: ["healthy methods", "flavor", "nutrient retention", "time saving", "equipment"],
  budget_nutrition: ["affordable", "seasonal", "bulk buying", "planning", "waste reduction"],
  seasonal_care: ["weather changes", "allergies", "immunity", "clothing", "activity"],
  travel_health: ["motion sickness", "hydration", "food safety", "rest", "preparation"],
  oral_health: ["dental hygiene", "gum health", "breath", "sensitivity", "prevention"],
  mental_health: ["depression", "anxiety", "stress", "mindfulness", "social connection"],
  hygiene: ["personal", "environmental", "food", "hand washing", "prevention"]
};

const foods = [
  "fruits", "vegetables", "whole grains", "lean protein", "healthy fats",
  "leafy greens", "berries", "nuts", "seeds", "legumes",
  "dairy", "fish", "eggs", "poultry", "herbs",
  "spices", "root vegetables", "citrus fruits", "tropical fruits", "cruciferous vegetables"
];

const benefits = [
  "health", "energy", "immunity", "digestion", "skin health",
  "mental clarity", "weight management", "heart health", "bone strength", "muscle function",
  "sleep quality", "stress reduction", "hydration", "detoxification", "metabolism"
];

function generateTip(id) {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const categorySituations = situations[category] || ["general health"];
  const situation = categorySituations[Math.floor(Math.random() * categorySituations.length)];

  const tipTexts = {
    nutrition: `Eat ${foods[Math.floor(Math.random() * foods.length)]} regularly for better ${benefits[Math.floor(Math.random() * benefits.length)]}.`,
    hydration: `Drink water throughout the day, especially before and after physical activity.`,
    fitness: `Include ${Math.floor(Math.random() * 30) + 10} minutes of exercise in your daily routine.`,
    stress: `Practice deep breathing for ${Math.floor(Math.random() * 15) + 5} minutes when feeling stressed.`,
    immunity: `Boost your immunity with vitamin-rich foods like citrus fruits and leafy greens.`,
    maternal: `During pregnancy, ensure adequate intake of iron, calcium, and folic acid.`,
    child: `Encourage children to eat colorful fruits and vegetables for balanced nutrition.`,
    digestion: `Include fiber-rich foods and drink plenty of water for healthy digestion.`,
    diabetes: `Monitor carbohydrate intake and choose complex carbs over simple sugars.`,
    heart: `Limit saturated fats and include heart-healthy foods like fish and nuts.`,
    skin_care: `Protect your skin from sun damage and stay hydrated for healthy skin.`,
    eye_health: `Give your eyes regular breaks from screens and eat eye-healthy foods.`,
    hair_care: `Nourish your hair with protein-rich foods and gentle hair care practices.`,
    sleep: `Maintain consistent sleep schedule and create relaxing bedtime routine.`,
    weight_management: `Combine balanced diet with regular exercise for healthy weight.`,
    elderly_care: `Ensure adequate protein intake and regular gentle exercise for seniors.`,
    first_aid: `Keep basic first aid supplies at home and know how to use them.`,
    food_safety: `Practice proper food handling and storage to prevent foodborne illness.`,
    cooking_tips: `Use healthy cooking methods like steaming and baking instead of frying.`,
    budget_nutrition: `Buy seasonal produce and plan meals to save money on healthy food.`,
    seasonal_care: `Adjust your diet and activities according to seasonal changes.`,
    travel_health: `Stay hydrated and practice good hygiene while traveling.`,
    oral_health: `Brush twice daily, floss regularly, and visit dentist for checkups.`,
    mental_health: `Take time for self-care and maintain social connections.`,
    hygiene: `Practice good personal hygiene and keep your environment clean.`
  };

  return {
    id: id,
    category: category,
    situation: situation,
    text: tipTexts[category] || `Maintain balanced diet and regular exercise for overall health. (Tip #${id})`
  };
}

// Generate 500 tips
const allTips = [];
for (let i = 1; i <= 500; i++) {
  allTips.push(generateTip(i));
}

// Combine with daily tips
const completeData = {
  dailyTips: [
    "💧 Drink at least 8 glasses of water daily.",
    "🥬 Include leafy greens like spinach, sukuma in meals.",
    "🍌 Eat seasonal fruits like mango, pawpaw, bananas, guava, oranges.",
    "🥘 Eat more beans, peas, and legumes for protein.",
    "🏃 Walk 20–30 minutes every day.",
    "🧼 Wash fruits and vegetables before eating.",
    "🍳 Use steaming or boiling instead of frying.",
    "🍚 Prefer whole grains like brown rice, millet, or oats.",
    "🍗 Include lean proteins like fish, eggs, chicken, and beans.",
    "🛌 Ensure 7–8 hours of sleep daily."
  ],
  tips: allTips
};

// Save JSON file
fs.writeFileSync('health_tips_500.json', JSON.stringify(completeData, null, 2));
console.log('✅ JSON file saved as health_tips_500.json');

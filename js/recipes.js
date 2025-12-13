const recipesContainer = document.getElementById('recipesContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

let allRecipes = [];

// Update fetch path relative to pages folder
fetch('../data/recipes.json')
  .then(response => response.json())
  .then(data => {
    allRecipes = data.recipes;
    displayRecipes(allRecipes.slice(0, 5)); // show first 5 by default
  })
  .catch(err => {
    recipesContainer.innerHTML = "<p>Failed to load recipes.</p>";
    console.error(err);
  });

function displayRecipes(recipes) {
  recipesContainer.innerHTML = '';
  if (recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <h2>${recipe.name}</h2>
      <h3>Ingredients:</h3>
      <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <h3>Procedure:</h3>
      <p>${recipe.steps}</p>
    `;
    recipesContainer.appendChild(card);
  });
}

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allRecipes.filter(r => r.name.toLowerCase().includes(query));
  displayRecipes(filtered);
});

searchInput.addEventListener('keyup', e => {
  if (e.key === 'Enter') searchBtn.click();
});

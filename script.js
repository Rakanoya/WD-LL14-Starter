// Populate the area dropdown when the page loads
window.addEventListener("DOMContentLoaded", async function () {
  const areaSelect = document.getElementById("area-select");
  areaSelect.innerHTML = '<option value="">Select Area</option>';

  try {
    // Fetch the list of available recipe areas from the API
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
    );
    const data = await response.json();

    // Check if we got valid data back from the API
    if (data.meals) {
      // Loop through each area and create an option element
      data.meals.forEach((areaObj) => {
        const option = document.createElement("option");
        option.value = areaObj.strArea;
        option.textContent = areaObj.strArea;
        areaSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error fetching areas:", error);
    areaSelect.innerHTML = '<option value="">Error loading areas</option>';
  }
});

// When the user selects an area, fetch and display meals for that area
document
  .getElementById("area-select")
  .addEventListener("change", async function () {
    const area = this.value;
    const resultsDiv = document.getElementById("results");
    const recipeDetailsDiv = document.getElementById("recipe-details");

    // Clear previous results and hide recipe details
    resultsDiv.innerHTML = "";
    recipeDetailsDiv.classList.remove("active");

    // If no area is selected, don't make any API calls
    if (!area) return;

    try {
      // Show loading message while fetching data
      resultsDiv.innerHTML =
        '<p style="text-align: center; color: #666;">Loading recipes...</p>';

      // Fetch recipes for the selected area from the API
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
          area
        )}`
      );
      const data = await response.json();

      // Clear loading message
      resultsDiv.innerHTML = "";

      // Check if we got recipes back from the API
      if (data.meals) {
        // Loop through each meal and create a recipe card
        data.meals.forEach((meal) => {
          const mealDiv = document.createElement("div");
          mealDiv.className = "meal";
          // Add click handler to show recipe details
          mealDiv.addEventListener("click", () =>
            showRecipeDetails(meal.idMeal)
          );

          const img = document.createElement("img");
          img.src = meal.strMealThumb;
          img.alt = meal.strMeal;

          const title = document.createElement("h3");
          title.textContent = meal.strMeal;

          // Add the image first, then the title
          mealDiv.appendChild(img);
          mealDiv.appendChild(title);
          resultsDiv.appendChild(mealDiv);
        });
      } else {
        resultsDiv.innerHTML =
          '<p style="text-align: center; color: #666;">No meals found for this area.</p>';
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      resultsDiv.innerHTML =
        '<p style="text-align: center; color: #d32f2f;">Error loading recipes. Please try again.</p>';
    }
  });

// Function to show detailed recipe information
async function showRecipeDetails(mealId) {
  const recipeDetailsDiv = document.getElementById("recipe-details");
  const recipeContentDiv = document.getElementById("recipe-content");

  try {
    // Show loading message
    recipeContentDiv.innerHTML =
      '<p style="text-align: center; color: #666;">Loading recipe details...</p>';

    // Show the modal overlay (no need to hide results since it's an overlay)
    recipeDetailsDiv.classList.add("active");

    // Fetch detailed recipe information using the meal ID
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    const data = await response.json();

    // Check if we got recipe details back from the API
    if (data.meals && data.meals[0]) {
      const recipe = data.meals[0];

      // Create the detailed recipe view
      const recipeHTML = createRecipeDetailsHTML(recipe);
      recipeContentDiv.innerHTML = recipeHTML;
    } else {
      recipeContentDiv.innerHTML =
        '<p style="text-align: center; color: #d32f2f;">Recipe details not found.</p>';
    }
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    recipeContentDiv.innerHTML =
      '<p style="text-align: center; color: #d32f2f;">Error loading recipe details. Please try again.</p>';
  }
}

// Function to create the HTML for recipe details
function createRecipeDetailsHTML(recipe) {
  // Get ingredients and measurements (API returns them in separate fields)
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];

    // Only add ingredient if it exists and isn't empty
    if (ingredient && ingredient.trim()) {
      ingredients.push(
        `${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim()
      );
    }
  }

  // Create ingredients list HTML
  const ingredientsList = ingredients
    .map((ingredient) => `<li>${ingredient}</li>`)
    .join("");

  // Create the complete recipe details HTML
  return `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    <h2>${recipe.strMeal}</h2>
    
    <div class="recipe-meta">
      <span>🍽️ Category: ${recipe.strCategory || "Unknown"}</span>
      <span>🌍 Area: ${recipe.strArea || "Unknown"}</span>
      ${recipe.strTags ? `<span>🏷️ Tags: ${recipe.strTags}</span>` : ""}
    </div>
    
    <div class="ingredients-section">
      <h3>Ingredients</h3>
      <ul class="ingredients-list">
        ${ingredientsList}
      </ul>
    </div>
    
    <div class="instructions-section">
      <h3>Instructions</h3>
      <div class="instructions">
        ${
          recipe.strInstructions
            ? recipe.strInstructions.replace(/\n/g, "<br><br>")
            : "No instructions available."
        }
      </div>
    </div>
    
    ${
      recipe.strYoutube
        ? `
      <div style="text-align: center; margin-top: 24px;">
        <a href="${recipe.strYoutube}" target="_blank" style="color: #007bff; text-decoration: none; font-weight: bold;">
          📺 Watch Recipe Video
        </a>
      </div>
    `
        : ""
    }
  `;
}

// Handle close button click to close the modal
document.getElementById("back-button").addEventListener("click", function () {
  const recipeDetailsDiv = document.getElementById("recipe-details");

  // Hide the modal overlay
  recipeDetailsDiv.classList.remove("active");
});

// Close modal when clicking on the background overlay
document
  .getElementById("recipe-details")
  .addEventListener("click", function (e) {
    // Only close if clicking on the background, not the modal content
    if (e.target === this) {
      this.classList.remove("active");
    }
  });

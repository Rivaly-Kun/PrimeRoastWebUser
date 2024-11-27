// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref, get, child, set } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD29zvJ5gOvHRgk1qUWFzZJL8foY1sf8bk",
    authDomain: "primeroastweb.firebaseapp.com",
    databaseURL: "https://primeroastweb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "primeroastweb",
    storageBucket: "primeroastweb.appspot.com",
    messagingSenderId: "157736544071",
    appId: "1:157736544071:web:2713ba60d8edddc5344e62",
    measurementId: "G-MGMCTZCX2G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const dbRef = ref(db);

import { setupAddToCartButtons } from './cart.js';

// Function to check if the product is favorited by the user
function checkFavoriteStatus(userId, productIndex, heartIcon) {
    const favRef = child(dbRef, `favorites/${userId}/${productIndex}`);
    get(favRef).then((snapshot) => {
        if (snapshot.exists()) {
            // If favorited, show filled heart
            heartIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                <path fill="#ff0000" d="M2 9.137C2 14 6.02 16.591 8.962 18.911C10 19.729 11 20.5 12 20.5s2-.77 3.038-1.59C17.981 16.592 22 14 22 9.138S16.5.825 12 5.501C7.5.825 2 4.274 2 9.137" />
            </svg>`;
        } else {
            // If not favorited, show empty heart
            heartIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                <path fill="black" fill-rule="evenodd" d="M5.624 4.424C3.965 5.182 2.75 6.986 2.75 9.137c0 2.197.9 3.891 2.188 5.343c1.063 1.196 2.349 2.188 3.603 3.154q.448.345.885.688c.526.415.995.778 1.448 1.043s.816.385 1.126.385s.674-.12 1.126-.385c.453-.265.922-.628 1.448-1.043q.437-.344.885-.687c1.254-.968 2.54-1.959 3.603-3.155c1.289-1.452 2.188-3.146 2.188-5.343c0-2.15-1.215-3.955-2.874-4.713c-1.612-.737-3.778-.542-5.836 1.597a.75.75 0 0 1-1.08 0C9.402 3.882 7.236 3.687 5.624 4.424M12 4.46C9.688 2.39 7.099 2.1 5 3.059C2.786 4.074 1.25 6.426 1.25 9.138c0 2.665 1.11 4.699 2.567 6.339c1.166 1.313 2.593 2.412 3.854 3.382q.43.33.826.642c.513.404 1.063.834 1.62 1.16s1.193.59 1.883.59s1.326-.265 1.883-.59c.558-.326 1.107-.756 1.62-1.16q.396-.312.826-.642c1.26-.97 2.688-2.07 3.854-3.382c1.457-1.64 2.567-3.674 2.567-6.339c0-2.712-1.535-5.064-3.75-6.077c-2.099-.96-4.688-.67-7 1.399" clip-rule="evenodd" />
            </svg>`;
        }
    });
}

// Toggle favorite function when heart is clicked
function toggleFavorite(userId, productIndex, heartIcon) {
    const favRef = ref(db, `favorites/${userId}/${productIndex}`);

    get(favRef).then((snapshot) => {
        if (snapshot.exists()) {
            // If already favorited, remove from favorites
            set(favRef, null);
        } else {
            // Add to favorites
            set(favRef, true);
        }
        // Update the heart icon after toggling
        checkFavoriteStatus(userId, productIndex, heartIcon);
    });
}
// Function to retrieve product information and display it in PostsDiv by category
function displayProduct(productIndex, productImg, productName, userId, category, selectedCategory) {
    const postsDiv = document.getElementById('PostsDiv');

    // Check if the product's category matches the selected category
    if (selectedCategory && selectedCategory !== category) {
        return; // If the product's category does not match, exit the function
    }

    // Check if a row already exists for the category
    let categoryRow = document.getElementById(`category-${category}`);
    if (!categoryRow) {
        // If not, create a new row for this category
        categoryRow = document.createElement('div');
        categoryRow.id = `category-${category}`;
        categoryRow.classList.add('category-row');

        // Add a category title
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category;
        categoryRow.appendChild(categoryTitle);

        // Append the category row to PostsDiv
        postsDiv.appendChild(categoryRow);
    }

    // Create the product div for the category row
    const productDiv = document.createElement('div');
    productDiv.classList.add('product-square');
    productDiv.setAttribute('data-index', productIndex); // Add the index as a data attribute
    productDiv.setAttribute('data-category', category); // Add the category as a data attribute
    productDiv.setAttribute('productName', productName); // Add the category as a data attribute
    productDiv.innerHTML = `
        <img src="${productImg}" alt="${productName}" class="product-image" />
        <p>${productName}</p>
        <div class="product-controls">
            <div class="quantity-selector">
                <button class="decrease-qty">-</button>
                <span class="quantity-value">1</span> <!-- Default quantity is 1 -->
                <button class="increase-qty">+</button>
            </div>
            <button class="add-to-cart-btn"><svg id="CartSaIcon" xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
	<path fill="currentColor" d="M7 22q-.825 0-1.412-.587T5 20t.588-1.412T7 18t1.413.588T9 20t-.587 1.413T7 22m10 0q-.825 0-1.412-.587T15 20t.588-1.412T17 18t1.413.588T19 20t-.587 1.413T17 22M5.2 4h14.75q.575 0 .875.513t.025 1.037l-3.55 6.4q-.275.5-.737.775T15.55 13H8.1L7 15h12v2H7q-1.125 0-1.7-.987t-.05-1.963L6.6 11.6L3 4H1V2h3.25z" />
</svg></button>
            <div class="favorite-icon"></div> <!-- Add heart icon here -->
        </div>
    `;

    // Add the product div to the existing category row
    categoryRow.appendChild(productDiv);

    const heartIcon = productDiv.querySelector('.favorite-icon');

    // Check favorite status when displaying the product
    checkFavoriteStatus(userId, productIndex, heartIcon);

    // Add event listener for toggling favorite on heart icon click
    heartIcon.addEventListener('click', () => {
        toggleFavorite(userId, productIndex, heartIcon);
    });

    // Add event listeners for quantity buttons
    const decreaseQtyBtn = productDiv.querySelector('.decrease-qty');
    const increaseQtyBtn = productDiv.querySelector('.increase-qty');
    const quantityValue = productDiv.querySelector('.quantity-value');

    // Decrease quantity
    decreaseQtyBtn.addEventListener('click', (event) => {
        let currentQty = parseInt(quantityValue.textContent);
        if (currentQty > 1) {  // Minimum quantity is 1
            quantityValue.textContent = currentQty - 1;
            event.preventDefault();
        }
    });

    // Increase quantity
    increaseQtyBtn.addEventListener('click', (event) => {
        let currentQty = parseInt(quantityValue.textContent);
        quantityValue.textContent = currentQty + 1;
        event.preventDefault();
    });
}


// Fetch data from Firebase and display all products
onAuthStateChanged(auth, (user) => {
    if (user) {
        get(child(dbRef, '/products')).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const productData = childSnapshot.val();
                    const productImg = productData.productImage;
                    const productName = productData.productName;
                    const category = productData.category;
                    const productIndex = childSnapshot.key; // Get the index from the product's key

                    // Call the function to display each product with the index
                    displayProduct(productIndex, productImg, productName, user.uid,category);
                });

                // Call setupAddToCartButtons after products are displayed
                setupAddToCartButtons();
            } else {
                console.log('No data available');
            }
        }).catch((error) => {
            console.error('Error fetching data:', error);
        });
    }
});

// Dropdown and search functionality
const filterButton = document.getElementById('filterlowerbox');
const searchButton = document.getElementById('SearchbarLowerbox');
const dropdown = document.getElementById('categoryDropdown'); // Reference to the dropdown
const searchInput = document.getElementById('searchInput'); // Reference to the search input

// Example function to toggle display of dropdown and search input
function toggleDropdown() {
    dropdown.classList.toggle('show');
    fetchCategories();
}

function toggleSearchInput() {
    searchInput.classList.toggle('show');
    console.log(searchInput.classList.contains('show') ? 'visible' : 'hidden');
}

// Event listeners for buttons to show/hide dropdown and search input
filterButton.addEventListener('click', toggleDropdown);
searchButton.addEventListener('click', toggleSearchInput);



function fetchCategories() {
    // Clear existing options
    dropdown.innerHTML = '';

    // Create and append the "All" option
    const allOption = document.createElement('option');
    allOption.value = ''; // Set value to empty for "All"
    allOption.textContent = 'All'; // Display text for the option
    dropdown.appendChild(allOption);

    // Fetch categories from Firebase
    get(child(dbRef, 'categories')).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const category = childSnapshot.val();
                const option = document.createElement('option');
                option.value = category; // Set the option value
                option.class = "dropdown-option"; // Set the option value
                option.textContent = category; // Set the option text
                dropdown.appendChild(option);
            });
        } else {
            console.log('No categories available');
        }
    }).catch((error) => {
        console.error('Error fetching categories:', error);
    });
}

function filterProducts() {
    const selectedCategory = dropdown.value; // Get the selected value from dropdown
    const postsDiv = document.getElementById('PostsDiv');

    if (!postsDiv) {
        console.error("PostsDiv not found!");
        return; // Exit the function if PostsDiv doesn't exist
    }

    const categoryRows = postsDiv.children; // Get all child elements of PostsDiv

    // Loop through category rows
    for (let i = 0; i < categoryRows.length; i++) {
        const categoryRow = categoryRows[i];

        if (categoryRow.classList.contains('category-row')) {
            // Show if "All" is selected or if it matches the selected category
            if (selectedCategory === "" || categoryRow.id === `category-${selectedCategory}`) {
                categoryRow.style.display = "flex"; // Show the category row
            } else {
                categoryRow.style.display = "none"; // Hide the category row
            }
        }
    }
}

// Initial fetch for categories when the page loads
fetchCategories();



// Event listeners for button clicks

// Add an event listener for when the user selects a category
dropdown.addEventListener('change', () => {
    
    filterProducts(); // Filter products based on selected category
});



// Assuming this function is called on the 'input' event of the search input
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase(); // Get the current search term in lowercase
    filterProductsBySearch(searchTerm); // Call the filtering function
    console.log(searchTerm);
});

function filterProductsBySearch(searchTerm) {
    const postsDiv = document.getElementById('PostsDiv');

    // Check if PostsDiv exists
    if (!postsDiv) {
        console.error("PostsDiv not found!");
        return; // Exit the function if PostsDiv doesn't exist
    }

    // Get all category rows
    const categoryRows = postsDiv.getElementsByClassName('category-row');

    // Loop through category rows
    for (let i = 0; i < categoryRows.length; i++) {
        const categoryRow = categoryRows[i];
        const products = categoryRow.getElementsByClassName('product-square'); // Get all products in the current category row
        let anyProductVisible = false; // Flag to check if any product matches the search term

        // Loop through product squares to check for matches
        for (let j = 0; j < products.length; j++) {
            const product = products[j];
            const productName = product.getAttribute('productName').toLowerCase(); // Get the productName attribute

            // Check if product name includes the search term
            if (productName.includes(searchTerm) || searchTerm === "") {
                product.style.display = 'flex'; // Show the product if it matches or if search term is empty
                anyProductVisible = true; // Set to true if there's a match
            } else {
                product.style.display = 'none'; // Hide the product if it doesn't match
            }
        }

        // Show or hide the category row based on whether any products are visible
        categoryRow.style.display = anyProductVisible ? 'flex' : 'none'; // Show if any product matches
    }
}





// Initial fetch for categories when the page loads (if you want to show them immediately)
fetchCategories();



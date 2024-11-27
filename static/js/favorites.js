import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref, get, child, onValue, set, remove } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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

// Toggle the display of the no-favorites message
function toggleNoFavoritesMessage(show) {
    const noFavoritesOverlay = document.getElementById('no-favorites-overlay');
    noFavoritesOverlay.style.display = show ? 'flex' : 'none';
}

// Function to monitor favorite status in real-time
function monitorFavoriteStatus(userId, productIndex, heartIcon, productDiv) {
    const favRef = ref(db, `favorites/${userId}/${productIndex}`);

    onValue(favRef, (snapshot) => {
        if (snapshot.exists()) {
            heartIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                <path fill="#ff0000" d="M2 9.137C2 14 6.02 16.591 8.962 18.911C10 19.729 11 20.5 12 20.5s2-.77 3.038-1.59C17.981 16.592 22 14 22 9.138S16.5.825 12 5.501C7.5.825 2 4.274 2 9.137" />
            </svg>`;
        } else {
            productDiv.remove();
            checkFavoritesEmpty();
        }
    });
}

// Check if there are no favorites and toggle the message accordingly
function checkFavoritesEmpty() {
    const favoritesDiv = document.getElementById('favoritesDiv');
    const hasFavorites = favoritesDiv.children.length > 0;
    toggleNoFavoritesMessage(!hasFavorites);
}

// Toggle favorite status when the heart icon is clicked
function toggleFavorite(userId, productIndex, heartIcon) {
    const favRef = ref(db, `favorites/${userId}/${productIndex}`);

    get(favRef).then((snapshot) => {
        if (snapshot.exists()) {
            remove(favRef);
        } else {
            set(favRef, true);
        }
    });
}

// Function to display a product in the favorites section
function displayProduct(productIndex, productImg, productName, userId) {
    const favoritesDiv = document.getElementById('favoritesDiv');

    const productDiv = document.createElement('div');
    productDiv.classList.add('product-square');
    productDiv.setAttribute('data-index', productIndex);
    productDiv.innerHTML = `
        <img src="${productImg}" alt="${productName}" class="product-image" />
        <p>${productName}</p>
        <div class="product-controls">
            <div class="quantity-selector">
                <button class="decrease-qty">-</button>
                <span class="quantity-value">1</span>
                <button class="increase-qty">+</button>
            </div>
            <button class="add-to-cart-btn"><svg id="CartSaIcon" xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
	<path fill="currentColor" d="M7 22q-.825 0-1.412-.587T5 20t.588-1.412T7 18t1.413.588T9 20t-.587 1.413T7 22m10 0q-.825 0-1.412-.587T15 20t.588-1.412T17 18t1.413.588T19 20t-.587 1.413T17 22M5.2 4h14.75q.575 0 .875.513t.025 1.037l-3.55 6.4q-.275.5-.737.775T15.55 13H8.1L7 15h12v2H7q-1.125 0-1.7-.987t-.05-1.963L6.6 11.6L3 4H1V2h3.25z" />
</svg></button>
            <div class="favorite-icon"></div>
        </div>
    `;

    const heartIcon = productDiv.querySelector('.favorite-icon');

    monitorFavoriteStatus(userId, productIndex, heartIcon, productDiv);

    heartIcon.addEventListener('click', () => {
        toggleFavorite(userId, productIndex, heartIcon);
    });

    favoritesDiv.appendChild(productDiv);
    toggleNoFavoritesMessage(false);

    const decreaseQtyBtn = productDiv.querySelector('.decrease-qty');
    const increaseQtyBtn = productDiv.querySelector('.increase-qty');
    const quantityValue = productDiv.querySelector('.quantity-value');

    decreaseQtyBtn.addEventListener('click', (event) => {
        let currentQty = parseInt(quantityValue.textContent);
        if (currentQty > 1) {
            quantityValue.textContent = currentQty - 1;
            event.preventDefault();
        }
    });

    increaseQtyBtn.addEventListener('click', (event) => {
        let currentQty = parseInt(quantityValue.textContent);
        quantityValue.textContent = currentQty + 1;
        event.preventDefault();
    });
}

// Load favorites when user is authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        get(child(dbRef, '/products')).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const productData = childSnapshot.val();
                    const productImg = productData.productImage;
                    const productName = productData.productName;
                    const productIndex = childSnapshot.key;

                    displayProduct(productIndex, productImg, productName, user.uid);
                });
            } else {
                toggleNoFavoritesMessage(true);
            }
        }).catch((error) => {
            console.error('Error fetching data:', error);
        });
    }
});

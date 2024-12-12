import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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

// Toggle the display of the no-history message
function toggleNoHistoryMessage(show) {
    const noHistoryOverlay = document.getElementById('no-history-overlay');
    noHistoryOverlay.style.display = show ? 'flex' : 'none';
}

// Function to format timestamp
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Function to create order items HTML
function createOrderItemsHTML(orderItems) {
    if (!orderItems) return '';
    
    const orderItemsHTML = Object.values(orderItems).map(item => `
        <div class="order-item">
            <img src="${item.productImage}" alt="${item.productName}" class="order-item-image">
            <div class="order-item-details">
                <span class="order-item-name">${item.productName}</span>
                <span class="order-item-variant">${item.variant}</span>
                <span class="order-item-quantity">Quantity: ${item.quantity}</span>
                <span class="order-item-price">Price: ₱${item.price}</span>
            </div>
        </div>
    `).join('');
    
    return `
        <div class="order-items-container">
            <h3>Ordered Items:</h3>
            ${orderItemsHTML}
        </div>
    `;
}

// Function to create location HTML
function createLocationHTML(location) {
    if (!location) return '';
    
    return `
        <div class="history-location">
            <div class="history-detail">
                <strong>Delivery Location:</strong>
                <span class="location-name">${location.name || 'Unnamed Location'}</span>
            </div>
            <div class="history-detail">
                <strong>Address:</strong>
                <span class="location-address">${location.address || 'No address provided'}</span>
            </div>
        </div>
    `;
}

// Function to display a single history item
function displayHistoryItem(historyData) {
    const announcementsDiv = document.getElementById('AnnouncementsDiv');
    
    const historyDiv = document.createElement('div');
    historyDiv.classList.add('history-item');
    
    // Create a more detailed HTML structure for the history item
    historyDiv.innerHTML = `
        <div class="history-item-header">
            <span class="history-status">Time delivered: </span>
            <span class="history-date">${formatDate(historyData.timestamp)}</span>
        </div>
        <div class="history-item-details">
            <div class="history-detail">
                <strong>Order Time:</strong> ${historyData.orderTime}
            </div>
            <div class="history-detail">
                <strong>Contact Number:</strong> ${historyData.contactNumber}
            </div>
       
            ${createLocationHTML(historyData.location)}
            ${createOrderItemsHTML(historyData.orderItems)}
        </div>
    `;
    
    announcementsDiv.appendChild(historyDiv);
    toggleNoHistoryMessage(false); // Hide the no-history message when a history item is added
}

// Check if there is any history and toggle the message accordingly
function checkHistoryEmpty() {
    const announcementsDiv = document.getElementById('AnnouncementsDiv');
    const hasHistory = announcementsDiv.children.length > 0;
    toggleNoHistoryMessage(!hasHistory);
}

// Load user-specific history data when the user is authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Clear any existing history items
        const announcementsDiv = document.getElementById('AnnouncementsDiv');
        announcementsDiv.innerHTML = '';

        // Define the reference path for the user's history
        const userHistoryRef = child(ref(db), `users/${user.uid}/history`);
        
        get(userHistoryRef).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const historyData = childSnapshot.val();
                    displayHistoryItem(historyData); // Display each history item
                });
                
                checkHistoryEmpty(); // Check if there are items after fetching
            } else {
                toggleNoHistoryMessage(true); // Show the no-history message if no data exists
            }
        }).catch((error) => {
            console.error('Error fetching history data:', error);
            toggleNoHistoryMessage(true); // Show the no-history message in case of an error
        });
    } else {
        // User is not authenticated
        toggleNoHistoryMessage(true);
    }
});
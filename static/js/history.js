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

// Function to display a single history item
function displayHistoryItem(historyData) {
    const announcementsDiv = document.getElementById('AnnouncementsDiv');

    const historyDiv = document.createElement('div');
    historyDiv.classList.add('history-item');
    historyDiv.innerHTML = `
        <p>${historyData}</p>
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
        // Define the reference path for the user's history
        const userHistoryRef = child(ref(db), `${user.uid}/history`);

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
    }
});

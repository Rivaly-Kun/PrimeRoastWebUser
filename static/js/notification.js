import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, get, child } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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

// Open notification modal
document.getElementById('NotifBtnNav').addEventListener('click', openNotifModal);

function openNotifModal() {
    const modal = document.getElementById("NotifModal");
    modal.style.display = "block";

    const notifContent = document.getElementById("notifContent");
    notifContent.innerHTML = ""; // Clear existing content

    const user = auth.currentUser;
    if (user) {
        const notifsRef = ref(db, `users/${user.uid}/Notifications/`);
        onValue(notifsRef, (snapshot) => {
            const notifications = snapshot.val();
            
            if (notifications) {
                // Create table for notifications
                const table = document.createElement("table");
                const tableHeader = `
                    <tr>
                      
                        <th>Message</th>
                        <th>Date</th>
                    </tr>
                `;
                table.innerHTML = tableHeader;

                // Populate table with notifications
                Object.values(notifications).forEach((notif) => {
                    const row = document.createElement("tr");

                    const titleCell = document.createElement("td");
                    titleCell.textContent = notif.title || "No Title";

                    const messageCell = document.createElement("td");
                    messageCell.textContent = notif.message || "No Message";

                    const dateCell = document.createElement("td");
                    const date = new Date(notif.timestamp);
                    dateCell.textContent = date.toLocaleString();

                  
                    row.appendChild(messageCell);
                    row.appendChild(dateCell);

                    table.appendChild(row);
                });

                notifContent.appendChild(table);
            } else {
                // Display empty message if no notifications
                notifContent.innerHTML = "<p class='empty-message'>No notifications available.</p>";
            }
        });
    } else {
        notifContent.innerHTML = "<p class='empty-message'>Please log in to view notifications.</p>";
    }
}

// Close notification modal
document.getElementById('closeNotifModal').addEventListener('click', () => {
    document.getElementById("NotifModal").style.display = "none";
});


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

const supportImageURL = 'static/css/img/support.svg';  // Update with actual URL or SVG for support icon

// Open the message modal
document.getElementById('CostumerSupportbtn').addEventListener('click', openSupportModal);
document.getElementById('sendMessage').addEventListener('click', sendMessage);

function openSupportModal() {
    const modal = document.getElementById("SupportModal");
    modal.style.display = "block";
}

// Close message modal
document.getElementById('closesuportmodal').addEventListener('click', () => {
    document.getElementById("SupportModal").style.display = "none";
});

// Function to send message to Firebase
async function sendMessage() {
    const messageInput = document.getElementById("messageInput").value;
    const user = auth.currentUser;

    if (user && messageInput.trim() !== "") {
        const userMessagesRef = ref(db, `Messages/${user.uid}`);

        // Get current message index
        onValue(userMessagesRef, async (snapshot) => {
            const messages = snapshot.val() || {};
            const nextIndex = Object.keys(messages).length + 1;

            // Get user's profile data
            const userSnapshot = await get(child(ref(db), `/users/${user.uid}`));
            const profileImage = userSnapshot.exists() && userSnapshot.val().pfp ? userSnapshot.val().pfp : "default-profile.png";
            const userName = userSnapshot.exists() && userSnapshot.val().name ? userSnapshot.val().name : "Anonymous User";

            // Send message with profile image
            set(ref(db, `Messages/${user.uid}/msg-${nextIndex}`), {
                text: messageInput,
                timestamp: Date.now(),
                sender: "user",
                profileImage
            }).then(() => {
                document.getElementById("messageInput").value = ""; // Clear input field
            }).catch((error) => {
                console.error("Error sending message:", error);
                alert("Failed to send message. Try again.");
            });
        }, { onlyOnce: true });
    } else {
        alert("Please sign in and enter a message.");
    }
}

function loadMessages() {
    const user = auth.currentUser;
    if (user) {
        const userMessagesRef = ref(db, `Messages/${user.uid}`);
        onValue(userMessagesRef, (snapshot) => {
            const messages = snapshot.val() || {};
            const messageContainer = document.getElementById("messageContainer");
            messageContainer.innerHTML = "";

            Object.keys(messages).forEach((key) => {
                const messageData = messages[key];
                const messageDiv = document.createElement("div");

                // Apply classes based on sender
                if (messageData.sender === "user") {
                    messageDiv.classList.add("message", "user-message");
                } else {
                    messageDiv.classList.add("message", "support-message");
                }

                // Profile image for user or support
                const img = document.createElement("img");
                img.classList.add("profile-image");
                img.src = messageData.sender === "user" ? messageData.profileImage : supportImageURL;

                // Message content
                const textDiv = document.createElement("div");
                textDiv.classList.add("message-text");
                textDiv.textContent = messageData.text;

                messageDiv.appendChild(img);
                messageDiv.appendChild(textDiv);
                messageContainer.appendChild(messageDiv);
            });

            // Scroll to the bottom of the container for new messages
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
    }
}

// Trigger loadMessages when user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadMessages();
    }
});

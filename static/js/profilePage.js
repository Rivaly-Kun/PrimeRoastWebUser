import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword,  signInWithEmailAndPassword, signOut, sendSignInLinkToEmail,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-analytics.js";
import { getDatabase, set, ref,get,child, update} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";


// Firebase configuration
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

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase();
const realdb = getDatabase();
const dbref = ref(realdb);


document.getElementById('profile-link').addEventListener('click', async function (event) {
    event.preventDefault();

    // Get current user from Firebase Authentication
    const user = auth.currentUser;

    if (user) {
        // Get the user's UID
        const userUid = user.uid;

        try {
            // Reference to the user data in Realtime Database
            const snapshot = await get(child(dbref, `/users/${userUid}`));

            if (snapshot.exists()) {
                const userData = snapshot.val();

                // Set profile data in the modal
                const profileImage = userData.pfp || "default-profile.png";  // Use a default image if pfp is not found
                const userName = userData.name || "Anonymous User";
                const contactNumber = userData.contactNumber || "";  // Get contact number if available

                document.getElementById('modalProfileImage').src = profileImage;
                document.getElementById('modalUserNameInput').value = userName;
                document.getElementById('modalContactNumberInput').value = contactNumber;

                // Show the modal
                document.getElementById('modalProfilePage').style.display = 'flex';
            } else {
                console.log("No user data found.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
        console.log("User not logged in.");
    }
});



// Close the modal when the button is clicked
document.getElementById('closeModal').addEventListener('click', function () {
    document.getElementById('modalProfilePage').style.display = 'none';
});

// Save the profile changes
document.getElementById('saveProfileChanges').addEventListener('click', async function () {
    const user = auth.currentUser;
    const userUid = user.uid;
    const newName = document.getElementById('modalUserNameInput').value;
    const profileImageInput = document.getElementById('changeProfileImageInput');
    const profileImageFile = profileImageInput.files[0];  // Access the file from the input field


    const newContactNumber = document.getElementById('modalContactNumberInput').value;


    if (user) {
        const userUid = user.uid;

        if (newContactNumber.length === 0) {
            alert("Please enter a contact number.");
            return;
        }

        try {
            // Update contact number in Firebase Realtime Database
            await set(ref(realdb, `/users/${userUid}/contactNumber`), newContactNumber);
           // alert("Contact number updated successfully!");
        } catch (error) {
            console.error("Error updating contact number:", error);
          ///  alert("Failed to update contact number.");
        }
    } else {
        console.log("User not logged in.");
    }

    // Save the new name to Firebase
    try {
        await update(ref(realdb, `/users/${userUid}`), {
            name: newName
        });
        console.log("Name updated successfully.");
    } catch (error) {
        console.error("Error updating name:", error);
    }

    // If a new profile image is selected, upload it
    if (profileImageFile) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            const newProfileImageURL = e.target.result;
            try {
                await update(ref(realdb, `/users/${userUid}`), {
                    pfp: newProfileImageURL
                });
                console.log("Profile image updated successfully.");
                document.getElementById('modalProfileImage').src = newProfileImageURL;  // Update modal with new image
            } catch (error) {
                console.error("Error updating profile image:", error);
            }
        };
        reader.readAsDataURL(profileImageFile);
    }

    // Hide the modal after saving changes
    document.getElementById('modalProfilePage').style.display = 'none';
});

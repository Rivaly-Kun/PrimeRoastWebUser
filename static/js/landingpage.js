// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendSignInLinkToEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-analytics.js";
import { getDatabase, set, ref, get, child, update } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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
const dbref = ref(database);

'use strict';

// DOM elements
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const popupTitle = document.getElementById("popupTitle");
const authButton = document.getElementById("authButton");
const preloader = document.querySelector("[data-preaload]");
const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");
const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");
const heroSlider = document.querySelector("[data-hero-slider]");
const heroSliderItems = document.querySelectorAll("[data-hero-slider-item]");
const heroSliderPrevBtn = document.querySelector("[data-prev-btn]");
const heroSliderNextBtn = document.querySelector("[data-next-btn]");
const parallaxItems = document.querySelectorAll("[data-parallax-item]");


/*
window.addEventListener('DOMContentLoaded', (event) => {
    // Wait for the DOM to fully load before checking auth state
    onAuthStateChanged(auth, (user) => {
      // Only perform the redirection logic if the page is not already at the target location
      if (user && window.location.pathname !== '/home') {
        window.location.replace('/home');  // Redirect logged-in user to home
      } else if (!user && window.location.pathname !== '/') {
        window.location.replace('/');  // Redirect not-logged-in user to landing page
      }
    });
  });
  
*/



// Initialize Firebase Authentication


function onAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in, redirect to 'index.html'
      console.log('User loged in');
      window.location.replace('/home');  
    } else {
      // User is not logged in, redirect to 'landingpage.html'
      console.log('User not loged in');
    }
  });
}

// Call the function when you want to check the authentication state
onAuth();



 

// Preload
window.addEventListener("load", function () {
    preloader.classList.add("loaded");
    document.body.classList.add("loaded");
});

// Utility function to add event listeners to multiple elements
const addEventOnElements = function (elements, eventType, callback) {
    elements.forEach(element => element.addEventListener(eventType, callback));
};

// Navbar toggle
const toggleNavbar = function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("nav-active");
};
addEventOnElements(navTogglers, "click", toggleNavbar);

// Header and back-to-top button visibility on scroll
let lastScrollPos = 0;
const hideHeader = function () {
    const isScrollBottom = lastScrollPos < window.scrollY;
    header.classList.toggle("hide", isScrollBottom);
    lastScrollPos = window.scrollY;
};

window.addEventListener("scroll", function () {
    const scrollY = window.scrollY;
    header.classList.toggle("active", scrollY >= 50);
    backTopBtn.classList.toggle("active", scrollY >= 50);
    hideHeader();
});

// Hero slider controls
let currentSlidePos = 0;
let lastActiveSliderItem = heroSliderItems[0];

const updateSliderPos = function () {
    lastActiveSliderItem.classList.remove("active");
    heroSliderItems[currentSlidePos].classList.add("active");
    lastActiveSliderItem = heroSliderItems[currentSlidePos];
};

const slideNext = function () {
    currentSlidePos = (currentSlidePos + 1) % heroSliderItems.length;
    updateSliderPos();
};
const slidePrev = function () {
    currentSlidePos = (currentSlidePos - 1 + heroSliderItems.length) % heroSliderItems.length;
    updateSliderPos();
};
heroSliderNextBtn.addEventListener("click", slideNext);
heroSliderPrevBtn.addEventListener("click", slidePrev);

// Auto-slide with pause on hover
let autoSlideInterval = setInterval(slideNext, 7000);
addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseover", () => clearInterval(autoSlideInterval));
addEventOnElements([heroSliderNextBtn, heroSliderPrevBtn], "mouseout", () => autoSlideInterval = setInterval(slideNext, 7000));

// Parallax effect
window.addEventListener("mousemove", function (event) {
    let x = (event.clientX / window.innerWidth * 10) - 5;
    let y = (event.clientY / window.innerHeight * 10) - 5;
    x *= -1; y *= -1;
    parallaxItems.forEach(item => {
        const speed = Number(item.dataset.parallaxSpeed);
        item.style.transform = `translate3d(${x * speed}px, ${y * speed}px, 0px)`;
    });
});

// Show/hide forms
document.getElementById("showRegister").addEventListener("click", () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    popupTitle.textContent = "Sign Up";
});

document.getElementById("showLogin").addEventListener("click", () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
    popupTitle.textContent = "Sign In";
});

// Open and close pop-up
authButton.addEventListener('click', () => document.getElementById('popup').style.display = 'block');
document.getElementById('closePopup').addEventListener('click', () => document.getElementById('popup').style.display = 'none');

// Login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User logged in: ", userCredential.user);
            document.getElementById('popup').style.display = 'none';
            window.location.replace('/home');  
        })
        .catch((error) => {
            console.error("Login error: ", error.message);
            alert("Login failed: " + error.message);
        });
});

// Sign-up form submission
signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const name = document.getElementById('signupName').value;
    const contactNumber = document.getElementById('signupContact').value;

    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    if (password.length === 0 || name.length === 0 || contactNumber.length === 0) {
        alert('Please fill in all required fields.');
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const defaultPfp = "https://firebasestorage.googleapis.com/v0/b/tradingo-824d6.appspot.com/o/Pfp%2Fdefault.jpg?alt=media&token=f9ff1cb9-6c5a-4987-adff-05eb9f4d5d46";
            set(ref(database, 'users/' + user.uid), {
                pfp: defaultPfp,
                name: name,
                contactNumber: contactNumber,
                email: email
            })
            .then(() => {
                console.log("User profile information set for user:", user.uid);
                document.getElementById('popup').style.display = 'none';
            })
            .catch((error) => {
                console.error("Error setting user profile information: ", error);
            });
        })
        .catch((error) => {
            console.error("Sign-up error: ", error.message);
            alert("Sign-up failed: " + error.message);
        });
});

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}


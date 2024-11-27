const contentTitle = document.getElementById('content-title');
const dropbtn = document.querySelector('.dropbtn');
const Bread = document.getElementById('BreadcrumName');

// Select all dropdown links
const dropdownLinks = document.querySelectorAll('.dropdown-content a');

function showContent(contentId, title, activeLink) {
    // Hide all content sections
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('orders-content').style.display = 'none';
    document.getElementById('favorites-content').style.display = 'none';
    document.getElementById('history-content').style.display = 'none';

    // Display the selected content section
    document.getElementById(contentId).style.display = 'block';

    // Update the dropbtn text to the selected title
    dropbtn.textContent = title;

    // Optionally update the breadcrumb or content title, if needed
    if (contentTitle) contentTitle.textContent = title;
    if (Bread) Bread.textContent = title;

    // Remove 'active' class from all links and add to the selected link
    dropdownLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

// Add event listeners to each link
dropdownLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();  // Prevent default anchor behavior

        const contentId = link.getAttribute('data-content');
        const title = link.getAttribute('data-title');

        showContent(contentId, title, link);
    });
});

// Set "Home" as the initial active link on page load
document.addEventListener('DOMContentLoaded', () => {
    const initialLink = document.getElementById('dashboard-link');
    const initialContentId = initialLink.getAttribute('data-content');
    const initialTitle = initialLink.getAttribute('data-title');

    showContent(initialContentId, initialTitle, initialLink);
});

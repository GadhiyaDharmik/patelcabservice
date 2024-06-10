const swiper = new Swiper(".swiper", {
  direction: "horizontal",
  loop: "infinite",

  // Pagination
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});
window.addEventListener('load', function () {
  // Hide the loader smoothly
  document.getElementById('loader').style.opacity = '0';
  document.getElementById('loader').style.visibility = 'hidden';
  // Make the main content visible
  document.getElementById('content').style.visibility = 'visible';
});
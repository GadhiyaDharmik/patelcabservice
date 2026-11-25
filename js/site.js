// Shared navigation, scroll, reveal, and FAQ behavior for Patel Cab Service
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scrollTop');

  const onScroll = () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('show', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuClose = document.getElementById('menu-close');

  if (menuToggle && mobileMenu && menuClose) {
    const openMenu = () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
      menuToggle.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      menuToggle.setAttribute('aria-expanded', 'false');
    };
    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('.mob-link, .btn-brand').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length > 0 && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );
    revealItems.forEach((el) => revealObs.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('visible'));
  }

  // Contact form handler for standalone Contact page
  const contactForm = document.getElementById('contactForm');
  if (contactForm && !contactForm.dataset.bound) {
    contactForm.dataset.bound = 'true';
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = this.querySelector('button[type="submit"]');
      const d = new FormData(this);
      const name = (d.get('name') || '').toString().trim();
      const email = (d.get('email') || '').toString().trim();
      const number = (d.get('number') || '').toString().trim();
      const message = (d.get('message') || '').toString().trim();
      if (!name || !email || !number || !message) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      const msg = `Hi, I have a query.%0AName: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0APhone: ${encodeURIComponent(number)}%0AMessage: ${encodeURIComponent(message)}`;
      window.open(`https://wa.me/+919879677359?text=${msg}`, '_blank');
      setTimeout(() => {
        window.location.href = window.location.protocol === 'file:' ? 'thank-you.html' : '/thank-you.html';
      }, 300);
    });
  }
});

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  if (!answer) return;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-a').forEach((a) => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach((b) => b.classList.remove('active'));
  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('active');
  }
}


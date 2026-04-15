// Navigation Scroll Effect
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// Form Handling
const quoteForm = document.getElementById("quote-form");
const quoteStatus = document.getElementById("form-status");
const messageForm = document.getElementById("message-form");
const messageStatus = document.getElementById("message-status");

const updateStatus = (element, text) => {
  if (!element) return;
  element.textContent = text;
};

const handleFormSubmit = (event, statusElement) => {
  event.preventDefault();
  updateStatus(statusElement, "Thanks! We'll be in touch shortly.");
  event.target.reset();
};

if (quoteForm) {
  quoteForm.addEventListener("submit", (event) => handleFormSubmit(event, quoteStatus));
}

if (messageForm) {
  messageForm.addEventListener("submit", (event) => handleFormSubmit(event, messageStatus));
}

// Smooth Scrolling for Navigation
const links = document.querySelectorAll('.link, .btn-link');
links.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// Hero CTA
const heroCta = document.getElementById("hero-cta");
if (heroCta) {
  heroCta.addEventListener("click", () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

// Active Section Highlighting
let activeSection = 'home';
const sections = ['home', 'services', 'gallery', 'process', 'blog', 'contact'];

window.addEventListener('scroll', () => {
  const scrollPosition = window.scrollY + window.innerHeight / 2;

  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      const { offsetTop, offsetHeight } = section;
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        activeSection = sectionId;
      }
    }
  });
});

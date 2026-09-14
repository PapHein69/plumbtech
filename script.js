const nav = document.querySelector(".nav");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

const updateNav = () => nav?.classList.toggle("scrolled", window.scrollY > 24);

const closeMenu = () => {
  if (!menuToggle || !navMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navMenu.classList.remove("open");
  nav?.classList.remove("menu-visible");
  document.body.classList.remove("menu-open");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
  navMenu?.classList.toggle("open", !isOpen);
  nav?.classList.toggle("menu-visible", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

navMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("resize", () => { if (window.innerWidth > 760) closeMenu(); });
window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

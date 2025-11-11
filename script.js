// ===============================
// Mannrang (Mnrg) — Redirect to HTTPS + www
// ===============================
if (location.protocol !== "https:" || !location.hostname.startsWith("www.")) {
  const newUrl = "https://www.mannrang.com" + location.pathname + location.search + location.hash;
  window.location.replace(newUrl);
}

// ===============================
// Mannrang (Mnrg) — Entrance Animations Script
// ===============================

// Auto-update footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ===============================
// Highlight active navigation link
// ===============================
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".site-nav a");

function updateActiveLink() {
  let current = "";
  const scrollPos = window.scrollY + window.innerHeight / 2;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 180;
    const sectionHeight = section.clientHeight;
    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  if (window.scrollY < 150) current = "home";
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 5)
    current = "contact";

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", updateActiveLink);
window.addEventListener("load", updateActiveLink);

// ===============================
// Intersection Observer for Animations
// ===============================
const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Trigger animation by ensuring element is visible
      entry.target.style.animationPlayState = "running";
      // Don't unobserve - animations only play once due to forwards fill
    }
  });
}, observerOptions);

// Observe all elements with animations
document.querySelectorAll(
  ".hero-logo, .company-name, .company-tagline, " +
  ".tea-pack-img, .tea-right, " +
  ".Mnrg-logo, .about-right"
).forEach(el => {
  observer.observe(el);
});

// ===============================
// Disable right-click site-wide
// ===============================
document.addEventListener("contextmenu", event => {
  event.preventDefault();
  return false;
});

/* =========================================================
   Sakshanshu Kumar — Portfolio Scripts
   JS interactions:
   1. Dark / light mode toggle (saved in localStorage)
   2. Contact form validation
   3. Smooth scrolling + active nav link highlighting
   4. Typing animation, scroll reveal, skill bars, counters
   5. Mobile menu, scroll progress bar, back-to-top button
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => $("#preloader").classList.add("hide"));
  setTimeout(() => $("#preloader").classList.add("hide"), 2500); // fallback

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- 1. Theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = $("#themeToggle");
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  if (savedTheme) root.setAttribute("data-theme", savedTheme);

  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    showToast(next === "dark" ? "Dark mode on 🌙" : "Light mode on ☀️");
  });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuToggle");
  const navLinks = $("#navLinks");
  const toggleMenu = (open) => {
    menuBtn.classList.toggle("open", open);
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open);
    document.body.classList.toggle("no-scroll", open);
  };
  menuBtn.addEventListener("click", () => toggleMenu(!navLinks.classList.contains("open")));

  /* ---------- 3. Smooth scrolling ---------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      toggleMenu(false);
      window.scrollTo({ top: target.offsetTop - 70, behavior: "smooth" });
    });
  });

  /* ---------- Scroll effects: navbar, progress, back-to-top, active link ---------- */
  const navbar = $("#navbar");
  const progress = $("#progress");
  const toTop = $("#toTop");
  const sections = $$("main section");
  const links = $$(".nav-links a");

  const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 500);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    let current = "home";
    sections.forEach((sec) => { if (y >= sec.offsetTop - 140) current = sec.id; });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Typing animation ---------- */
  const words = ["B.Tech Computer Science Student", "C++ Programmer", "Web Developer", "Problem Solver"];
  const typedEl = $("#typed");
  let w = 0, c = 0, deleting = false;
  (function type() {
    const word = words[w];
    typedEl.textContent = word.slice(0, c);
    let delay = deleting ? 45 : 95;
    if (!deleting && c === word.length) { delay = 1600; deleting = true; }
    else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 400; }
    c += deleting ? -1 : 1;
    setTimeout(type, delay);
  })();

  /* ---------- Scroll reveal, skill bars, counters ---------- */
  const animateCounter = (el) => {
    const target = +el.dataset.target;
    const start = performance.now();
    const dur = 1600;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add("visible");
      el.querySelectorAll(".bar i").forEach((bar) => (bar.style.width = bar.dataset.width + "%"));
      el.querySelectorAll(".counter").forEach(animateCounter);
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.08 + "s"; // gentle stagger
    observer.observe(el);
  });

  /* ---------- 2. Contact form validation ---------- */
  const form = $("#contactForm");
  const fields = {
    name: {
      el: $("#name"),
      check: (v) => !v ? "Please enter your name."
        : v.length < 3 ? "Name must be at least 3 characters."
        : !/^[a-zA-Z\s.]+$/.test(v) ? "Name can only contain letters and spaces." : "",
    },
    email: {
      el: $("#email"),
      check: (v) => !v ? "Please enter your email."
        : !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v) ? "Please enter a valid email address." : "",
    },
    subject: {
      el: $("#subject"),
      check: (v) => !v ? "Please enter a subject."
        : v.length < 4 ? "Subject must be at least 4 characters." : "",
    },
    message: {
      el: $("#message"),
      check: (v) => !v ? "Please write a message."
        : v.length < 10 ? "Message must be at least 10 characters." : "",
    },
  };

  const validate = (key) => {
    const { el, check } = fields[key];
    const field = el.parentElement;
    const msg = check(el.value.trim());
    field.querySelector(".error").textContent = msg;
    field.classList.remove("invalid");
    void field.offsetWidth; // restart shake animation
    field.classList.toggle("invalid", !!msg);
    field.classList.toggle("valid", !msg);
    return !msg;
  };

  Object.keys(fields).forEach((key) => {
    const el = fields[key].el;
    el.addEventListener("blur", () => el.value && validate(key));
    el.addEventListener("input", () => {
      if (el.parentElement.classList.contains("invalid")) validate(key);
    });
  });

  const charCount = $("#charCount");
  fields.message.el.addEventListener("input", (e) => (charCount.textContent = e.target.value.length));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(fields).map(validate);
    const success = $("#formSuccess");

    if (results.every(Boolean)) {
      const name = fields.name.el.value.trim().split(" ")[0];
      success.textContent = `Thank you, ${name}! Your message has been received. ✓`;
      showToast("Message sent successfully!");
      form.reset();
      charCount.textContent = "0";
      $$(".field").forEach((f) => f.classList.remove("valid"));
      setTimeout(() => (success.textContent = ""), 5000);
    } else {
      success.textContent = "";
      form.querySelector(".invalid input, .invalid textarea").focus();
    }
  });

  /* ---------- Toast helper ---------- */
  let toastTimer;
  function showToast(text) {
    const toast = $("#toast");
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Toggle mobile nav
  const navButton = document.getElementById("js-toggleMobileNav");
  const nav = document.getElementById("js-nav");

  navButton.addEventListener("click", () => {
    navButton.classList.toggle("is-active");
    nav.classList.toggle("is-active");
  });

  // Toggle mobile categories
  const linkCategories = document.getElementById("js-toggleMobileCategories");
  const categories = document.getElementById("js-categories");

  linkCategories.addEventListener("click", (event) => {
    event.preventDefault();
    linkCategories.classList.toggle("is-active");
    categories.classList.toggle("is-active");
  });

  // Login overlay
  const loginLink = document.getElementById("js-loginLink");
  const login = document.getElementById("js-login");
  const loginClose = document.getElementById("js-loginClose");
  const overlay = document.getElementById("js-overlay");

  const inactiveLogin = () => {
    overlay.classList.remove("is-active");
    login.classList.remove("is-active");
  };

  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    overlay.classList.add("is-active");
    login.classList.add("is-active");

    if (overlay.classList.contains("is-active")) {
      overlay.addEventListener("click", (event) => {
        event.stopPropagation();
        if (event.target.id === "js-overlay") {
          inactiveLogin();
        }
      });
    }
  });

  loginClose.addEventListener("click", () => {
    inactiveLogin();
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "Escape") {
      inactiveLogin();
    }
  });
});

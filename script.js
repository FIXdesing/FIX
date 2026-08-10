(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Nav: scroll state + section-aware color                             */
  /* ------------------------------------------------------------------ */
  var nav = document.querySelector("[data-nav]");
  var darkSections = document.querySelectorAll(".hero, .services, .approach, .invite");
  var lightSections = document.querySelectorAll(".statement, .studio, .faq");

  function updateNav() {
    if (!nav) return;
    var scrolled = window.scrollY > 40;
    nav.classList.toggle("is-scrolled", scrolled);

    // Determine which section sits behind the nav bar.
    var navBottom = nav.getBoundingClientRect().bottom;
    var isDark = true;
    var allSections = document.querySelectorAll(".hero, .statement, .services, .studio, .approach, .faq, .invite");
    allSections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= navBottom && rect.bottom >= navBottom) {
        isDark = sec.classList.contains("hero") ||
                 sec.classList.contains("services") ||
                 sec.classList.contains("approach") ||
                 sec.classList.contains("invite");
      }
    });
    nav.classList.toggle("is-dark-section", isDark);
    nav.classList.toggle("is-light-section", !isDark);
  }

  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  /* ------------------------------------------------------------------ */
  /* Mobile menu                                                         */
  /* ------------------------------------------------------------------ */
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  var menuLinks = document.querySelectorAll("[data-menu-link]");

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.contains("is-open");
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });
    menuLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Hero load-in                                                        */
  /* ------------------------------------------------------------------ */
  window.addEventListener("load", function () {
    var hero = document.querySelector(".hero");
    if (hero) {
      requestAnimationFrame(function () {
        hero.classList.add("is-loaded");
      });
    }
  });

  /* ------------------------------------------------------------------ */
  /* Scroll reveal (IntersectionObserver)                                 */
  /* ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll("[data-reveal], .reveal-img");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------ */
  /* Servicios: tabs                                                     */
  /* ------------------------------------------------------------------ */
  var serviceTabs = document.querySelectorAll(".services__tab");
  var servicePanels = document.querySelectorAll(".services__panel");
  var serviceImgs = document.querySelectorAll(".services__img");

  function activateService(name) {
    serviceTabs.forEach(function (tab) {
      var isActive = tab.getAttribute("data-service") === name;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    servicePanels.forEach(function (panel) {
      var isActive = panel.getAttribute("data-panel") === name;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
    serviceImgs.forEach(function (img) {
      img.classList.toggle("is-active", img.getAttribute("data-service-img") === name);
    });
  }

  serviceTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activateService(tab.getAttribute("data-service"));
    });
  });

  /* keyboard arrow navigation between tabs */
  var tabsContainer = document.querySelector(".services__tabs");
  if (tabsContainer) {
    tabsContainer.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var tabsArr = Array.prototype.slice.call(serviceTabs);
      var currentIndex = tabsArr.findIndex(function (t) { return t.classList.contains("is-active"); });
      var nextIndex = e.key === "ArrowRight"
        ? (currentIndex + 1) % tabsArr.length
        : (currentIndex - 1 + tabsArr.length) % tabsArr.length;
      tabsArr[nextIndex].focus();
      activateService(tabsArr[nextIndex].getAttribute("data-service"));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Approach: accordion (single-open)                                    */
  /* ------------------------------------------------------------------ */
  var approachToggles = document.querySelectorAll("[data-approach-toggle]");

  function setPanelHeight(panel, expand) {
    if (prefersReducedMotion) {
      panel.hidden = !expand;
      return;
    }
    if (expand) {
      panel.hidden = false;
      var target = panel.scrollHeight;
      panel.style.maxHeight = "0px";
      requestAnimationFrame(function () {
        panel.style.transition = "max-height 0.5s ease";
        panel.style.maxHeight = target + "px";
      });
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
      requestAnimationFrame(function () {
        panel.style.transition = "max-height 0.4s ease";
        panel.style.maxHeight = "0px";
      });
      window.setTimeout(function () { panel.hidden = true; }, 420);
    }
  }

  approachToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var isOpen = btn.classList.contains("is-active");

      approachToggles.forEach(function (other) {
        if (other !== btn) {
          other.classList.remove("is-active");
          other.setAttribute("aria-expanded", "false");
          var otherPanel = document.getElementById(other.getAttribute("aria-controls"));
          if (otherPanel && !otherPanel.hidden) setPanelHeight(otherPanel, false);
        }
      });

      if (!isOpen) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-expanded", "true");
        setPanelHeight(panel, true);
      } else {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-expanded", "false");
        setPanelHeight(panel, false);
      }
    });
  });

  /* ------------------------------------------------------------------ */
  /* FAQ: accordion (multi-open)                                          */
  /* ------------------------------------------------------------------ */
  var faqToggles = document.querySelectorAll("[data-faq-toggle]");

  faqToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var isOpen = btn.getAttribute("aria-expanded") === "true";

      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      setPanelHeight(panel, !isOpen);
    });
  });


  /* ------------------------------------------------------------------ */
  /* Studio: portfolio availability panel                                */
  /* ------------------------------------------------------------------ */
  var portfolioOpen = document.querySelector("[data-portfolio-open]");
  var portfolioModal = document.querySelector("[data-portfolio-modal]");
  var portfolioCloseButtons = document.querySelectorAll("[data-portfolio-close]");
  var portfolioLastFocus = null;

  function closePortfolio() {
    if (!portfolioModal) return;
    portfolioModal.classList.remove("is-open");
    portfolioModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (portfolioLastFocus) portfolioLastFocus.focus();
  }

  function openPortfolio() {
    if (!portfolioModal) return;
    portfolioLastFocus = document.activeElement;
    portfolioModal.classList.add("is-open");
    portfolioModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var closeButton = portfolioModal.querySelector(".portfolio-modal__close");
    if (closeButton) closeButton.focus();
  }

  if (portfolioOpen && portfolioModal) {
    portfolioOpen.addEventListener("click", openPortfolio);
    portfolioCloseButtons.forEach(function (button) {
      button.addEventListener("click", closePortfolio);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Smooth-close mobile menu on Escape                                   */
  /* ------------------------------------------------------------------ */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;

    if (portfolioModal && portfolioModal.classList.contains("is-open")) {
      closePortfolio();
      return;
    }

    if (mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
  });

})();

/* =========================================================
   Frontdesk — shared behavior
   Include after Bootstrap's JS bundle on every page that
   reuses index.html's navbar/sections.
   ========================================================= */
(function () {
  "use strict";

  /**
   * Highlight the nav link matching the section currently in view.
   * Works on any page that has a .fd-navbar containing .nav-link
   * elements with href="#sectionId", and matching <section id="...">
   * elements in the DOM. Safe no-op if neither exists.
   */
  function initScrollSpy() {
    var navLinks = document.querySelectorAll(".fd-navbar .nav-link[href^='#']");
    if (!navLinks.length) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (section) sections.push({ id: id, el: section, link: link });
    });
    if (!sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sections.find(function (s) { return s.el === entry.target; });
          if (!match) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove("active"); });
            match.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach(function (s) { observer.observe(s.el); });
  }

  /**
   * Collapse the mobile menu automatically after a nav link is tapped,
   * so users don't have to tap the toggler again after navigating.
   */
  function initMobileNavAutoClose() {
    var navCollapse = document.getElementById("fdNavbarCollapse");
    if (!navCollapse || typeof bootstrap === "undefined") return;

    var links = navCollapse.querySelectorAll(".nav-link");
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      });
    });
  }

  /**
   * Switch the landing-page feature panels from their compact tab controller.
   * The markup stays usable without JavaScript: the first panel is visible
   * and each tab names the panel it controls.
   */
  function initFeatureCarousel() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".fd-feature-tab[data-slide]"));
    var slides = Array.prototype.slice.call(document.querySelectorAll(".fd-feature-slide"));
    if (!tabs.length || tabs.length !== slides.length) return;

    function selectSlide(index, focusTab) {
      if (index < 0 || index >= slides.length) return;
      tabs.forEach(function (tab, tabIndex) {
        var isActive = tabIndex === index;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });
      slides.forEach(function (slide, slideIndex) {
        var isActive = slideIndex === index;
        slide.hidden = !isActive;
        slide.classList.toggle("is-active", isActive);
      });
      if (focusTab) tabs[index].focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectSlide(index, false); });
      tab.addEventListener("keydown", function (event) {
        var nextIndex;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex === undefined) return;
        event.preventDefault();
        selectSlide(nextIndex, true);
      });
    });
  }

  /**
   * Make every feature-card ticker loop seamlessly. To reuse the pattern on a
   * new page, add one .fd-ticker-card-group inside a .fd-ticker-track; this
   * initializer supplies the inaccessible duplicate needed for the CSS loop.
   */
  function initFeatureTickers() {
    var tracks = document.querySelectorAll(".fd-ticker-track");
    tracks.forEach(function (track) {
      var sourceGroup = track.querySelector(".fd-ticker-card-group:not([aria-hidden='true'])");
      if (!sourceGroup || track.querySelector(".fd-ticker-card-group.is-clone")) return;

      var clone = sourceGroup.cloneNode(true);
      clone.classList.add("is-clone");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);

      function syncLoopDistance() {
        track.style.setProperty("--fd-ticker-shift", "-" + sourceGroup.getBoundingClientRect().width + "px");
      }

      syncLoopDistance();
      window.addEventListener("resize", syncLoopDistance);
      requestAnimationFrame(syncLoopDistance);
    });
  }

  /**
   * Pause the feature-card marquee while a touch is on it, since
   * touch devices have no :hover state to pause the CSS animation.
   * Works on any .fd-marquee-track found on the page.
   */
  function initMarqueeTouchPause() {
    var tracks = document.querySelectorAll(".fd-marquee-track");
    tracks.forEach(function (track) {
      track.addEventListener("touchstart", function () {
        track.classList.add("is-paused");
      }, { passive: true });
      track.addEventListener("touchend", function () {
        track.classList.remove("is-paused");
      });
    });
  }

/**
   * Toggle active state on payment method cards.
   * Works on any page containing elements with the .payment-card class.
   */
  function initPaymentToggle() {
    var paymentCards = document.querySelectorAll('.payment-card');
    
    // Safety check: only run this if payment cards actually exist on the page
    if (!paymentCards.length) return; 

    paymentCards.forEach(function (card) {
      card.addEventListener('click', function () {
        // Remove active class from all cards
        paymentCards.forEach(function (c) { 
            c.classList.remove('active'); 
        });
        // Add active class to the clicked card
        this.classList.add('active');
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initScrollSpy();
    initMobileNavAutoClose();
    initFeatureCarousel();
    initFeatureTickers();
    initMarqueeTouchPause();
    initPaymentToggle();
  });
})();

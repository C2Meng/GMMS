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
    initMarqueeTouchPause();
    initPaymentToggle();
  });
})();
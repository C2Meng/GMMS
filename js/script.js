/* =========================================================
   Frontdesk — shared behavior
   Include after Bootstrap's JS bundle on every page that
   reuses index.html's navbar/sections.
   ========================================================= */
(function () {
  "use strict";
  //placeholder function, later using php can easily include header and footer in all pages, but for now using js to include html fragments
  /**
   * Load reusable HTML fragments into any [data-include] placeholder.
   * Future pages can inherit the site chrome by adding:
   * <div data-include="index_header.html"></div> before <main>, and
   * <div data-include="index_footer.html"></div> after </main>.
   */
  function loadSharedFragments() {
    var placeholders = Array.prototype.slice.call(
      document.querySelectorAll("[data-include]"),
    );
    return Promise.all(
      placeholders.map(function (placeholder) {
        var source = placeholder.getAttribute("data-include");
        if (!source) return Promise.resolve();

        return fetch(source)
          .then(function (response) {
            if (!response.ok) throw new Error("Could not load " + source);
            return response.text();
          })
          .then(function (markup) {
            placeholder.innerHTML = markup;
            placeholder.removeAttribute("data-include");
          })
          .catch(function (error) {
            console.warn(error.message);
          });
      }),
    );
  }

  /**
   * Highlight the nav link matching the section currently in view.
   * Works on any page that has a .fd-navbar containing .nav-link
   * elements with href="#sectionId", and matching <section id="...">
   * elements in the DOM. Safe no-op if neither exists.
   */
  function initScrollSpy() {
    var navLinks = document.querySelectorAll(".fd-navbar .nav-link[href*='#']");
    if (!navLinks.length) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").split("#")[1];
      var section = document.getElementById(id);
      if (section) sections.push({ id: id, el: section, link: link });
    });
    if (!sections.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sections.find(function (s) {
            return s.el === entry.target;
          });
          if (!match) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("active");
            });
            match.link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach(function (s) {
      observer.observe(s.el);
    });
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
    var tabs = Array.prototype.slice.call(
      document.querySelectorAll(".fd-feature-tab[data-slide]"),
    );
    var slides = Array.prototype.slice.call(
      document.querySelectorAll(".fd-feature-slide"),
    );
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
      tab.addEventListener("click", function () {
        selectSlide(index, false);
      });
      tab.addEventListener("keydown", function (event) {
        var nextIndex;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft")
          nextIndex = (index - 1 + tabs.length) % tabs.length;
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
      var sourceGroup = track.querySelector(
        ".fd-ticker-card-group:not([aria-hidden='true'])",
      );
      if (!sourceGroup || track.querySelector(".fd-ticker-card-group.is-clone"))
        return;

      var clone = sourceGroup.cloneNode(true);
      clone.classList.add("is-clone");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);

      function syncLoopDistance() {
        track.style.setProperty(
          "--fd-ticker-shift",
          "-" + sourceGroup.getBoundingClientRect().width + "px",
        );
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
      track.addEventListener(
        "touchstart",
        function () {
          track.classList.add("is-paused");
        },
        { passive: true },
      );
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
    var paymentCards = document.querySelectorAll(".payment-card");

    // Safety check: only run this if payment cards actually exist on the page
    if (!paymentCards.length) return;

    paymentCards.forEach(function (card) {
      card.addEventListener("click", function () {
        // Remove active class from all cards
        paymentCards.forEach(function (c) {
          c.classList.remove("active");
        });
        // Add active class to the clicked card
        this.classList.add("active");
      });
    });
  }

  /**
   * Toggle between Membership Freezing and Cancellation tabs.
   * Safe no-op if elements aren't on the page.
   */
  function initFreezeCancelTabs() {
    var tabFreezing = document.getElementById("tab-freezing");
    var tabCancellation = document.getElementById("tab-cancellation");
    var sectionFreezing = document.getElementById("section-freezing");
    var sectionCancellation = document.getElementById("section-cancellation");

    // Safety check: only run if all elements exist on the current page
    if (
      !tabFreezing ||
      !tabCancellation ||
      !sectionFreezing ||
      !sectionCancellation
    )
      return;

    tabFreezing.addEventListener("click", function () {
      tabFreezing.classList.add("active");
      tabCancellation.classList.remove("active");
      sectionFreezing.classList.remove("d-none");
      sectionCancellation.classList.add("d-none");
    });

    tabCancellation.addEventListener("click", function () {
      tabCancellation.classList.add("active");
      tabFreezing.classList.remove("active");
      sectionCancellation.classList.remove("d-none");
      sectionFreezing.classList.add("d-none");
    });
  }

  /**
   * Toggle active state on freeze period selection buttons.
   * Safe no-op if elements aren't on the page.
   */
  function initFreezePeriodSelection() {
    var freezeBtns = document.querySelectorAll(".freeze-period-btn");
    if (!freezeBtns.length) return;

    freezeBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        freezeBtns.forEach(function (c) {
          c.classList.remove("active");
        });
        this.classList.add("active");
      });
    });
  }

  /**
   * Handle File Upload Appearance Change
   */
  function initFileUpload() {
    var fileInput = document.getElementById("attachment-input");
    var fileLabel = document.getElementById("attachment-label");

    if (!fileInput || !fileLabel) return;

    fileInput.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        var fileName = this.files[0].name;
        // Update styling to show success
        fileLabel.innerHTML =
          '<i class="bi bi-file-earmark-check-fill text-success me-1"></i> ' +
          fileName;
        fileLabel.classList.remove(
          "border-secondary",
          "text-muted",
          "bg-light",
        );
        fileLabel.classList.add("border-success", "text-dark");
        fileLabel.style.backgroundColor = "#e8f5e9"; // Light green background
      } else {
        // Reset to default
        fileLabel.innerHTML =
          '<i class="bi bi-upload me-1"></i> Click to upload attachment (e.g., medical receipt)';
        fileLabel.classList.add("border-secondary", "text-muted", "bg-light");
        fileLabel.classList.remove("border-success", "text-dark");
        fileLabel.style.backgroundColor = "";
      }
    });
  }

  /**
   * Handle HTML5 Canvas Signature Pad inside Modal
   */
  function initSignaturePad() {
    var canvas = document.getElementById("signature-pad");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var drawing = false;
    var hasDrawn = false;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";

    // Resize canvas width dynamically when modal opens so drawing isn't distorted
    var sigModal = document.getElementById("signatureModal");
    sigModal.addEventListener("shown.bs.modal", function () {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      // Re-apply context styles after resizing
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000000";
    });

    // Drawing logic
    function getMousePos(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.clientX || (e.touches && e.touches[0].clientX);
      var clientY = e.clientY || (e.touches && e.touches[0].clientY);
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }

    function startPosition(e) {
      drawing = true;
      hasDrawn = true;
      draw(e);
    }

    function endPosition() {
      drawing = false;
      ctx.beginPath();
    }

    function draw(e) {
      if (!drawing) return;
      e.preventDefault(); // Prevent page scrolling on touch devices
      var pos = getMousePos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    // Mouse events
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", endPosition);
    canvas.addEventListener("mousemove", draw);

    // Touch events for mobile
    canvas.addEventListener("touchstart", startPosition, { passive: false });
    canvas.addEventListener("touchend", endPosition);
    canvas.addEventListener("touchmove", draw, { passive: false });

    // Clear Button
    document
      .getElementById("btn-clear-signature")
      .addEventListener("click", function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
      });

    // Save Button
    document
      .getElementById("btn-save-signature")
      .addEventListener("click", function () {
        if (!hasDrawn) {
          alert("Please draw your signature before saving.");
          return;
        }

        // Convert canvas drawing to image URL
        var dataURL = canvas.toDataURL();

        // Update elements on main page
        var resultImg = document.getElementById("signature-result");
        var icon = document.getElementById("signature-icon");
        var text = document.getElementById("signature-text");
        var container = document.getElementById("signature-container");

        resultImg.src = dataURL;
        resultImg.classList.remove("d-none");
        icon.classList.add("d-none");
        text.classList.add("d-none");

        container.classList.remove("bg-light", "border-secondary");
        container.classList.add("bg-white", "border-success");

        // Hide modal
        var modalInstance = bootstrap.Modal.getInstance(sigModal);
        modalInstance.hide();
      });
  }

  /**
   * Handle Desktop Horizontal Scrolling for Hot Deals
   */
function initDealsScroll() {
    var container = document.getElementById('deals-container');
    var btnLeft = document.querySelector('.deals-scroll-left');
    var btnRight = document.querySelector('.deals-scroll-right');

    if (!container || !btnLeft || !btnRight) return;

    // The scroll amount is roughly the width of one card + the gap (220px + 16px)
    var scrollAmount = 236; 

    btnLeft.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent button from submitting or refreshing
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    btnRight.addEventListener('click', function(e) {
        e.preventDefault();
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadSharedFragments().then(function () {
      initScrollSpy();
      initMobileNavAutoClose();
      initFeatureCarousel();
      initFeatureTickers();
      initMarqueeTouchPause();
      initPaymentToggle();
      initFreezeCancelTabs();
      initFreezePeriodSelection();
      initFileUpload();
      initSignaturePad();
      initDealsScroll();
    });
  });
})();

(() => {
  if (document.querySelector(".db-sidebar")) {
    return;
  }

  const currentPage =
    window.location.pathname.split("/").pop() || "dashboard.html";
  const links = [
    {
      label: "Management",
      items: [
        ["dashboard.html", "dashboard", "Dashboard"],
        ["members.html", "group", "Members"],
        ["schedule.html", "calendar_month", "Schedule"],
        ["sessions.html", "open_in_full", "Sessions"],
        ["leads.html", "person_add", "Leads"],
        ["../user/user_attendance_qr.html", "how_to_reg", "Attendance"],
        ["../user/user_upcoming_billing.html", "leaderboard", "Reports"],
        ["request.html", "help", "Requests"],
        ["../user/user_upcoming_billing.html", "payments", "Payments"],
      ],
    },
    {
      label: "Administration",
      items: [
        ["plans.html", "description", "Plans"],
        ["../user/user_freeze_cancel_request.html", "policy", "Policies"],
        ["staff.html", "work", "Staff"],
        ["../user/user_feedback.html", "history", "Audit"],
      ],
    },
  ];

  const sidebar = document.createElement("aside");
  sidebar.className =
    "offcanvas-lg offcanvas-start db-sidebar db-admin-sidebar";
  sidebar.id = "dbAdminSidebar";
  sidebar.tabIndex = -1;
  sidebar.setAttribute("aria-label", "Admin navigation");
  sidebar.innerHTML = `
    <div class="offcanvas-header d-lg-none">
      <span class="db-mobile-title">Frontdesk</span>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        data-bs-target="#dbAdminSidebar"
        aria-label="Close"
      ></button>
    </div>
    <div class="offcanvas-body p-0">
      <div class="db-sidebar-body">
        <a href="../user/user_attendance_qr.html" class="db-quick-checkin">
          <span class="material-symbols-outlined fill">bolt</span>
          Quick Check-in
        </a>
        ${links
          .map(
            (section) => `
              <div class="db-nav-label">${section.label}</div>
              <ul class="db-nav">
                ${section.items
                  .map(
                    ([href, icon, label]) => `
                      <li>
                        <a href="${href}" class="db-nav-link${
                          href === currentPage ? " active" : ""
                        }">
                          <span class="material-symbols-outlined">${icon}</span>
                          ${label}
                        </a>
                      </li>`,
                  )
                  .join("")}
              </ul>`,
          )
          .join("")}
      </div>
    </div>`;

  const mobileTopbar = document.createElement("div");
  mobileTopbar.className = "db-mobile-topbar d-lg-none";
  mobileTopbar.innerHTML = `
    <button
      class="db-menu-toggle"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#dbAdminSidebar"
      aria-controls="dbAdminSidebar"
      aria-label="Open admin navigation"
    >
      <span class="material-symbols-outlined">menu</span>
    </button>
    <span class="db-mobile-title">Frontdesk</span>`;

  document.body.classList.add("admin-page");
  document.body.prepend(mobileTopbar);
  document.body.prepend(sidebar);
})();

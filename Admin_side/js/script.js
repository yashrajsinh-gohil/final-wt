// js/script.js
// Basic client-side script for Report and Setting page
(function () {
  // Utility: format number with commas
  function fmt(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Get current DOM elements
  const reportPeriodEl = document.getElementById("reportPeriod");
  const reportStatsEl = document.getElementById("reportStats");
  const reportDateRange = document.getElementById("reportDateRange");
  const reportType = document.getElementById("reportType");

  // Sample generator - replace with real data fetch
  function buildSampleData(range, type) {
    // You can implement real fetching here (fetch('/api/reports?...'))
    // For now return deterministic-ish data based on selections
    let base = 100;
    if (range === "daily") base = 20;
    if (range === "monthly") base = 400;
    if (type === "revenue") {
      return {
        delivered: base + 45,
        inTransit: Math.round(base * 0.25),
        pending: Math.round(base * 0.15),
        issues: Math.round(base * 0.05),
        revenue: (base + 200) * 100
      };
    }
    return {
      delivered: base + 45,
      inTransit: Math.round(base * 0.26),
      pending: Math.round(base * 0.12),
      issues: Math.round(base * 0.04),
      revenue: (base + 150) * 100
    };
  }

  // Render stats into #reportStats
  function renderStats(data) {
    // Clear existing children
    reportStatsEl.innerHTML = "";

    function col(title, value, className) {
      const c = document.createElement("div");
      c.className = "col";
      c.innerHTML = `<h3 class="${className} fw-bold">${value}</h3><small class="text-muted">${title}</small>`;
      return c;
    }

    reportStatsEl.appendChild(col("Delivered", fmt(data.delivered), "text-success"));
    reportStatsEl.appendChild(col("In Transit", fmt(data.inTransit), "text-warning"));
    reportStatsEl.appendChild(col("Pending", fmt(data.pending), "text-primary"));
    reportStatsEl.appendChild(col("Issues", fmt(data.issues), "text-danger"));
    reportStatsEl.appendChild(col("Revenue", "₹" + fmt(data.revenue), "text-dark"));
  }

  // Public API: generateReport - called by Preview button
  window.generateReport = function generateReport() {
    const range = (reportDateRange && reportDateRange.value) || "weekly";
    const type = (reportType && reportType.value) || "delivery";

    // Update period text
    const periodText = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly"
    }[range] || "Weekly";
    if (reportPeriodEl) reportPeriodEl.textContent = periodText;

    // Simulate loading state
    const previewBtn = document.querySelector("button[onclick='generateReport()']");
    if (previewBtn) {
      previewBtn.disabled = true;
      const old = previewBtn.innerHTML;
      previewBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
    }

    // Simulate async fetch
    setTimeout(() => {
      const data = buildSampleData(range, type);
      renderStats(data);

      if (previewBtn) {
        previewBtn.disabled = false;
        previewBtn.innerHTML = '<i class="fas fa-eye me-2"></i>Preview';
      }
    }, 450);
  };

  // Public API: exportCSV - create CSV from current preview
  window.exportCSV = function exportCSV() {
    // Collect values from reportStats
    try {
      const cols = reportStatsEl.querySelectorAll(".col");
      if (!cols || cols.length === 0) {
        alert("No report data available. Click Preview first.");
        return;
      }

      const rows = [];
      cols.forEach(col => {
        const label = (col.querySelector("small") || {}).textContent || "";
        const value = (col.querySelector("h3") || {}).textContent || "";
        rows.push([label.trim(), value.trim()]);
      });

      // Build CSV text
      let csv = "Metric,Value\r\n";
      rows.forEach(r => {
        // Escape quotes if any
        csv += `"${r[0].replace(/"/g, '""')}","${r[1].replace(/"/g, '""')}"\r\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const filename = `report-₹{(reportDateRange && reportDateRange.value) || "weekly"}-₹{(reportType && reportType.value) || "report"}.csv`;

      if (navigator.msSaveBlob) { // IE10+
        navigator.msSaveBlob(blob, filename);
      } else {
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("exportCSV error:", err);
      alert("Unable to export CSV. See console for details.");
    }
  };

  // Public API: exportPDF - open printable window of the report
  window.exportPDF = function exportPDF() {
    // Prepare header info
    const periodText = (reportPeriodEl && reportPeriodEl.textContent) || "Report";
    const typeText = (reportType && reportType.options[reportType.selectedIndex].text) || "";

    // Grab report HTML
    const reportHtml = `
      <html>
        <head>
          <title>${typeText} - ${periodText}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            .report-header { margin-bottom: 20px; }
            .report-header h2 { margin: 0 0 6px 0; }
            .stats { display:flex; gap:12px; flex-wrap:wrap; }
            .stat { padding:12px; border:1px solid #ddd; border-radius:6px; min-width:120px; text-align:center; }
            .stat h3 { margin:0 0 6px 0; }
            small { color: #666; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h2>₹{typeText}</h2>
            <div>₹{periodText}</div>
            <hr>
          </div>
          <div class="stats">
            ${Array.from(reportStatsEl.querySelectorAll(".col")).map(col => {
              const title = (col.querySelector("small")||{}).textContent || "";
              const value = (col.querySelector("h3")||{}).textContent || "";
              return `<div class="stat"><h3>${value}</h3><small>${title}</small></div>`;
            }).join("")}
          </div>
        </body>
      </html>`;

    const w = window.open("", "_blank");
    if (!w) {
      alert("Popup blocked. Allow popups to use PDF export or use the Print option manually.");
      return;
    }
    w.document.open();
    w.document.write(reportHtml);
    w.document.close();
    // Give it a bit to render, then call print
    setTimeout(() => {
      w.focus();
      w.print();
    }, 300);
  };

  // Simple logout handler - replace with real logout flow if needed
  window.logout = function logout() {
    // If you have an API, call it here then redirect.
    // For now just redirect to login or show an alert.
    if (confirm("Are you sure you want to log out?")) {
      window.location.href = "/login.html"; // adjust as necessary
    }
  };

  // Profile form handling
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      const username = document.getElementById("profileUsername").value.trim();
      const email = document.getElementById("profileEmail").value.trim();
      const phone = document.getElementById("profilePhone").value.trim();
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (!username || !email) {
        alert("Please fill in username and email.");
        return;
      }

      if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
          alert("New password and confirm password do not match.");
          return;
        }
        if (newPassword.length < 6) {
          alert("New password should be at least 6 characters.");
          return;
        }
      }

      // TODO: send to server via fetch(). Here we simulate success.
      setTimeout(() => {
        alert("Profile saved successfully (simulated).");
        // Clear password fields
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
      }, 350);
    });
  }

  // System form handling
  const systemForm = document.getElementById("systemForm");
  if (systemForm) {
    systemForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      const email = document.getElementById("supportEmail").value.trim();
      const phone = document.getElementById("supportPhone").value.trim();

      if (!email) {
        alert("Support email is required.");
        return;
      }

      // TODO: send to server. Simulate save.
      setTimeout(() => {
        alert("System settings saved (simulated).");
      }, 250);
    });
  }

  // Initialize: render default preview on load
  document.addEventListener("DOMContentLoaded", function () {
    // If there are default stats in the HTML, leave them; otherwise call generateReport
    const hasStats = reportStatsEl && reportStatsEl.children && reportStatsEl.children.length > 0;
    if (!hasStats) {
      window.generateReport();
    } else {
      // If you want the generated version to replace the static numbers, uncomment:
      // window.generateReport();
    }
  });
})();

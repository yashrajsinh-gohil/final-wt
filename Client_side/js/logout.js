// logout.js
// Provides a logout() function used by client pages.
function logout() {
  try {
    // Clear session and local storage (best-effort)
    sessionStorage.clear();
    localStorage.clear();
  } catch (e) {
    // ignore
  }
  // Redirect to the client login page (relative path)
  window.location.href = 'Login Admin and Client.html';
}

// Attach click handler for any future elements with data-logout attribute
document.addEventListener('click', function (e) {
  var target = e.target;
  if (target && (target.id === 'logout-link' || target.getAttribute && target.getAttribute('data-logout') !== null)) {
    e.preventDefault();
    logout();
  }
});

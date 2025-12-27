export function logoutUser() {
  localStorage.removeItem("bravo_admin_token");
  localStorage.removeItem("braov_admin");
  localStorage.removeItem('bravo_admin_base_url');
  localStorage.removeItem('theme');
  window.location.href = "/admin";
}

export function logoutUser() {
  localStorage.removeItem('bravo_designer');
  localStorage.removeItem('bravo_designer_token');
  localStorage.removeItem('bravo_designer_base_url');
  localStorage.removeItem('theme');
  window.location.href = "/designer/login";
}

export function logoutUser() {
  localStorage.removeItem('bravo_user');
  localStorage.removeItem('bravo_user_token');
  localStorage.removeItem('bravo_user_base_url');
  localStorage.removeItem('theme');
  window.location.href = "/user";
}

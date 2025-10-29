export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("designer");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("designer");
  
  // redirect to login
  window.location.href = "/designer/login";
}

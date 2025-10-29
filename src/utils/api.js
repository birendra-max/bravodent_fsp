import { logoutUser } from "./auth";

const BASE_URL = "http://localhost/bravodent_ci/";

let isLoggingOut = false; // 🔒 Prevent multiple logouts overlapping

export async function fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    try {
        const response = await fetch(BASE_URL + endpoint, {
            ...options,
            headers,
        });

        // Token expired or unauthorized
        if (response.status === 401 || response.status === 403) {
            if (!isLoggingOut) {
                isLoggingOut = true;
                alert("Session expired. Please log in again.");
                logoutUser();
            }
            return null;
        }

        // Safely parse JSON
        const data = await response.json().catch(() => null);

        if (
            data?.error &&
            (data.error === "Invalid or expired token" ||
                data.message === "Token expired")
        ) {
            if (!isLoggingOut) {
                isLoggingOut = true;
                alert("Invalid or expired token. Please log in again.");
                logoutUser();
            }
            return null;
        }

        return data;
    } catch (err) {
        console.error("API error:", err);
        if (!isLoggingOut) {
            isLoggingOut = true;
            logoutUser();
        }
        return null;
    }
}

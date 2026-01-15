import { logoutUser } from "./userauth";

let logoutInProgress = false;
let logoutTimer = null;

export async function fetchWithAuth(endpoint, options = {}) {
    let token = localStorage.getItem("bravo_user_token");
    let base_url = localStorage.getItem('bravo_user_base_url');

    if (logoutInProgress) {
        return null;
    }

    if (!token || token === "null" || token === "undefined" || token.trim() === "") {
        token = null;
    }

    if (!base_url || base_url === "null" || base_url === "undefined" || base_url.trim() === "") {
        base_url = null;
    }

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Tenant': 'bravodent',
        ...options.headers,
    };

    try {
        const response = await fetch(base_url + endpoint, {
            ...options,
            headers,
        });

        if (response.status === 401 || response.status === 403) {
            if (!logoutInProgress) {
                logoutInProgress = true;
                
                if (logoutTimer) {
                    clearTimeout(logoutTimer);
                }
                
                logoutTimer = setTimeout(() => {
                    alert("Session expired. Please log in again.");
                    logoutUser();
                    setTimeout(() => {
                        logoutInProgress = false;
                        logoutTimer = null;
                    }, 1000);
                }, 100);
            }
            return null;
        }

        const data = await response.json().catch(() => null);

        if (
            data?.error &&
            (data.error === "Invalid or expired token" ||
                data.message === "Token expired")
        ) {
            if (!logoutInProgress) {
                logoutInProgress = true;
                
                if (logoutTimer) {
                    clearTimeout(logoutTimer);
                }
                
                logoutTimer = setTimeout(() => {
                    alert("Invalid or expired token. Please log in again.");
                    logoutUser();
                    setTimeout(() => {
                        logoutInProgress = false;
                        logoutTimer = null;
                    }, 1000);
                }, 100);
            }
            return null;
        }

        return data;
    } catch (err) {
        if (token && !logoutInProgress && err.name !== 'AbortError') {
            logoutInProgress = true;
            
            if (logoutTimer) {
                clearTimeout(logoutTimer);
            }
            
            logoutTimer = setTimeout(() => {
                logoutUser();
                setTimeout(() => {
                    logoutInProgress = false;
                    logoutTimer = null;
                }, 1000);
            }, 100);
        }
        return null;
    } finally {
        for (let key in headers) {
            delete headers[key];
        }
    }
}
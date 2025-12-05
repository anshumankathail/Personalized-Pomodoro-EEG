const API_BASE_URL = 'http://localhost:5000/api';

type Preferences = {
  notifications: boolean;
  soundEffects: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  shortBreakDuration: number;
  longBreakDuration: number;
  focusDuration: number;
};

// ----------------------- AUTH -----------------------

// export async function loginUser(data: { email: string; password: string }) {
//   try {
//     const res = await fetch(`${API_BASE_URL}/auth/login`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data),
//     });

//     const json = await res.json();

//     if (!res.ok || !json.success) {
//       return {
//         success: false,
//         error: json.error || "Login failed. Please check your credentials.",
//       };
//     }

//     return json;
//   } catch (err) {
//     console.error("Login error:", err);
//     return { success: false, error: "Network error" };
//   }
// }

// Demo implementation: Allow any username and password
export async function loginUser(data: { email: string; password: string }) {
  try {
    // Simulate successful login
    const demoToken = "demo-token";
    localStorage.setItem("token", demoToken);

    return {
      success: true,
      message: "Login successful (demo mode)",
      token: demoToken,
    };
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, error: "Unexpected error" };
  }
}

export async function signupUser(data: { name: string; email: string; password: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/createuser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error || 'Signup failed. Please check your input or try a different email.',
      };
    }

    return json;
  } catch (err) {
    console.error("Signup error:", err);
    return { success: false, error: "Network error" };
  }
}

export async function fetchUserDetails() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/auth/getuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token || "",
      },
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: "Failed to fetch user" };
    }

    return { success: true, user: json };
  } catch (err) {
    console.error("Fetch user error:", err);
    return { success: false, error: "Network error" };
  }
}

export async function updateUserProfile(data: {
  name: string;
  email: string;
  preferences: Preferences;
}) {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/auth/updateuser`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token || "",
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return {
        success: false,
        error: json.error || "Failed to update user settings.",
      };
    }

    return json;
  } catch (err) {
    console.error("Update profile error:", err);
    return { success: false, error: "Network error" };
  }
}

// ----------------------- PREDICTION -----------------------

export async function predictFocusState(data: number[][]) {
  try {
    const res = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }), // shape: 6x320
    });

    const json = await res.json();

    if (!res.ok) {
      return { success: false, error: json.detail || 'Prediction failed' };
    }

    return { success: true, result: json.result };
  } catch (err) {
    console.error("Prediction request failed:", err);
    return { success: false, error: "Network error while predicting focus state" };
  }
}

// ----------------------- SESSIONS -----------------------

export async function saveSession(result: "focused" | "unfocused", duration: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/session/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "auth-token": token!,
    },
    body: JSON.stringify({ result, duration }),
  });

  return await res.json();
}

export async function fetchAllSessions() {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE_URL}/session/all`, {
      headers: {
        "Content-Type": "application/json",
        "auth-token": token || "",
      },
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to fetch sessions" };
    }

    return { success: true, sessions: json.sessions };
  } catch (err) {
    console.error("Error fetching all sessions:", err);
    return { success: false, error: "Network error" };
  }
}

export async function fetchLast5Sessions() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}/session/last5`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
}
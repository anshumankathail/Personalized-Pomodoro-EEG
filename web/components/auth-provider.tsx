"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// import { loginUser, signupUser } from "@/lib/api"

type Preferences = {
  notifications: boolean
  soundEffects: boolean
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

type User = {
  email: string
  name?: string
  preferences?: Preferences
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Commented out the old logic
    /*
    try {
      const res = await loginUser({ email, password })

      if (res.success) {
        localStorage.setItem("token", res.authToken)

        // Fetch full user info using /getuser
        const userRes = await fetch("http://localhost:5000/api/auth/getuser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": res.authToken,
          },
        })

        const userData = await userRes.json()

        if (!userRes.ok) throw new Error("Failed to fetch user")

        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)

        router.push("/dashboard")
        return true
      }

      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
    */

    // New demo logic
    const demoUser = {
      email,
      name: "Demo User",
      preferences: {
        notifications: true,
        soundEffects: true,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      },
    }

    localStorage.setItem("token", "demo-token")
    localStorage.setItem("user", JSON.stringify(demoUser))
    setUser(demoUser)
    router.push("/dashboard")
    return true
  }

  const signup = async (email: string, password: string, name: string) => {
    // Commented out the old logic
    /*
    try {
      const res = await signupUser({ email, password, name })

      if (res.success) {
        const userData = {
          email,
          name,
          preferences: {
            notifications: true,
            soundEffects: true,
            autoStartBreaks: false,
            autoStartPomodoros: false,
          },
        }

        localStorage.setItem("token", res.authToken)
        localStorage.setItem("user", JSON.stringify(userData))
        setUser(userData)
        router.push("/dashboard")
        return true
      } else {
        console.error("Signup failed:", res.error)
        return false
      }
    } catch (error) {
      console.error("Signup failed (network):", error)
      return false
    }
    */

    // New demo logic
    const demoUser = {
      email,
      name,
      preferences: {
        notifications: true,
        soundEffects: true,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      },
    }

    localStorage.setItem("token", "demo-token")
    localStorage.setItem("user", JSON.stringify(demoUser))
    setUser(demoUser)
    router.push("/dashboard")
    return true
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
import { createContext, useContext, useState, type ReactNode } from "react";
import type { LoginRequest } from "../models/login-request";
import type { LoginResponse } from "../models/login-response";

const TOKEN_KEY = "token";

interface AuthContextValue {
    token: string | null;
    login: (request: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    // læs et eksisterende token, så login bevares ved reload i samme fane
    const [token, setToken] = useState<string | null>(() =>
        sessionStorage.getItem(TOKEN_KEY),
    );

    async function login(request: LoginRequest) {
        let response: Response;
        try {
            response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
            });
        } catch {
            throw new Error("Kunne ikke nå serveren. Prøv igen senere.");
        }

        if (response.status === 401) {
            throw new Error("Forkert brugernavn eller adgangskode.");
        }
        if (!response.ok) {
            throw new Error(`Login fejlede (HTTP ${response.status}).`);
        }

        const data: LoginResponse = await response.json();
        sessionStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
    }

    function logout() {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth skal bruges inde i en AuthProvider");
    }
    return context;
}
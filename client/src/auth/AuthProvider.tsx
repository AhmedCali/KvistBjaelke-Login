import { createContext, useContext, useState, type ReactNode } from "react";
import type { LoginRequest } from "../models/login-request";
import type { LoginResponse } from "../models/login-response";

const SESSION_KEY = "session";

export interface RegisterRequest {
    username: string;
    password: string;
}

interface AuthContextValue {
    session: LoginResponse | null;
    login: (request: LoginRequest) => Promise<void>;
    register: (request: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Læs en gemt session, så login bevares ved reload i samme fane
function readSession(): LoginResponse | null {
    try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        return saved ? (JSON.parse(saved) as LoginResponse) : null;
    } catch {
        return null;
    }
}

async function postJson(url: string, body: unknown): Promise<Response> {
    try {
        return await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch {
        throw new Error("Kunne ikke nå serveren. Prøv igen senere.");
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<LoginResponse | null>(readSession);

    async function login(request: LoginRequest) {
        const response = await postJson("/api/auth/login", request);

        if (response.status === 401) {
            throw new Error("Forkert brugernavn eller adgangskode.");
        }
        if (!response.ok) {
            throw new Error(`Login fejlede (HTTP ${response.status}).`);
        }

        const data: LoginResponse = await response.json();
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
        setSession(data);
    }

    async function register(request: RegisterRequest) {
        const response = await postJson("/api/auth/register", request);

        if (response.status === 409) {
            throw new Error("Brugernavnet er allerede taget.");
        }
        if (!response.ok) {
            throw new Error(`Kunne ikke oprette kontoen (HTTP ${response.status}).`);
        }
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        setSession(null);
    }

    return (
        <AuthContext.Provider value={{ session, login, register, logout }}>
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
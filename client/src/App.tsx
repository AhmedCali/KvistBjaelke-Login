import "./index.css";

import { useState, type FormEvent } from "react";
import type { LoginRequest} from "./models/login-request";
import { useAuth } from "./auth/AuthProvider";

export function App() {
    const { token, login, logout } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); // stopper sidens reload
        setError(null);
        setLoading(true);

        const request: LoginRequest = { username, password };
        try {
            await login(request);
            setPassword(""); // ryd adgangskoden efter login
        } catch (err) {
            setError(err instanceof Error ? err.message : "Noget gik galt.");
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="app">
            <h1>Kvist & Bjælke</h1>

            {token ? (
                <div>
                    <p>Du er logget ind.</p>
                    <button onClick={logout}>Log ud</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Brugernavn</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Adgangskode</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? "Logger ind..." : "Log ind"}
                    </button>
                    {error && <p role="alert">{error}</p>}
                </form>
            )}
        </div>
    );
}

export default App;
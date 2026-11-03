import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthProvider";
import { RegisterDialog } from "../auth/RegisterDialog";
import { Brand } from "../components/Brand";

export function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); // stopper sidens reload
        setError(null);
        setNotice(null);
        setLoading(true);

        try {
            await login({ username, password });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Noget gik galt.");
            setPassword(""); // ryd adgangskoden efter et fejlet forsøg
        } finally {
            setLoading(false);
        }
    }

    function handleRegistered(newUsername: string) {
        setShowRegister(false);
        setUsername(newUsername);
        setPassword("");
        setError(null);
        setNotice("Din konto er oprettet. Log ind for at fortsætte.");
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <Brand />

                <div>
                    <h1>Log ind</h1>
                    <p className="muted">Velkommen tilbage. Log ind for at fortsætte.</p>
                </div>

                {notice && <div className="alert alert-success">{notice}</div>}

                <form className="form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="username">Brugernavn</label>
                        <input
                            id="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Adgangskode</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="alert alert-error" role="alert">{error}</div>}

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? "Logger ind..." : "Log ind"}
                    </button>
                </form>

                <p className="auth-footer">
                    Har du ikke en konto?{" "}
                    <button type="button" className="link-button" onClick={() => setShowRegister(true)}>
                        Opret konto
                    </button>
                </p>
            </div>

            {showRegister && (
                <RegisterDialog
                    onClose={() => setShowRegister(false)}
                    onRegistered={handleRegistered}
                />
            )}
        </main>
    );
}
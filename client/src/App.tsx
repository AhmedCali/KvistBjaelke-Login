import "./index.css";

import { useAuth } from "./auth/AuthProvider";
import { LoginPage } from "./pages/LoginPage";
import { UsersPage } from "./pages/UsersPage";

export function App() {
    const { session } = useAuth();

    // Ikke logget ind: login-siden. Logget ind: brugeroversigten.
    return session ? <UsersPage /> : <LoginPage />;
}

export default App;
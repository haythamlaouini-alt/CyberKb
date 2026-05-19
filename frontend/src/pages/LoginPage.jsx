import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        if (!username) {
          setError("Le nom d'utilisateur est requis.");
          setLoading(false);
          return;
        }
        if (password !== passwordConfirm) {
          setError("Les mots de passe ne correspondent pas.");
          setLoading(false);
          return;
        }
        await register({
          email,
          username,
          first_name: firstName,
          last_name: lastName,
          password,
          password_confirm: passwordConfirm,
        });
        setSuccess("Inscription réussie ! Connexion...");
      } else {
        await login({ email, password });
      }
    } catch (err) {
      console.error(err);
      const responseData = err.response?.data;
      if (responseData) {
        // Parse Django validation errors
        if (typeof responseData === "object") {
          const firstKey = Object.keys(responseData)[0];
          const firstError = responseData[firstKey];
          setError(
            Array.isArray(firstError)
              ? firstError[0]
              : typeof firstError === "string"
              ? firstError
              : "Échec de l'authentification."
          );
        } else {
          setError("Une erreur est survenue lors de l'authentification.");
        }
      } else {
        setError("Impossible de se connecter au serveur backend.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="sidebar__logo-icon">C</div>
          <span className="sidebar__logo-text font-bold">
            Cyber<span className="text-accent">KB</span>
          </span>
        </div>

        <h2 className="auth-title">
          {isRegister ? "Créer un compte" : "Système d'Accès"}
        </h2>
        <p className="auth-subtitle">
          {isRegister
            ? "Rejoignez le programme de formation en sécurité"
            : "Veuillez vous authentifier pour accéder à la console"}
        </p>

        {error && (
          <div className="p-3 mb-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            [!] {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded bg-accent-glow border border-accent/30 text-accent text-xs font-mono">
            [+] {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Adresse Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@cybersec.ma"
              className="form-input"
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="operator_one"
                  className="form-input"
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jean"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Mot de Passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="form-input"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Confirmer le Mot de Passe</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••••••"
                className="form-input"
                required
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="mt-2"
          >
            {isRegister ? "S'inscrire" : "S'authentifier"}
          </Button>
        </form>

        <div className="auth-footer font-mono">
          {isRegister ? (
            <p className="text-xs">
              Déjà enregistré ?{" "}
              <button
                type="button"
                className="text-accent underline hover:text-accent-dim bg-transparent border-0 cursor-pointer"
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                }}
              >
                Se connecter
              </button>
            </p>
          ) : (
            <p className="text-xs">
              Pas encore de compte ?{" "}
              <button
                type="button"
                className="text-accent underline hover:text-accent-dim bg-transparent border-0 cursor-pointer"
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                }}
              >
                Créer un profil
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
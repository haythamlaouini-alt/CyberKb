import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import Button from "../components/ui/Button";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'security'

  // Profile Form State
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Initialize fields with current user info
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!username.trim()) {
      setError("Le nom d'utilisateur est requis.");
      setLoading(false);
      return;
    }

    try {
      await authService.updateProfile({
        username,
        first_name: firstName,
        last_name: lastName,
        bio,
      });
      await refreshUser(); // refresh state globally
      setSuccess("Profil mis à jour avec succès !");
    } catch (err) {
      console.error(err);
      const errDetail = err.response?.data?.detail || "Une erreur est survenue lors de la mise à jour.";
      setError(errDetail);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess("Votre mot de passe a été modifié avec succès !");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      // Backend validation error mapping
      const errors = err.response?.data;
      if (typeof errors === "object") {
        const firstKey = Object.keys(errors)[0];
        const firstErr = errors[firstKey];
        setError(
          Array.isArray(firstErr)
            ? firstErr[0]
            : typeof firstErr === "string"
            ? firstErr
            : "Échec de modification du mot de passe."
        );
      } else {
        setError("L'ancien mot de passe est incorrect.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__left">
          <div className="page-header__eyebrow">Console Utilisateur</div>
          <h1 className="page-title">Paramètres du Compte</h1>
          <p className="page-subtitle">
            Configurez les informations publiques de votre profil et gérez vos clés d'accès.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-4">
        {/* Navigation Tabs Panel */}
        <div className="lg:col-span-1 bg-cyber-card border border-white/[0.07] rounded-xl p-4 flex flex-col gap-1">
          <button
            onClick={() => {
              setActiveTab("profile");
              setError("");
              setSuccess("");
            }}
            className={`text-left p-2.5 rounded font-mono text-xs transition-all cursor-pointer ${
              activeTab === "profile"
                ? "bg-neon/10 border border-neon/30 text-slate-100"
                : "bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:bg-cyber-surface"
            }`}
          >
            👤 Profil Personnel
          </button>
          <button
            onClick={() => {
              setActiveTab("security");
              setError("");
              setSuccess("");
            }}
            className={`text-left p-2.5 rounded font-mono text-xs transition-all cursor-pointer ${
              activeTab === "security"
                ? "bg-neon/10 border border-neon/30 text-slate-100"
                : "bg-transparent border border-transparent text-slate-400 hover:text-slate-200 hover:bg-cyber-surface"
            }`}
          >
            🔒 Sécurité & Mot de Passe
          </button>
        </div>

        {/* Form Details Pane */}
        <div className="lg:col-span-3 bg-cyber-card border border-white/[0.07] rounded-xl p-5 md:p-7">
          {error && (
            <div className="p-3 mb-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              [!] {error}
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 rounded bg-accent/10 border border-accent/30 text-neon text-xs font-mono">
              [+] {success}
            </div>
          )}

          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="auth-form w-full max-w-xl">
              <h3 className="text-sm font-bold font-mono text-slate-200 mb-4 border-b border-white/10 pb-2">
                Informations Publiques
              </h3>

              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Biographie (Bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Expliquez brièvement votre parcours en cybersécurité..."
                  className="form-input min-h-[90px] font-mono text-xs py-2"
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit" variant="primary" loading={loading}>
                  Sauvegarder les modifications
                </Button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="auth-form w-full max-w-xl">
              <h3 className="text-sm font-bold font-mono text-slate-200 mb-4 border-b border-white/10 pb-2">
                Changement de Mot de Passe
              </h3>

              <div className="form-group">
                <label className="form-label">Ancien Mot de Passe</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmer le Nouveau Mot de Passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-input"
                  required
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button type="submit" variant="primary" loading={loading}>
                  Modifier le mot de passe
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
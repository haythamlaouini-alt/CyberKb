import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [activeCourses, setActiveCourses] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = isAdmin ? "/dashboard/" : "/dashboard/me/";
        const [dashRes, coursesRes] = await Promise.all([
          api.get(endpoint),
          isAdmin ? Promise.resolve({ data: [] }) : api.get("/courses/"),
        ]);
        
        setData(dashRes.data);
        if (!isAdmin) {
          // Filter enrolled courses
          const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data.results || []);
          const enrolled = coursesData.filter((c) => c.is_enrolled);
          setActiveCourses(enrolled);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setError("Impossible de charger les statistiques du tableau de bord.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAdmin]);

  if (loading) {
    return <Loader variant="page" />;
  }

  if (error) {
    return (
      <div className="page-body">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-mono">
          [!] {error}
        </div>
      </div>
    );
  }

  const renderLearnerDashboard = () => {
    const progress = data?.progress || {};
    const enrollments = data?.enrollments || {};
    const modulesCompleted = progress.modules_completed || 0;
    const chatInteractions = progress.chatbot_interactions || 0;
    const courseCount = enrollments.total || 0;

    return (
      <div className="page-body flex flex-col gap-5">
        {/* Stat Cards Grid */}
        <div className="stat-grid">
          <div className="stat-card border-l-4 border-l-neon">
            <div className="stat-card__label">Cours Suivis</div>
            <div className="stat-card__value stat-card__value--accent">
              {courseCount}
            </div>
            <div className="text-[0.68rem] text-slate-500 mt-1 font-mono">
              {enrollments.completed || 0} Terminés
            </div>
          </div>

          <div className="stat-card border-l-4 border-l-cyan-400">
            <div className="stat-card__label">Modules Complétés</div>
            <div className="stat-card__value text-cyan-400">
              {modulesCompleted}
            </div>
            <div className="text-[0.68rem] text-slate-500 mt-1 font-mono">
              Progression générale
            </div>
          </div>

          <div className="stat-card border-l-4 border-l-purple-500">
            <div className="stat-card__label">AI Mentor Chat</div>
            <div className="stat-card__value text-purple-500">
              {chatInteractions}
            </div>
            <div className="text-[0.68rem] text-slate-500 mt-1 font-mono">
              Requêtes envoyées
            </div>
          </div>

          <div className="stat-card border-l-4 border-l-amber-500">
            <div className="stat-card__label">Dernière Activité</div>
            <div className="text-sm font-semibold text-slate-200 mt-2 font-mono truncate">
              {progress.last_activity
                ? new Date(progress.last_activity).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Aucune"}
            </div>
            <div className="text-[0.68rem] text-slate-500 mt-1 font-mono">
              Dernier accès
            </div>
          </div>
        </div>

        {/* Active Enrolled Courses Section */}
        <div className="card">
          <div className="border-b border-white/10 pb-2 mb-3 flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
              <span>🚀</span> Mes Formations Actives
            </h3>
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate("/courses")}
            >
              Parcourir le catalogue
            </Button>
          </div>

          {activeCourses.length === 0 ? (
            <div className="text-center py-6 font-mono text-xs text-slate-500">
              [!] Vous n'êtes inscrit à aucun cours pour le moment.
              <div className="mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/courses")}
                >
                  S'inscrire à un cours
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-cyber-surface border border-white/[0.04] hover:border-neon/20 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-[0.55rem] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                          c.level === "beginner"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : c.level === "intermediate"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {c.level_display}
                      </span>
                      <span className="text-[0.62rem] text-slate-500 font-mono">
                        ⏱️ {c.estimated_duration}m
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 font-display line-clamp-1">
                      {c.title}
                    </h4>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/[0.03]">
                    <div className="flex justify-between items-center text-[0.6rem] font-mono text-slate-400 mb-1">
                      <span>Progression</span>
                      <span className="text-neon font-bold">
                        {c.progress_percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-cyber-elevated rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-neon h-1 rounded-full transition-all duration-300"
                        style={{ width: `${c.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Double Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Completions */}
          <div className="card">
            <h3 className="text-sm font-bold font-mono border-b border-white/10 pb-2 mb-3 text-slate-100 flex items-center gap-2">
              <span>📚</span> Leçons Récemment Validées
            </h3>
            {data?.recent_module_completions?.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4 font-mono">
                Aucun module complété pour le moment.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {data?.recent_module_completions?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded bg-cyber-surface border border-white/[0.03] hover:border-neon/20 transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {item.module}
                      </div>
                      <div className="text-[0.65rem] text-slate-500">
                        {item.course}
                      </div>
                    </div>
                    <div className="text-[0.65rem] text-slate-400 font-mono">
                      {new Date(item.completed_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Viewed Vulnerabilities */}
          <div className="card">
            <h3 className="text-sm font-bold font-mono border-b border-white/10 pb-2 mb-3 text-slate-100 flex items-center gap-2">
              <span>⚠️</span> Historique des Vulnérabilités Consultées
            </h3>
            {data?.recently_viewed_vulnerabilities?.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4 font-mono">
                Aucune vulnérabilité consultée.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {data?.recently_viewed_vulnerabilities?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded bg-cyber-surface border border-white/[0.03] hover:border-accent/20 transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {item.title}
                      </div>
                      <div className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                        Consulté le:{" "}
                        {new Date(item.viewed_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`text-[0.6rem] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                          item.severity === "critical"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : item.severity === "high"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : item.severity === "medium"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-green-500/20 text-green-400 border border-green-500/30"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAdminDashboard = () => {
    const users = data?.users || {};
    const courses = data?.courses || {};
    const vulnerabilities = data?.vulnerabilities || {};
    const security = data?.security || {};
    const chatbot = data?.chatbot || {};

    return (
      <div className="page-body flex flex-col gap-3">
        {/* Admin Stats Grid */}
        <div className="stat-grid">
          <div className="stat-card border-l-4 border-l-neon">
            <div className="stat-card__label">Utilisateurs Actifs</div>
            <div className="stat-card__value stat-card__value--accent">
              {users.total || 0}
            </div>
            <div className="text-[0.68rem] text-slate-500 mt-1 font-mono">
              +{users.new_last_30_days || 0} les 30 derniers jours
            </div>
          </div>

          <div className="stat-card border-l-4 border-l-blue-400">
            <div className="stat-card__label">Cours en Ligne</div>
            <div className="stat-card__value text-blue-400">
              {courses.total_published || 0}
            </div>
            <div className="text-[0.68rem] text-slate-500 mt-1 font-mono">
              {courses.total_enrollments || 0} Inscriptions
            </div>
          </div>

          <div className="stat-card border-l-4 border-l-yellow-400">
            <div className="stat-card__label">Vulnérabilités</div>
            <div className="stat-card__value text-yellow-400">
              {vulnerabilities.total || 0}
            </div>
            <div className="text-[0.68rem] text-slate-500 mt-1 font-mono">
              Dans la base CyberKB
            </div>
          </div>

          <div className="stat-card border-l-4 border-l-red-500">
            <div className="stat-card__label">Alertes Sécurité</div>
            <div className="stat-card__value text-red-500">
              {security.unresolved_suspicious_activities || 0}
            </div>
            <div className="text-[0.68rem] text-slate-500 mt-1 font-mono">
              Activités suspectes non résolues
            </div>
          </div>
        </div>

        {/* Double Column Layout */}
        <div className="grid-2 mt-3">
          {/* Security & System Monitoring */}
          <div className="card">
            <h3 className="text-sm font-bold font-mono border-b border-white/10 pb-2 mb-3 text-slate-100 flex items-center gap-2">
              <span>🛡️</span> Surveillance du Système (24h)
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center p-2 rounded bg-cyber-surface border border-white/[0.03]">
                <span className="text-xs text-slate-300">Échecs de connexion (24h)</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  security.failed_logins_last_24h > 10 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {security.failed_logins_last_24h || 0} tentatives
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-cyber-surface border border-white/[0.03]">
                <span className="text-xs text-slate-300">Comptes Verrouillés</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  security.locked_users > 0 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {security.locked_users || 0} comptes
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-cyber-surface border border-white/[0.03]">
                <span className="text-xs text-slate-300">Total messages Chatbot</span>
                <span className="text-xs font-mono text-purple-400 font-bold">
                  {chatbot.total_messages || 0} ({chatbot.messages_last_7_days || 0} cette semaine)
                </span>
              </div>
            </div>
          </div>

          {/* Most Viewed Vulnerabilities */}
          <div className="card">
            <h3 className="text-sm font-bold font-mono border-b border-white/10 pb-2 mb-3 text-slate-100 flex items-center gap-2">
              <span>🔥</span> Top 5 des Vulnérabilités Consultées
            </h3>
            {vulnerabilities.most_viewed?.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4 font-mono">
                Aucune donnée de consultation disponible.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {vulnerabilities.most_viewed?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 rounded bg-cyber-surface border border-white/[0.03] hover:border-accent/20 transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {item.vulnerability__title}
                      </div>
                      <div className="text-[0.65rem] text-slate-500 font-mono">
                        Niveau: {item.vulnerability__severity}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">
                        {item.views} vues
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__left">
          <div className="page-header__eyebrow">Console Principal</div>
          <h1 className="page-title">
            {isAdmin ? "Portail d'Administration" : "Console de Formation"}
          </h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Superviser les utilisateurs, les cours et les activités système"
              : `Bienvenue, ${user?.username}. Suivez vos cours et étudiez les vulnérabilités.`}
          </p>
        </div>
      </div>

      {isAdmin ? renderAdminDashboard() : renderLearnerDashboard()}
    </div>
  );
}
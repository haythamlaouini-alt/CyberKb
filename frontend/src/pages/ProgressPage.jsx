import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/ui/Loader";

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/dashboard/me/");
        setData(response.data);
      } catch (err) {
        console.error("Progress loading failed:", err);
        setError("Impossible de charger les données de progression.");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

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

  const progress = data?.progress || {};
  const enrollments = data?.enrollments || {};
  const modulesCount = progress.modules_completed || 0;
  const chatCount = progress.chatbot_interactions || 0;
  
  const courseCompletionRate =
    enrollments.total > 0
      ? Math.round((enrollments.completed / enrollments.total) * 100)
      : 0;

  // Derive badges based on stats
  const getAchievements = () => {
    const achievements = [];
    if (enrollments.completed > 0) {
      achievements.push({
        title: "Premier Diplôme",
        desc: "A terminé au moins 1 cours de sécurité.",
        icon: "🏆",
        color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      });
    }
    if (modulesCount >= 5) {
      achievements.push({
        title: "Analyste Junior",
        desc: "A validé 5 leçons ou plus.",
        icon: "🛡️",
        color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      });
    }
    if (chatCount >= 10) {
      achievements.push({
        title: "Dialogue Établi",
        desc: "A eu plus de 10 interactions avec le Mentor AI.",
        icon: "💬",
        color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      });
    }
    if (achievements.length === 0) {
      achievements.push({
        title: "Nouveau Recrue",
        desc: "Bienvenue sur CyberKB. Démarrez votre premier cours pour débloquer des badges !",
        icon: "👶",
        color: "text-slate-400 border-slate-500/30 bg-slate-500/10",
      });
    }
    return achievements;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__left">
          <div className="page-header__eyebrow">Statistiques Individuelles</div>
          <h1 className="page-title">Progression de l'Apprenant</h1>
          <p className="page-subtitle">
            Suivi de votre apprentissage, de vos examens validés et de vos interactions de chat.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 mt-4">
        {/* Core Indicators Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Progress Circular/Bar Card */}
          <div className="bg-cyber-card border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-3">
                Taux de Complétion des Cours
              </h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-3xl font-extrabold text-neon font-display">
                  {courseCompletionRate}%
                </div>
                <div className="flex-1">
                  <div className="w-full bg-cyber-elevated rounded-full h-2">
                    <div
                      className="bg-neon h-2 rounded-full transition-all duration-500"
                      style={{ width: `${courseCompletionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[0.7rem] text-slate-500 font-mono mt-3">
              {enrollments.completed || 0} cours validés sur {enrollments.total || 0} cours inscrits.
            </p>
          </div>

          {/* Module completions Counter */}
          <div className="bg-cyber-card border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">
                Modules Validés
              </h3>
              <div className="text-3xl font-extrabold text-cyan-400 font-display mt-2">
                {modulesCount}
              </div>
            </div>
            <p className="text-[0.7rem] text-slate-500 font-mono mt-3">
              Chaque leçon validée augmente vos connaissances pratiques.
            </p>
          </div>

          {/* Chat interactions Counter */}
          <div className="bg-cyber-card border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2">
                Requêtes au Mentor AI
              </h3>
              <div className="text-3xl font-extrabold text-purple-400 font-display mt-2">
                {chatCount}
              </div>
            </div>
            <p className="text-[0.7rem] text-slate-500 font-mono mt-3">
              Nombre de questions techniques posées à l'intelligence artificielle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Timeline of completions */}
          <div className="lg:col-span-2 bg-cyber-card border border-white/[0.07] rounded-xl p-5">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase border-b border-white/10 pb-2 mb-4">
              Historique de Formation
            </h3>
            {data?.recent_module_completions?.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-6 font-mono text-center">
                [!] Aucun module complété dans l'historique récent.
              </div>
            ) : (
              <div className="relative border-l-2 border-white/10 pl-4 ml-2 flex flex-col gap-4 py-2">
                {data?.recent_module_completions?.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-neon border border-cyber-base" />
                    <div>
                      <span className="text-[0.62rem] font-mono text-slate-500">
                        {new Date(item.completed_at).toLocaleString("fr-FR")}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 mt-0.5">
                        {item.module}
                      </h4>
                      <p className="text-[0.68rem] text-slate-400 font-mono">
                        Cours: {item.course}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges / Achievements Panel */}
          <div className="bg-cyber-card border border-white/[0.07] rounded-xl p-5">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase border-b border-white/10 pb-2 mb-4">
              Badges Débloqués
            </h3>
            <div className="flex flex-col gap-3">
              {getAchievements().map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-start gap-2.5 transition-all ${item.color}`}
                >
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold font-mono leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[0.68rem] text-slate-300 mt-1 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
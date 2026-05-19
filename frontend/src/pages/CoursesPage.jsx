import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api/axios";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";

export default function CoursesPage() {
  // Data States
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/courses/");
      const coursesData = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setCourses(coursesData);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Impossible de charger le catalogue des formations.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollAndOpen = async (course) => {
    if (course.is_unlocked === false) {
      setError("Ce cours est verrouillé. Vous devez d'abord compléter le cours précédent.");
      return;
    }
    setCourseLoading(true);
    setError("");
    try {
      // Automatic enrollment if not enrolled yet
      if (!course.is_enrolled) {
        setEnrollLoading(true);
        await api.post(`/courses/${course.slug}/enroll/`);
      }
      
      // Fetch full details of the course including modules list
      const detailRes = await api.get(`/courses/${course.slug}/`);
      if (detailRes.data.is_unlocked === false) {
        setError("Ce cours est verrouillé. Vous devez d'abord compléter le cours précédent.");
        return;
      }
      setSelectedCourse(detailRes.data);
      setSelectedModule(null);
    } catch (err) {
      console.error("Failed to load course details:", err);
      if (err.response && err.response.status === 403) {
        setError("Ce cours est verrouillé. Vous devez compléter le cours précédent.");
      } else {
        setError("Impossible d'accéder aux détails de ce cours.");
      }
    } finally {
      setCourseLoading(false);
      setEnrollLoading(false);
    }
  };

  const handleOpenModule = async (moduleId) => {
    setModuleLoading(true);
    setError("");
    try {
      const moduleRes = await api.get(`/courses/modules/${moduleId}/`);
      setSelectedModule(moduleRes.data);
    } catch (err) {
      console.error("Failed to load module content:", err);
      setError("Impossible de charger le contenu de cette leçon.");
    } finally {
      setModuleLoading(false);
    }
  };

  const handleCompleteModule = async (moduleId) => {
    try {
      await api.post(`/courses/modules/${moduleId}/complete/`);
      
      // Update completion flags locally
      if (selectedModule && selectedModule.id === moduleId) {
        setSelectedModule((prev) => ({ ...prev, is_completed: true }));
      }
      
      if (selectedCourse) {
        // Refresh modules completion state
        const updatedModules = selectedCourse.modules.map((m) =>
          m.id === moduleId ? { ...m, is_completed: true } : m
        );
        
        // Calculate new progress percentage
        const total = updatedModules.length;
        const completed = updatedModules.filter((m) => m.is_completed).length;
        const newPct = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setSelectedCourse((prev) => ({
          ...prev,
          modules: updatedModules,
          progress_percentage: newPct,
        }));
      }

      // Refresh the catalog courses behind the scene
      const coursesRes = await api.get("/courses/");
      const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data.results || []);
      setCourses(coursesData);
    } catch (err) {
      console.error("Failed to mark module as complete:", err);
      alert("Erreur lors de la validation du module.");
    }
  };

  const handlePrevModule = () => {
    if (!selectedCourse || !selectedModule) return;
    const currentIndex = selectedCourse.modules.findIndex((m) => m.id === selectedModule.id);
    if (currentIndex > 0) {
      handleOpenModule(selectedCourse.modules[currentIndex - 1].id);
    }
  };

  const handleNextModule = () => {
    if (!selectedCourse || !selectedModule) return;
    const currentIndex = selectedCourse.modules.findIndex((m) => m.id === selectedModule.id);
    if (currentIndex < selectedCourse.modules.length - 1) {
      handleOpenModule(selectedCourse.modules[currentIndex + 1].id);
    }
  };

  const handleBackToCatalog = () => {
    setSelectedCourse(null);
    setSelectedModule(null);
    setError("");
  };

  if (loading) {
    return <Loader variant="page" />;
  }

  // Filter list
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "all" || c.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Render course detailed reading room
  if (selectedCourse) {
    const currentIdx = selectedModule
      ? selectedCourse.modules.findIndex((m) => m.id === selectedModule.id)
      : -1;
    const hasPrev = currentIdx > 0;
    const hasNext = selectedCourse.modules && currentIdx < selectedCourse.modules.length - 1;

    return (
      <div className="page animate-[msgIn_0.2s_ease]">
        {/* Navigation header */}
        <div className="page-header flex justify-between items-center gap-3">
          <div className="page-header__left">
            <div className="page-header__eyebrow">
              Formation / {selectedCourse.level_display}
            </div>
            <h1 className="page-title text-base sm:text-lg">{selectedCourse.title}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleBackToCatalog}>
            ← Catalogue
          </Button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            [!] {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start mt-2">
          {/* Sommaire Navigation Sidebar */}
          <div className="lg:col-span-1 bg-cyber-card border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3">
            <div className="border-b border-white/10 pb-2 flex justify-between items-center">
              <h3 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
                Sommaire du Cours
              </h3>
              <span className="text-[0.65rem] font-mono text-neon font-bold">
                {selectedCourse.progress_percentage || 0}%
              </span>
            </div>

            {/* Course mini progress bar */}
            <div className="w-full bg-cyber-elevated rounded-full h-1 overflow-hidden">
              <div
                className="bg-neon h-1 rounded-full transition-all duration-300"
                style={{ width: `${selectedCourse.progress_percentage || 0}%` }}
              />
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              {selectedCourse.modules?.map((mod, index) => {
                const isCurrent = selectedModule?.id === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleOpenModule(mod.id)}
                    className={`text-left p-3 rounded-lg font-mono text-xs flex items-center justify-between transition-all cursor-pointer border ${
                      isCurrent
                        ? "bg-neon/10 border-neon/30 text-slate-100 font-bold"
                        : "bg-cyber-surface/30 border-transparent text-slate-400 hover:text-slate-200 hover:bg-cyber-surface"
                    }`}
                  >
                    <div className="truncate pr-2">
                      {index + 1}. {mod.title}
                    </div>
                    <span className="flex-shrink-0 text-[0.62rem]">
                      {mod.is_completed ? "🟢" : "⚪"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Content Reader Pane */}
          <div className="lg:col-span-3 min-h-[450px] bg-cyber-card border border-white/[0.07] rounded-xl p-5 md:p-8 relative">
            {moduleLoading ? (
              <div className="absolute inset-0 bg-cyber-card/70 flex items-center justify-center rounded-xl">
                <Loader variant="spinner" />
              </div>
            ) : selectedModule ? (
              <div className="flex flex-col gap-5 animate-[msgIn_0.18s_ease]">
                <div className="border-b border-white/10 pb-4 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-[0.6rem] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded uppercase">
                      Module {currentIdx + 1}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold font-display text-slate-100 mt-1">
                      {selectedModule.title}
                    </h2>
                  </div>
                  <div className="text-[0.68rem] text-slate-400 font-mono">
                    ⏱️ Durée : {selectedModule.estimated_duration} mins
                  </div>
                </div>

                {/* Markdown document */}
                <div className="prose prose-sm max-w-none text-slate-200 font-sans leading-relaxed
                  prose-p:text-slate-300 prose-p:my-3.5 prose-p:leading-relaxed
                  prose-strong:text-slate-100 prose-strong:font-bold
                  prose-headings:text-slate-100 prose-headings:font-display prose-headings:font-bold
                  prose-h2:text-[1rem] prose-h2:border-l-2 prose-h2:border-neon prose-h2:pl-2.5 prose-h2:mt-6 prose-h2:mb-3
                  prose-h3:text-xs prose-h3:text-slate-400 prose-h3:font-mono prose-h3:uppercase prose-h3:mt-4
                  prose-code:bg-cyber-elevated prose-code:text-neon prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[0.72rem]
                  prose-pre:bg-cyber-elevated prose-pre:border prose-pre:border-white/[0.05] prose-pre:rounded-lg prose-pre:p-4 prose-pre:font-mono prose-pre:overflow-x-auto prose-pre:my-3
                  prose-li:text-slate-300 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1.5
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedModule.content}
                  </ReactMarkdown>
                </div>

                {/* Navigation and Completion triggers */}
                <div className="border-t border-white/10 pt-5 mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevModule}
                      disabled={!hasPrev}
                    >
                      ← Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextModule}
                      disabled={!hasNext}
                    >
                      Suivant →
                    </Button>
                  </div>

                  {selectedModule.is_completed ? (
                    <div className="bg-neon/10 border border-neon/30 text-neon font-mono text-[0.7rem] px-4 py-2 rounded-md flex items-center gap-2 select-none">
                      ✓ Module validé avec succès
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleCompleteModule(selectedModule.id)}
                    >
                      Marquer comme complété
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px]">
                <span className="text-3xl mb-3">🛡️</span>
                <h3 className="text-sm font-bold font-mono text-slate-300">
                  Démarrer la formation
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                  Sélectionnez le premier module dans le sommaire à gauche pour initier le programme.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render course list (Catalog View)
  return (
    <div className="page animate-[msgIn_0.2s_ease]">
      <div className="page-header">
        <div className="page-header__left">
          <div className="page-header__eyebrow">Formations de Sécurité</div>
          <h1 className="page-title">Cours & Vulnérabilités</h1>
          <p className="page-subtitle">
            Parcourez la base de connaissances OWASP Top 10, lancez des challenges et validez vos compétences.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          [!] {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="filter-bar flex justify-between items-center flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher un module (ex: Injection)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
        />

        <div className="flex gap-1 bg-cyber-card p-1 rounded-md border border-white/[0.07]">
          {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1 text-[0.7rem] font-mono rounded transition-all cursor-pointer capitalize ${
                levelFilter === lvl
                  ? "bg-neon text-cyber-base font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lvl === "all" ? "Tous" : lvl}
            </button>
          ))}
        </div>
      </div>

      {enrollLoading && (
        <div className="p-3 mb-4 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono animate-pulse">
          Inscription automatique au programme en cours...
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="card text-center p-8 font-mono text-slate-500 text-xs">
          [?] Aucun module ne correspond à vos filtres de recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const isEnrolled = course.is_enrolled;
            const progressPercentage = course.progress_percentage || 0;
            const isUnlocked = course.is_unlocked !== false;

            return (
              <div
                key={course.id}
                className={`bg-cyber-card border rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 group ${
                  isUnlocked
                    ? "border-white/[0.07] hover:border-neon/30 hover:shadow-neon"
                    : "border-red-950/20 opacity-60 hover:border-red-900/30"
                }`}
              >
                {/* Visual Thumbnail Area */}
                <div className="h-32 w-full relative bg-cyber-surface flex items-center justify-center overflow-hidden border-b border-white/[0.05]">
                  <div
                    className={`absolute inset-0 opacity-15 bg-gradient-to-br ${
                      !isUnlocked
                        ? "from-red-600 to-slate-950"
                        : course.level === "beginner"
                        ? "from-green-500 to-emerald-950"
                        : course.level === "intermediate"
                        ? "from-orange-500 to-amber-950"
                        : "from-red-500 to-rose-950"
                    }`}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(8,11,15,0.7)_100%)]" />
                  <div className="absolute z-10 flex flex-col items-center gap-1 font-mono text-center">
                    <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(0,255,136,0.35)]">
                      {!isUnlocked
                        ? "🔒"
                        : course.level === "beginner"
                        ? "🔓"
                        : course.level === "intermediate"
                        ? "🛡️"
                        : "🔥"}
                    </span>
                    <span className={`text-[0.55rem] tracking-widest uppercase mt-1 font-mono font-semibold ${
                      !isUnlocked ? "text-red-500" : "text-slate-500"
                    }`}>
                      {!isUnlocked ? "Système Verrouillé" : course.level === "advanced" ? "System: Critical" : "System: Ready"}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span
                        className={`text-[0.62rem] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                          !isUnlocked
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : course.level === "beginner"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : course.level === "intermediate"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {course.level_display}
                      </span>
                      <span className="text-[0.65rem] text-slate-500 font-mono">
                        ⏱️ {course.estimated_duration || 0} mins
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold font-display text-slate-100 mb-1 transition-all ${
                      isUnlocked ? "group-hover:text-neon" : "text-slate-400"
                    }`}>
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed font-sans">
                      {course.description}
                    </p>
                  </div>

                  {/* Enrollment Progress bar */}
                  <div className="border-t border-white/[0.05] pt-3 mt-2 flex flex-col gap-3">
                    {isUnlocked && isEnrolled ? (
                      <div>
                        <div className="flex justify-between items-center text-[0.62rem] font-mono text-slate-500 mb-1">
                          <span>Progression</span>
                          <span className="text-neon font-bold">
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-cyber-elevated rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-neon h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    ) : !isUnlocked ? (
                      <div className="text-[0.65rem] text-red-500/80 font-mono flex items-center gap-1">
                        ⚠️ Complétez la formation précédente
                      </div>
                    ) : (
                      <div className="text-[0.65rem] text-slate-500 italic font-mono">
                        Non inscrit à ce module.
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[0.62rem] text-slate-500 font-mono">
                        📂 {course.module_count || 0} leçons
                      </span>
                      <Button
                        variant={!isUnlocked ? "outline" : isEnrolled ? "primary" : "outline"}
                        size="xs"
                        onClick={() => isUnlocked && handleEnrollAndOpen(course)}
                        disabled={!isUnlocked}
                        className={!isUnlocked ? "border-red-500/20 text-red-400/85 cursor-not-allowed hover:bg-transparent" : ""}
                      >
                        {!isUnlocked ? "Verrouillé 🔒" : isEnrolled ? "Continuer →" : "Rejoindre →"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
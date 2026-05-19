export default function PromptSuggestions({ onSelect }) {
  const SUGGESTIONS = [
    {
      title: "Injection SQL (SQLi)",
      desc: "Expliquer le concept d'injection SQL et comment la corriger avec des requêtes préparées.",
      prompt: "Expliquez-moi le fonctionnement d'une Injection SQL (SQLi) et donnez-moi un exemple de code vulnérable et de code sécurisé en PHP.",
    },
    {
      title: "Faille XSS",
      desc: "Comprendre le Cross-Site Scripting stocké et réfléchi et les méthodes d'échappement.",
      prompt: "Qu'est-ce qu'une faille Cross-Site Scripting (XSS) ? Quelle est la différence entre XSS Reflected et XSS Stored ?",
    },
    {
      title: "SSRF & CSRF",
      desc: "Analyser les requêtes forgées côté serveur et côté client.",
      prompt: "Expliquez les différences majeures entre les failles CSRF (Cross-Site Request Forgery) et SSRF (Server-Side Request Forgery).",
    },
    {
      title: "OWASP Top 10",
      desc: "Aperçu des 10 risques de sécurité les plus critiques du web.",
      prompt: "Pouvez-vous me résumer les 3 failles de sécurité les plus critiques du classement OWASP Top 10 actuel ?",
    },
  ];

  return (
    <div className="flex flex-col gap-3 mt-4 max-w-2xl mx-auto">
      <p className="text-xs font-mono text-slate-500 text-center uppercase tracking-wider">
        Suggestions de Requêtes Mentor AI
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item.prompt)}
            className="text-left p-3.5 rounded-xl bg-cyber-card border border-white/[0.05] hover:border-neon/20 hover:bg-cyber-surface transition-all duration-200 cursor-pointer group"
          >
            <h4 className="text-xs font-bold font-mono text-neon group-hover:text-white transition-all">
              {item.title}
            </h4>
            <p className="text-[0.72rem] text-slate-400 mt-1 font-mono leading-relaxed">
              {item.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold text-green-400 mb-4">
        Cybersecurity Platform
      </h1>

      <p className="text-gray-300 mb-6">
        Learn cybersecurity and ethical hacking
      </p>

      <button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold">
        Commencer
      </button>
    </div>
  );
}
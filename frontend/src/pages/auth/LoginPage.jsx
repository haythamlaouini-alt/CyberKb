export default function LoginPage() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900">
      <form className="bg-gray-800 p-8 rounded-xl w-96">
        <h2 className="text-3xl text-white mb-5">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded"
        />

        <button className="w-full bg-blue-600 py-3 rounded text-white">
          Login
        </button>
      </form>
    </div>
  );
}
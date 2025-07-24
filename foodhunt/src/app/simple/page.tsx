export default function SimplePage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">FoodHunt</h1>
        <p className="text-xl">Simple page without AuthContext</p>
        <div className="mt-8">
          <a 
            href="/auth/login" 
            className="bg-white text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}

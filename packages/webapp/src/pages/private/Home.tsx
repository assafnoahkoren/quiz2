import { useAuth } from '../../components/auth/AuthContext';

export const Home = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-4xl p-8 border rounded shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to Quiz2</h1>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded transition-fast hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-gray-100 p-6 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
          <p className="mb-4">This is a protected page that only authenticated users can access.</p>
          <p>You are currently signed in with JWT authentication.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border p-4 rounded shadow-sm">
            <h3 className="text-lg font-bold mb-2">Recent Activity</h3>
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
          
          <div className="border p-4 rounded shadow-sm">
            <h3 className="text-lg font-bold mb-2">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Action 1</button>
              <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Action 2</button>
              <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm">Action 3</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
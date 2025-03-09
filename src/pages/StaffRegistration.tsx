import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function StaffRegistration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, connectionStatus, user } = useAuth();

  // Check if the current user is an admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
        <p className="text-red-600">You must be an admin to access this page.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (connectionStatus !== 'connected') {
      toast.error('Cannot connect to the server. Please try again later.');
      return;
    }
    
    // Basic validation
    if (!name.trim()) {
      toast.error('Please enter staff name');
      return;
    }
    
    if (!email.trim()) {
      toast.error('Please enter staff email');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await signUp(email, password, name, 'staff');
      toast.success('Staff account created successfully');
      // Reset form after successful creation
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      console.log('Staff registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Create Staff Account</h2>
      
      {connectionStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">Unable to connect to the server. Account creation is currently unavailable.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Staff Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            disabled={loading || connectionStatus !== 'connected'}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            disabled={loading || connectionStatus !== 'connected'}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            disabled={loading || connectionStatus !== 'connected'}
            minLength={6}
          />
          <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
        </div>
        <button
          type="submit"
          disabled={loading || connectionStatus !== 'connected'}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Staff Account'}
        </button>
      </form>
    </div>
  );
}
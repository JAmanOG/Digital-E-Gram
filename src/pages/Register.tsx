import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, connectionStatus } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (connectionStatus !== 'connected') {
      toast.error('Cannot connect to the server. Please try again later.');
      return;
    }
    
    // Basic validation
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await signUp(email, password, name, 'citizen');
      // We'll let the signUp function handle success messages
      // Only navigate if we're sure the signup was successful
      navigate('/login');
    } catch (error) {
      // Error is already handled in the signUp function
      console.log('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>
      
      {connectionStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">Unable to connect to the server. Registration is currently unavailable.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
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
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
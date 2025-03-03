import { useAuth } from '../context/AuthContext';

export default function ConnectionStatus() {
  const { connectionStatus } = useAuth();

  if (connectionStatus === 'connected') {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 p-2 text-center text-white ${
      connectionStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
    }`}>
      {connectionStatus === 'checking' 
        ? 'Checking database connection...' 
        : 'Database connection error. Some features may not work properly.'}
    </div>
  );
}
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, FileText, Users, Building, Shield } from 'lucide-react';

export default function Home() {
  const { user, connectionStatus } = useAuth();

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
        <h1 className="text-4xl font-extrabold mb-4 sm:text-5xl">
          Digital E-Gram Panchayat
        </h1>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          Access government services online, track applications, and connect with your local panchayat from anywhere.
        </p>
        
        {connectionStatus === 'error' && (
          <div className="mb-8 p-4 bg-red-800 bg-opacity-50 text-white rounded-md max-w-md mx-auto">
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">We're experiencing connection issues with our servers. Some features may be unavailable.</p>
          </div>
        )}
        
        {!user ? (
          <div className="space-x-4">
            <Link
              to="/register"
              className={`bg-white text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 ${connectionStatus !== 'connected' ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className={`bg-transparent text-white px-6 py-3 rounded-md border border-white font-medium hover:bg-white hover:bg-opacity-10 ${connectionStatus !== 'connected' ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Sign In
            </Link>
          </div>
        ) : (
          <Link
            to="/dashboard"
            className="bg-white text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 inline-flex items-center"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Features section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Digital Documentation</h3>
            <p className="text-gray-600">Apply for certificates and documents online without visiting government offices.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Services</h3>
            <p className="text-gray-600">Access community services and stay updated with local announcements.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="bg-indigo-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Property & Tax</h3>
            <p className="text-gray-600">Manage property records and pay taxes online with instant receipts.</p>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-0.5 bg-gray-200"></div>
            </div>
            
            <div className="relative z-10 flex items-center mb-12">
              <div className="flex items-center justify-center min-w-12 h-12 bg-indigo-600 rounded-full text-white font-bold text-lg">
                1
              </div>
              <div className="ml-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
                <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
                <p className="text-gray-600">Register with your email and basic information to get started.</p>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center mb-12">
              <div className="flex items-center justify-center min-w-12 h-12 bg-indigo-600 rounded-full text-white font-bold text-lg">
                2
              </div>
              <div className="ml-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
                <h3 className="text-xl font-semibold mb-2">Browse Available Services</h3>
                <p className="text-gray-600">Explore the range of government services available online.</p>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center mb-12">
              <div className="flex items-center justify-center min-w-12 h-12 bg-indigo-600 rounded-full text-white font-bold text-lg">
                3
              </div>
              <div className="ml-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
                <h3 className="text-xl font-semibold mb-2">Submit Applications</h3>
                <p className="text-gray-600">Fill out forms and upload required documents for your application.</p>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center">
              <div className="flex items-center justify-center min-w-12 h-12 bg-indigo-600 rounded-full text-white font-bold text-lg">
                4
              </div>
              <div className="ml-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">Monitor the status of your applications and receive notifications.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of citizens who are already using E-Gram Panchayat for their government service needs.
        </p>
        {!user ? (
          <Link
            to="/register"
            className={`bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 ${connectionStatus !== 'connected' ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Create an Account
          </Link>
        ) : (
          <Link
            to="/services"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700"
          >
            Explore Services
          </Link>
        )}
      </div>
    </div>
  );
}
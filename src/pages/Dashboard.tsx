import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FileText, User, Bell, Clock, CheckCircle, AlertCircle, Calendar, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Application, Notification } from '../types/database';

export default function Dashboard() {
  const { user, connectionStatus } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && connectionStatus === 'connected') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, connectionStatus]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*, service:services(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      } else {
        setApplications(applicationsData || []);
      }
      
      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else {
        setNotifications(notificationsData || []);
      }
    } catch (error) {
      console.error('Error in fetchDashboardData:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Fallback data if database connection fails
  const fallbackApplications = [
    {
      id: '1',
      service: { name: 'Birth Certificate', id: '1' },
      status: 'pending',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: user?.id || '',
      service_id: '1'
    },
    {
      id: '2',
      service: { name: 'Property Tax', id: '3' },
      status: 'approved',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: user?.id || '',
      service_id: '3'
    },
  ] as Application[];

  const fallbackNotifications = [
    {
      id: '1',
      user_id: user?.id || '',
      title: 'Application Submitted',
      message: 'Your application for Birth Certificate has been submitted successfully.',
      is_read: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      user_id: user?.id || '',
      title: 'Application Approved',
      message: 'Your application for Property Tax has been approved.',
      is_read: true,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ] as Notification[];

  const displayApplications = applications.length > 0 ? applications : fallbackApplications;
  const displayNotifications = notifications.length > 0 ? notifications : fallbackNotifications;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {connectionStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">We're experiencing connection issues with our servers. Some data may not be up to date.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Applications</h2>
              <p className="text-gray-500">{displayApplications.length} Recent</p>
            </div>
          </div>
          <Link 
            to="/applications" 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View all applications →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Services</h2>
              <p className="text-gray-500">Browse available services</p>
            </div>
          </div>
          <Link 
            to="/services" 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Explore services →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-gray-500">Manage your account</p>
            </div>
          </div>
          <Link 
            to="/profile" 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Update profile →
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link 
                to="/applications" 
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                View all
              </Link>
            </div>
            
            {displayApplications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {displayApplications.map((application) => (
                  <Link 
                    key={application.id} 
                    to={`/applications/${application.id}`}
                    className="block px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(application.status)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{application.service?.name}</p>
                          <p className="text-xs text-gray-500">Submitted on {formatDate(application.created_at)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No applications found</p>
                <Link 
                  to="/services" 
                  className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
                >
                  Apply for a service
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Application Status Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="ml-2 text-sm font-medium text-gray-900">Pending</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {displayApplications.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="ml-2 text-sm font-medium text-gray-900">In Review</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {displayApplications.filter(a => a.status === 'in_review').length}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="ml-2 text-sm font-medium text-gray-900">Approved</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {displayApplications.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="ml-2 text-sm font-medium text-gray-900">Rejected</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {displayApplications.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {displayNotifications.filter(n => !n.is_read).length} New
              </span>
            </div>
            
            {displayNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {displayNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`px-6 py-4 ${!notification.is_read ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="flex items-start">
                      <Bell className={`h-5 w-5 ${!notification.is_read ? 'text-indigo-500' : 'text-gray-400'}`} />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No notifications</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Quick Links</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/services" 
                    className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                  >
                    <FileText className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-700">Browse Services</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/applications" 
                    className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                  >
                    <BarChart2 className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-700">Track Applications</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/profile" 
                    className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                  >
                    <User className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-700">Update Profile</span>
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://example.com/help" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                  >
                    <AlertCircle className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-700">Help & Support</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
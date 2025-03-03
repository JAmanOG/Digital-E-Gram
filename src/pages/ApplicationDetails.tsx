import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Application } from '../types/database';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, FileText, Calendar, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, connectionStatus } = useAuth();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!id || !user || connectionStatus !== 'connected') {
      setLoading(false);
      return;
    }
    
    const fetchApplication = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*, service:services(*)')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching application:', error);
          toast.error('Failed to load application details');
          navigate('/applications');
          return;
        }
        
        if (data) {
          setApplication(data);
        } else {
          navigate('/applications');
        }
      } catch (error) {
        console.error('Error in fetchApplication:', error);
        toast.error('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplication();
  }, [id, user, connectionStatus, navigate]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'in_review':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Clock className="h-6 w-6 text-gray-500" />;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Fallback application if database connection fails
  const fallbackApplication = {
    id: id || '1',
    service: { 
      name: 'Application Details', 
      description: 'This is a placeholder for application details when the database connection is unavailable.',
      id: '1'
    },
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: user?.id || '',
    service_id: '1',
    notes: 'Application details are not available offline.',
    documents: ['ID Proof', 'Address Proof']
  } as Application;
  
  const displayApplication = application || fallbackApplication;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate('/applications')}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Applications
        </button>
      </div>
      
      {connectionStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">We're experiencing connection issues with our servers. Application details may not be up to date.</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{displayApplication.service?.name}</h1>
              <p className="text-gray-600">{displayApplication.service?.description}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${getStatusColor(displayApplication.status)}`}>
                {getStatusIcon(displayApplication.status)}
                <span className="ml-1.5 capitalize">{displayApplication.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold">Submission Details</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Submitted:</span> {formatDate(displayApplication.created_at)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Last Updated:</span> {formatDate(displayApplication.updated_at || displayApplication.created_at)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Application ID:</span> {displayApplication.id}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold">Documents Submitted</h3>
              </div>
              {displayApplication.documents && displayApplication.documents.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {displayApplication.documents.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-700">No documents submitted</p>
              )}
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold">Additional Notes</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              {displayApplication.notes ? (
                <p className="text-gray-700">{displayApplication.notes}</p>
              ) : (
                <p className="text-gray-500 italic">No additional notes provided</p>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Application Timeline</h3>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-0.5 bg-gray-200"></div>
              </div>
              
              <div className="relative z-10 flex items-center mb-6">
                <div className={`flex items-center justify-center min-w-10 h-10 rounded-full text-white ${displayApplication.status !== 'pending' ? 'bg-green-500' : 'bg-indigo-600'}`}>
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium">Application Submitted</h4>
                  <p className="text-sm text-gray-500">{formatDate(displayApplication.created_at)}</p>
                </div>
              </div>
              
              <div className="relative z-10 flex items-center mb-6">
                <div className={`flex items-center justify-center min-w-10 h-10 rounded-full ${displayApplication.status === 'pending' ? 'bg-yellow-500 text-white' : displayApplication.status === 'in_review' ? 'bg-blue-500 text-white' : displayApplication.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                  {displayApplication.status === 'pending' ? (
                    <Clock className="h-5 w-5" />
                  ) : displayApplication.status === 'in_review' ? (
                    <Clock className="h-5 w-5" />
                  ) : displayApplication.status === 'rejected' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-medium">
                    {displayApplication.status === 'pending' ? 'Pending Review' : 
                     displayApplication.status === 'in_review' ? 'Under Review' : 
                     displayApplication.status === 'rejected' ? 'Application Rejected' : 
                     'Application Approved'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {displayApplication.status === 'pending' ? 'Your application is waiting to be reviewed' : 
                     displayApplication.status === 'in_review' ? 'Your application is being reviewed by our team' : 
                     displayApplication.status === 'rejected' ? 'Your application has been rejected' : 
                     'Your application has been approved'}
                  </p>
                </div>
              </div>
              
              {(displayApplication.status === 'approved' || displayApplication.status === 'completed') && (
                <div className="relative z-10 flex items-center">
                  <div className={`flex items-center justify-center min-w-10 h-10 rounded-full ${displayApplication.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-medium">Process Completed</h4>
                    <p className="text-sm text-gray-500">
                      {displayApplication.status === 'completed' ? 
                        'Your application process has been completed' : 
                        'Waiting for final processing'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-600 mb-4 sm:mb-0">
            Need help with your application?
          </p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Link 
              to="/services"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply for Another Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
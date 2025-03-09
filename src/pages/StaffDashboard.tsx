import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, AlertCircle, Search, Filter, FileText, Eye, User } from 'lucide-react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import type { Application } from '../types/database';
import { useLocation } from 'react-router-dom';

const StaffDashboard = () => {
  const { user, connectionStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [applicationStats, setApplicationStats] = useState({
    pending: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  });
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  // Redirect if not a staff or admin
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'staff' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    if (connectionStatus !== 'connected') return;
    fetchApplications();
}, [connectionStatus, location.pathname]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`*, 
          service:services(*),
          user:profiles!applications_user_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('data:', data);

      const UsersID = data.map((app) => app.user_id); // Get all user IDs from applications

        // Fetch user profiles
        const { data: userProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', UsersID);

        if (profileError) {
            throw profileError;
            }
            
        console.log('userProfiles:', userProfiles);

        // Map user profiles to applications
        if (data && userProfiles) {
            data.forEach(app => {
                app.user = userProfiles.find(profile => profile.id === app.user_id);
            });
        }



      if (data) {

        setApplications(data);
        
        // Calculate stats
        const stats = {
          pending: 0,
          in_review: 0,
          approved: 0,
          rejected: 0,
          completed: 0,
        };
        
        data.forEach(app => {
          if (stats[app.status] !== undefined) {
            stats[app.status]++;
          }
        });
        
        setApplicationStats(stats);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string, notes?: string) => {
    setProcessingAction(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status, 
          notes: notes || selectedApplication?.notes,
          processed_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Create notification for the user
      if (selectedApplication?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: selectedApplication.user_id,
            title: `Application ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}`,
            message: `Your application for ${selectedApplication?.service?.name} has been ${status.replace('_', ' ')}.`,
          });
      }

      toast.success(`Application ${status.replace('_', ' ')}`);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
    } finally {
      setProcessingAction(false);
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter applications based on search term and status filter
  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      (application.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (application.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (application.id?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

//   console.log('applications:', applications);
//   console.log('filteredApplications:', filteredApplications);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<Clock className="h-6 w-6 text-yellow-500" />} label="Pending" count={applicationStats.pending} />
        <StatCard icon={<Clock className="h-6 w-6 text-blue-500" />} label="In Review" count={applicationStats.in_review} />
        <StatCard icon={<CheckCircle className="h-6 w-6 text-green-500" />} label="Approved" count={applicationStats.approved} />
        <StatCard icon={<AlertCircle className="h-6 w-6 text-red-500" />} label="Rejected" count={applicationStats.rejected} />
        <StatCard icon={<CheckCircle className="h-6 w-6 text-green-500" />} label="Completed" count={applicationStats.completed} />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full"
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 py-2 pl-3 pr-8"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filteredApplications.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {application.service?.name || 'Unknown Service'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {application.user?.name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No applications found</p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="mt-2 text-indigo-600 hover:text-indigo-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
              <button 
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedApplication.service?.name}</h2>
                  <p className="text-gray-500">{selectedApplication.service?.description}</p>
                </div>
                <span className={`mt-2 sm:mt-0 px-3 py-1 inline-flex items-center text-sm font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
                  {getStatusIcon(selectedApplication.status)}
                  <span className="ml-1.5 capitalize">{selectedApplication.status.replace('_', ' ')}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold">Applicant Information</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Name:</span> {selectedApplication.user?.name}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Email:</span> {selectedApplication.user?.email}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Phone:</span> {selectedApplication.user?.phone || 'Not provided'}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Address:</span> {selectedApplication.user?.address || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold">Documents Submitted</h3>
                  </div>
                  {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {selectedApplication.documents.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-700">No documents submitted</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  defaultValue={selectedApplication.notes || ''}
                  placeholder="Add notes about this application..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={processingAction}
                />
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'in_review')}
                  disabled={processingAction || selectedApplication.status === 'in_review'}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    selectedApplication.status === 'in_review' 
                      ? 'border-blue-300 text-blue-300 cursor-not-allowed' 
                      : 'border-blue-500 text-blue-500 hover:bg-blue-50'
                  } disabled:opacity-50`}
                >
                  Mark as In Review
                </button>
                
                <button
                  type="button"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                  disabled={processingAction || selectedApplication.status === 'approved'}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    selectedApplication.status === 'approved' 
                      ? 'border-green-300 text-green-300 cursor-not-allowed' 
                      : 'border-green-500 text-green-500 hover:bg-green-50'
                  } disabled:opacity-50`}
                >
                  Approve
                </button>
                
                <button
                  type="button"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  disabled={processingAction || selectedApplication.status === 'rejected'}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    selectedApplication.status === 'rejected' 
                      ? 'border-red-300 text-red-300 cursor-not-allowed' 
                      : 'border-red-500 text-red-500 hover:bg-red-50'
                  } disabled:opacity-50`}
                >
                  Reject
                </button>
                
                <button
                  type="button"
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'completed')}
                  disabled={processingAction || selectedApplication.status !== 'approved'}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    selectedApplication.status !== 'approved' 
                      ? 'border-gray-300 text-gray-300 cursor-not-allowed' 
                      : 'border-green-500 text-green-500 hover:bg-green-50'
                  } disabled:opacity-50`}
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, count }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center mb-2">
      {icon}
      <div className="ml-2">
        <h2 className="text-sm font-semibold">{label}</h2>
        <p className="text-xl font-bold">{count}</p>
      </div>
    </div>
  </div>
);

export default StaffDashboard;
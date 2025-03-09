// import React, { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../context/AuthContext';
// import toast from 'react-hot-toast';
// import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
// import { Navigate } from 'react-router-dom';

// const AdminDashboard = () => {
//   const { user, connectionStatus } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [staffActivities, setStaffActivities] = useState([]);
//   const [applicationStats, setApplicationStats] = useState({
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//   });

//   // Redirect if not an admin
//   if (!user) {
//     return <Navigate to="/login" />;
//   }
  
//   if (user?.role !== 'admin') {
//     return <Navigate to="/dashboard" />;
//   }

//   useEffect(() => {
//     if (connectionStatus !== 'connected') return;

//     const fetchStaffActivities = async () => {
//       setLoading(true);
//       try {
//         // First get applications processed by staff
//         const { data, error } = await supabase
//           .from('applications')
//           .select(`
//             id, 
//             status, 
//             created_at, 
//             processed_by,
//             profiles!applications_processed_by_fkey(name)
//           `)
//           .not('processed_by', 'is', null)
//           .order('created_at', { ascending: false });

//         if (error) throw error;
        
//         console.log('Staff activities:', data);
//         setStaffActivities(data || []);
//       } catch (error) {
//         console.error('Error fetching staff activities:', error);
//         toast.error('Failed to load staff activities');
//       } finally {
//         setLoading(false);
//       }
//     };

//     const fetchApplicationStats = async () => {
//       try {
//         // Use separate queries to get counts by status
//         const { count: pendingCount, error: pendingError } = await supabase
//           .from('applications')
//           .select('*', { count: 'exact', head: true })
//           .eq('status', 'pending');
        
//         if (pendingError) throw pendingError;
        
//         const { count: approvedCount, error: approvedError } = await supabase
//           .from('applications')
//           .select('*', { count: 'exact', head: true })
//           .eq('status', 'approved');
        
//         if (approvedError) throw approvedError;
        
//         const { count: rejectedCount, error: rejectedError } = await supabase
//           .from('applications')
//           .select('*', { count: 'exact', head: true })
//           .eq('status', 'rejected');
        
//         if (rejectedError) throw rejectedError;
      
//         setApplicationStats({
//           pending: pendingCount || 0,
//           approved: approvedCount || 0,
//           rejected: rejectedCount || 0,
//         });
//       } catch (error) {
//         console.error('Error in fetchApplicationStats:', error);
//         toast.error('Failed to load application stats');
//       }
//     };

//     fetchStaffActivities();
//     fetchApplicationStats();
//   }, [connectionStatus]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-40">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <StatCard icon={<Clock className="h-6 w-6 text-yellow-500" />} label="Pending Applications" count={applicationStats.pending} />
//         <StatCard icon={<CheckCircle className="h-6 w-6 text-green-500" />} label="Approved Applications" count={applicationStats.approved} />
//         <StatCard icon={<AlertCircle className="h-6 w-6 text-red-500" />} label="Rejected Applications" count={applicationStats.rejected} />
//       </div>

//       <StaffActivitiesTable staffActivities={staffActivities} />
//     </div>
//   );
// };

// const StatCard = ({ icon, label, count }) => (
//   <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
//     <div className="flex items-center mb-4">
//       {icon}
//       <div className="ml-4">
//         <h2 className="text-lg font-semibold">{label}</h2>
//         <p className="text-2xl font-bold">{count}</p>
//       </div>
//     </div>
//   </div>
// );

// const StaffActivitiesTable = ({ staffActivities }) => (
//   <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//     <div className="px-6 py-4 border-b border-gray-200">
//       <h2 className="text-lg font-semibold">Staff Activities</h2>
//     </div>
//     <div className="p-6">
//       {staffActivities.length > 0 ? (
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed At</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {staffActivities.map((activity) => (
//               <tr key={activity.id}>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                   {activity.profiles?.name || 'Unknown'}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.id}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.status}</td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {new Date(activity.created_at).toLocaleString()}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <div className="text-center py-12">
//           <p className="text-gray-500 text-lg">No staff activities found</p>
//         </div>
//       )}
//     </div>
//   </div>
// );

// export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, connectionStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [staffActivities, setStaffActivities] = useState([]);
  const [applicationStats, setApplicationStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Redirect if not an admin
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    const fetchStaffActivities = async () => {
      setLoading(true);
      try {
        // First get applications that have been processed
        const { data: applications, error } = await supabase
          .from('applications')
          .select('id, status, created_at, processed_by')
          .not('processed_by', 'is', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (applications && applications.length > 0) {
          // Get unique staff IDs
          const staffIds = [...new Set(applications.map(app => app.processed_by))];
          
          // Get staff profiles
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', staffIds);
            
          if (profilesError) throw profilesError;
          
          // Map profiles to applications
          const activitiesWithNames = applications.map(app => {
            const staffProfile = profiles?.find(profile => profile.id === app.processed_by);
            return {
              ...app,
              staffName: staffProfile?.name || 'Unknown'
            };
          });
          
          setStaffActivities(activitiesWithNames);
        } else {
          setStaffActivities([]);
        }
      } catch (error) {
        console.error('Error fetching staff activities:', error);
        toast.error('Failed to load staff activities');
      } finally {
        setLoading(false);
      }
    };

    const fetchApplicationStats = async () => {
      try {
        // Use separate queries to get counts by status
        const { count: pendingCount, error: pendingError } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (pendingError) throw pendingError;
        
        const { count: approvedCount, error: approvedError } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');
        
        if (approvedError) throw approvedError;
        
        const { count: rejectedCount, error: rejectedError } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected');
        
        if (rejectedError) throw rejectedError;
      
        setApplicationStats({
          pending: pendingCount || 0,
          approved: approvedCount || 0,
          rejected: rejectedCount || 0,
        });
      } catch (error) {
        console.error('Error in fetchApplicationStats:', error);
        toast.error('Failed to load application stats');
      }
    };

    fetchStaffActivities();
    fetchApplicationStats();
  }, [connectionStatus]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Clock className="h-6 w-6 text-yellow-500" />} label="Pending Applications" count={applicationStats.pending} />
        <StatCard icon={<CheckCircle className="h-6 w-6 text-green-500" />} label="Approved Applications" count={applicationStats.approved} />
        <StatCard icon={<AlertCircle className="h-6 w-6 text-red-500" />} label="Rejected Applications" count={applicationStats.rejected} />
      </div>

      <StaffActivitiesTable staffActivities={staffActivities} />
    </div>
  );
};

const StatCard = ({ icon, label, count }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <div className="flex items-center mb-4">
      {icon}
      <div className="ml-4">
        <h2 className="text-lg font-semibold">{label}</h2>
        <p className="text-2xl font-bold">{count}</p>
      </div>
    </div>
  </div>
);

const StaffActivitiesTable = ({ staffActivities }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold">Staff Activities</h2>
    </div>
    <div className="p-6">
      {staffActivities.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffActivities.map((activity) => (
              <tr key={activity.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {activity.staffName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(activity.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No staff activities found</p>
        </div>
      )}
    </div>
  </div>
);

export default AdminDashboard;
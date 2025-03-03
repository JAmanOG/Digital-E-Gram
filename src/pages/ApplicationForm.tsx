import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Service } from '../types/database';
import { ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApplicationForm() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user, connectionStatus } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<{ name: string, file: File | null }[]>([]);
  
  useEffect(() => {
    if (!serviceId || !user || connectionStatus !== 'connected') {
      setLoading(false);
      return;
    }
    
    const fetchService = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();
        
        if (error) {
          console.error('Error fetching service:', error);
          toast.error('Failed to load service details');
          navigate('/services');
          return;
        }
        
        if (data) {
          setService(data);
          
          // Initialize documents array based on required documents
          if (data.documents_required && data.documents_required.length > 0) {
            setDocuments(data.documents_required.map(doc => ({ name: doc, file: null })));
          }
        } else {
          navigate('/services');
        }
      } catch (error) {
        console.error('Error in fetchService:', error);
        toast.error('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchService();
  }, [serviceId, user, connectionStatus, navigate]);
  
  const handleFileChange = (index: number, file: File | null) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index].file = file;
    setDocuments(updatedDocuments);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !service || connectionStatus !== 'connected') {
      toast.error('Cannot submit application. Please try again later.');
      return;
    }
    
    // Check if all required documents are uploaded
    const missingDocuments = documents.filter(doc => !doc.file);
    if (missingDocuments.length > 0) {
      toast.error(`Please upload all required documents: ${missingDocuments.map(d => d.name).join(', ')}`);
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create application record
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          service_id: service.id,
          status: 'pending',
          notes: notes,
          documents: documents.map(doc => doc.name),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (applicationError) {
        console.error('Error creating application:', applicationError);
        toast.error('Failed to submit application');
        setSubmitting(false);
        return;
      }
      
      if (!application) {
        toast.error('Failed to submit application');
        setSubmitting(false);
        return;
      }
      
      // Upload documents
      // Note: In a real implementation, you would upload files to storage
      // For this demo, we'll just record the document names
      
      // Create notification for the user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Application Submitted',
          message: `Your application for ${service.name} has been submitted successfully and is pending review.`,
        });
      
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
      
      toast.success('Application submitted successfully');
      navigate(`/applications/${application.id}`);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
        <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/services')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => navigate(`/services/${service.id}`)}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Service Details
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">Apply for {service.name}</h1>
          <p className="text-gray-600 mb-6">{service.description}</p>
          
          {connectionStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
              <p className="font-medium">Connection Error</p>
              <p className="text-sm">We're experiencing connection issues with our servers. You cannot submit applications at this time.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information that might be relevant to your application..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={submitting || connectionStatus !== 'connected'}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Required Documents</h3>
              
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                              {doc.file ? doc.file.name : 'No file selected'}
                            </p>
                          </div>
                        </div>
                        <label className="cursor-pointer bg-white text-indigo-600 px-3 py-1 border border-indigo-600 rounded-md hover:bg-indigo-50 text-sm">
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleFileChange(index, file);
                            }}
                            disabled={submitting || connectionStatus !== 'connected'}
                          />
                          {doc.file ? 'Change File' : 'Upload'}
                        </label>
                      </div>
                      {!doc.file && (
                        <p className="text-xs text-red-500 mt-2">This document is required</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific documents required for this service.</p>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting || connectionStatus !== 'connected'}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
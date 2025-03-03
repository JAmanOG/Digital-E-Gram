import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Service } from '../types/database';
import toast from 'react-hot-toast';
import { FileText, Clock, DollarSign, Search } from 'lucide-react';

export default function Services() {
  const { connectionStatus, user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      if (connectionStatus !== 'connected') {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching services:', error);
          toast.error('Failed to load services');
          return;
        }
        
        if (data) {
          setServices(data);
        }
      } catch (error) {
        console.error('Error in fetchServices:', error);
        toast.error('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [connectionStatus]);

  // Fallback services if database connection fails
  const fallbackServices = [
    {
      id: '1',
      name: 'Birth Certificate',
      description: 'Apply for a birth certificate for newborns or get a duplicate copy.',
      documents_required: ['ID Proof', 'Hospital Certificate'],
      fee: 100,
      processing_time: '7-10 days',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Death Certificate',
      description: 'Register a death and obtain a death certificate.',
      documents_required: ['ID Proof', 'Medical Certificate'],
      fee: 100,
      processing_time: '7-10 days',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Property Tax',
      description: 'Pay your property tax online or get property tax assessment.',
      documents_required: ['Property Documents', 'Previous Tax Receipts'],
      fee: 0,
      processing_time: 'Immediate',
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Income Certificate',
      description: 'Apply for income certificate for various purposes.',
      documents_required: ['ID Proof', 'Income Proof', 'Residence Proof'],
      fee: 50,
      processing_time: '15 days',
      created_at: new Date().toISOString()
    },
  ];

  const displayServices = services.length > 0 ? services : fallbackServices;
  
  // Filter services based on search term
  const filteredServices = displayServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold">Available Services</h1>
        <div className="mt-4 sm:mt-0 relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full"
            />
          </div>
        </div>
      </div>
      
      {connectionStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">We're experiencing connection issues with our servers. Showing cached services.</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                  <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
                  <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {service.fee !== undefined && (
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Fee: {service.fee > 0 ? `₹${service.fee}` : 'Free'}</span>
                      </div>
                    )}
                    
                    {service.processing_time && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Processing time: {service.processing_time}</span>
                      </div>
                    )}
                    
                    {service.documents_required && service.documents_required.length > 0 && (
                      <div className="flex items-start text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <span>Required documents:</span>
                          <ul className="list-disc list-inside ml-1 mt-1">
                            {service.documents_required.map((doc, index) => (
                              <li key={index} className="text-xs">{doc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <Link 
                      to={user ? `/apply/${service.id}` : '/login?redirect=services'}
                      className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block text-center ${connectionStatus !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {user ? 'Apply Now' : 'Login to Apply'}
                    </Link>
                    <Link
                      to={`/services/${service.id}`}
                      className="w-full py-2 px-4 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 inline-block text-center mt-2"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No services found matching "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-4 text-indigo-600 hover:text-indigo-800"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
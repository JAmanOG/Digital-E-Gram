import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Service } from "../types/database";
import toast from "react-hot-toast";
import { FileText, Clock, DollarSign, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Services() {
  const { connectionStatus, user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    documents_required: "",
    fee: 0,
    processing_time: "",
  });

  const fetchServices = async () => {
    if (connectionStatus !== "connected") {
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching services:", error);
        toast.error("Failed to load services");
        return;
      }

      if (data) {
        setServices(
          data.map((service) => ({
            ...service,
            documents_required: Array.isArray(service.documents_required)
              ? service.documents_required
              : service.documents_required
              ? [service.documents_required]
              : [],
          }))
        );
      }
    } catch (error) {
      console.error("Error in fetchServices:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && connectionStatus === "connected") {
      console.log("User:", user);

      const fetchProfileData = async () => {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast.error("Failed to load profile data");
        }

        console.log("Profile data:", profileData);
        if (profileData.role === "staff") {
          window.location.href = "/staff-dashboard";
        } else if (profileData.role === "admin") {
          setIsAdmin(true);
        }
      };
      fetchProfileData();

      fetchServices();
    } else {
      setLoading(false);
    }
  }, [user, location.pathname]);

  const handleAddService = async (e) => {
    e.preventDefault();
    console.log("Adding service:", newService);

    try {
      const { data, error } = await supabase.from("services").insert([
        {
          name: newService.name,
          description: newService.description,
          documents_required: newService.documents_required
            .split(",")
            .map((doc) => doc.trim()),
          fee: parseFloat(newService.fee),
          processing_time: newService.processing_time,
        },
      ]);

      console.log("Data:", data);
      console.log("Error:", error);

      if (error) throw error;

      toast.success("Service added successfully");
      console.log("Service added successfully");
      setShowAddForm(false);
      setNewService({
        name: "",
        description: "",
        documents_required: "",
        fee: 0,
        processing_time: "",
      });
      fetchServices(); // Refresh the services list
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Failed to add service");
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowEditForm(true);

    // Pre-fill form with service data
    setNewService({
      name: service.name,
      description: service.description,
      documents_required: Array.isArray(service.documents_required)
        ? service.documents_required.join(", ")
        : service.documents_required || "",
      fee: service.fee || 0,
      processing_time: service.processing_time || "",
    });
  };

  // Handle updating a service
  const handleUpdateService = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("services")
        .update({
          name: newService.name,
          description: newService.description,
          documents_required: newService.documents_required
            .split(",")
            .map((doc) => doc.trim()),
          fee: parseFloat(newService.fee),
          processing_time: newService.processing_time,
        })
        .eq("id", editingService.id);

      if (error) throw error;

      toast.success("Service updated successfully");
      setShowEditForm(false);
      setEditingService(null);
      setNewService({
        name: "",
        description: "",
        documents_required: "",
        fee: 0,
        processing_time: "",
      });

      fetchServices(); // Refresh services list
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Failed to update service");
    }
  };

  // Handle deleting a service
  const handleDeleteService = async (serviceId) => {
    // First step sets confirmation state
    if (!confirmDelete) {
      setConfirmDelete(serviceId);
      return;
    }

    // Only proceed if user confirmed for this specific service
    if (confirmDelete !== serviceId) {
      setConfirmDelete(serviceId);
      return;
    }

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      toast.success("Service deleted successfully");
      setConfirmDelete(null);
      fetchServices(); // Refresh services list
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  // Fallback services if database connection fails
  const fallbackServices = [
    {
      id: "1",
      name: "Birth Certificate",
      description:
        "Apply for a birth certificate for newborns or get a duplicate copy.",
      documents_required: ["ID Proof", "Hospital Certificate"],
      fee: 100,
      processing_time: "7-10 days",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Death Certificate",
      description: "Register a death and obtain a death certificate.",
      documents_required: ["ID Proof", "Medical Certificate"],
      fee: 100,
      processing_time: "7-10 days",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Property Tax",
      description:
        "Pay your property tax online or get property tax assessment.",
      documents_required: ["Property Documents", "Previous Tax Receipts"],
      fee: 0,
      processing_time: "Immediate",
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Income Certificate",
      description: "Apply for income certificate for various purposes.",
      documents_required: ["ID Proof", "Income Proof", "Residence Proof"],
      fee: 50,
      processing_time: "15 days",
      created_at: new Date().toISOString(),
    },
  ];

  const displayServices = services.length > 0 ? services : fallbackServices;

  // Filter services based on search term
  const filteredServices = displayServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Available Services
        </h1>
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {showAddForm ? "Cancel" : "Add New Service"}
            </button>
          )}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full transition-all"
            />
          </div>
        </div>
      </div>

      {isAdmin && showAddForm && (
        <div className="bg-white p-8 rounded-xl shadow-lg mb-10 border border-gray-100 animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Add New Service
          </h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Processing Time
                </label>
                <input
                  type="text"
                  required
                  value={newService.processing_time}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      processing_time: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Fee (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newService.fee}
                  onChange={(e) =>
                    setNewService({ ...newService, fee: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Required Documents (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={newService.documents_required}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      documents_required: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  rows={4}
                />
              </div>
            </div>
            <button
              onClick={handleAddService}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all font-medium"
            >
              Add Service
            </button>
          </form>
        </div>
      )}

      {connectionStatus === "error" && (
        <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
          <p className="font-medium text-lg mb-1">Connection Error</p>
          <p className="text-sm">
            We're experiencing connection issues with our servers. Showing
            cached services.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow duration-300 hover:border-indigo-100"
                >
                  <h2 className="text-xl font-semibold mb-3 text-gray-800">
                    {service.name}
                  </h2>
                  <p className="text-gray-600 mb-5 flex-grow">
                    {service.description}
                  </p>

                  <div className="space-y-3 mb-5 bg-gray-50 p-4 rounded-lg">
                    {service.fee !== undefined && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-5 w-5 mr-2 text-indigo-500" />
                        <span className="font-medium">
                          Fee: {service.fee > 0 ? `₹${service.fee}` : "Free"}
                        </span>
                      </div>
                    )}

                    {service.processing_time && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                        <span>Processing time: {service.processing_time}</span>
                      </div>
                    )}

                    {service.documents_required &&
                      Array.isArray(service.documents_required) &&
                      service.documents_required.length > 0 && (
                        <div className="flex items-start text-gray-600">
                          <FileText className="h-5 w-5 mr-2 text-indigo-500 mt-0.5" />
                          <div>
                            <span className="font-medium">
                              Required documents:
                            </span>
                            <ul className="list-disc list-inside ml-1 mt-1.5">
                              {service.documents_required.map((doc, index) => (
                                <li key={index}>{doc}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="mt-auto">
                    {!isAdmin && (
                      <Link
                        to={
                          user
                            ? `/apply/${service.id}`
                            : "/login?redirect=services"
                        }
                        className={`w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 inline-block text-center font-medium shadow-sm hover:shadow-md transition-all ${
                          connectionStatus !== "connected"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {user ? "Apply Now" : "Login to Apply"}
                      </Link>
                    )}
                    {isAdmin && (
                      <div className="flex space-x-3 justify-between mt-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="w-1/2 py-2.5 px-4 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 inline-block text-center font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className={`w-1/2 py-2.5 px-4 ${
                            confirmDelete === service.id
                              ? "bg-red-700"
                              : "bg-red-500"
                          } text-white rounded-lg hover:bg-red-600 inline-block text-center font-medium transition-colors shadow-sm`}
                        >
                          {confirmDelete === service.id
                            ? "Confirm Delete"
                            : "Delete"}
                        </button>
                      </div>
                    )}
                    {!isAdmin && (
                      <Link
                        to={`/services/${service.id}`}
                        className="w-full py-2.5 px-4 bg-white text-indigo-600 border border-indigo-500 rounded-lg hover:bg-indigo-50 inline-block text-center mt-3 font-medium transition-colors"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-xl mb-4">
                No services found matching "{searchTerm}"
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 px-6 py-2.5 text-indigo-600 hover:text-indigo-800 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}

      {showEditForm && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Service</h2>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingService(null);
                  setNewService({
                    name: "",
                    description: "",
                    documents_required: "",
                    fee: 0,
                    processing_time: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateService}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Service Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Processing Time
                  </label>
                  <input
                    type="text"
                    required
                    value={newService.processing_time}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        processing_time: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Fee (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newService.fee}
                    onChange={(e) =>
                      setNewService({ ...newService, fee: e.target.value })
                    }
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Required Documents (comma separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={newService.documents_required}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        documents_required: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    required
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        description: e.target.value,
                      })
                    }
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingService(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                  Update Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
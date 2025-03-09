import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Service } from "../types/database";
import {
  FileText,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { connectionStatus, user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (!id || connectionStatus !== "connected") {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching service:", error);
          toast.error("Failed to load service details");
          navigate("/services");
          return;
        }

        if (data) {
          setService(data);
        } else {
          navigate("/services");
        }
      } catch (error) {
        console.error("Error in fetchService:", error);
        toast.error("Failed to load service details");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id, connectionStatus, navigate]);

  // Fallback service if database connection fails
  const fallbackService = {
    id: id || "1",
    name: "Service Details",
    description:
      "This is a placeholder for service details when the database connection is unavailable.",
    documents_required: ["ID Proof", "Address Proof"],
    fee: 100,
    processing_time: "7-10 days",
    created_at: new Date().toISOString(),
  };

  const displayService = service || fallbackService;

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
          onClick={() => navigate("/services")}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Services
        </button>
      </div>

      {connectionStatus === "error" && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-medium">Connection Error</p>
          <p className="text-sm">
            We're experiencing connection issues with our servers. Some
            information may not be up to date.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{displayService.name}</h1>
          <p className="text-lg text-gray-600 mb-8">
            {displayService.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold">Fee</h3>
              </div>
              <p className="text-gray-700">
                {displayService.fee !== undefined
                  ? displayService.fee > 0
                    ? `₹${displayService.fee}`
                    : "Free"
                  : "Contact for details"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold">Processing Time</h3>
              </div>
              <p className="text-gray-700">
                {displayService.processing_time || "Varies"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold">Required Documents</h3>
              </div>
              {displayService.documents_required &&
              displayService.documents_required.length > 0 ? (
                <ul className="list-disc ml-6 mt-2">
                  {Array.isArray(displayService.documents_required)
                    ? displayService.documents_required.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))
                    : displayService.documents_required && (
                        <li>{displayService.documents_required}</li>
                      )}
                </ul>
              ) : (
                <p className="text-gray-700">No specific documents required</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold mb-4">Application Process</h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full text-indigo-600 font-bold mr-3">
                  1
                </div>
                <div>
                  <p className="font-medium">Submit Application</p>
                  <p className="text-gray-600 text-sm">
                    Fill out the application form and upload required documents
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full text-indigo-600 font-bold mr-3">
                  2
                </div>
                <div>
                  <p className="font-medium">Application Review</p>
                  <p className="text-gray-600 text-sm">
                    Your application will be reviewed by the concerned
                    department
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full text-indigo-600 font-bold mr-3">
                  3
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-gray-600 text-sm">
                    Application is processed based on the provided information
                  </p>
                </div>
              </div>

              <div className="flex">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full text-indigo-600 font-bold mr-3">
                  4
                </div>
                <div>
                  <p className="font-medium">Completion</p>
                  <p className="text-gray-600 text-sm">
                    Receive your certificate or service completion notification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4">
          {user ? (
            <Link
              to={`/apply/${displayService.id}`}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                connectionStatus !== "connected"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={(e) => {
                if (connectionStatus !== "connected") {
                  e.preventDefault();
                  toast.error(
                    "Cannot apply while offline. Please try again when connection is restored."
                  );
                }
              }}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Apply for this Service
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center">
              <p className="text-gray-600 mb-2 sm:mb-0 sm:mr-4">
                You need to be logged in to apply for this service
              </p>
              <Link
                to={`/login?redirect=services/${displayService.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login to Apply
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

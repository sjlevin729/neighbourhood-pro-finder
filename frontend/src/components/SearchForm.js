import React, { useState, useEffect } from 'react';

/**
 * SearchForm component for collecting service type and neighbourhood inputs
 * @param {Object} props - Component props
 * @param {string} props.service - Service type input value
 * @param {function} props.setService - Function to update service state
 * @param {string} props.neighborhood - Neighbourhood input value
 * @param {function} props.setNeighborhood - Function to update neighbourhood state
 * @param {boolean} props.isSearching - Whether search is in progress
 * @param {function} props.onSubmit - Form submission handler
 */
function SearchForm({ 
  service, 
  setService, 
  neighborhood, 
  setNeighborhood, 
  isSearching, 
  onSubmit 
}) {
  // State for available options from the backend
  const [serviceTypes, setServiceTypes] = useState([]);
  const [neighbourhoods, setNeighbourhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch available options from the backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        // Get backend URL from environment variable
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        
        // Fetch options from the backend
        const response = await fetch(`${backendUrl}/options`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format service types with proper capitalization
        const formattedServiceTypes = data.service_types.map(type => 
          type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        );
        
        // Format neighbourhoods with proper capitalization
        const formattedNeighbourhoods = data.neighbourhoods.map(hood => 
          hood.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        );
        
        setServiceTypes(formattedServiceTypes);
        setNeighbourhoods(formattedNeighbourhoods);
        setError('');
      } catch (err) {
        console.error('Error fetching options:', err);
        setError('Failed to load options. Using default values.');
        // Fallback to default values if API fails
        setServiceTypes(["Plumber", "Electrician", "Gardener", "Auto", "Handyman", "Cleaner", "Locksmith"]);
        setNeighbourhoods(["Reading", "Downtown", "West Side", "North Hills"]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, []);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Loading indicator while fetching options */}
      {loading && (
        <div className="text-center py-2 text-gray-500">
          <p>Loading available options...</p>
        </div>
      )}
      
      {/* Error message if options failed to load */}
      {error && (
        <div className="text-center py-2 text-red-500">
          <p>{error}</p>
        </div>
      )}
      
      {/* Service Type Input */}
      <div>
        <label 
          htmlFor="service" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Service Type
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="text"
            id="service"
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Plumber, Electrician"
            disabled={isSearching || loading}
            required
          />
        </div>

        {/* Quick Selection Buttons for Service Types */}
        <div className="mt-2 flex flex-wrap gap-2">
          {serviceTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setService(type)}
              className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
              disabled={isSearching || loading}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Neighbourhood Input */}
      <div>
        <label 
          htmlFor="neighbourhood" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Neighbourhood
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="neighborhood"
            name="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="pl-10 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Reading, West Side"
            disabled={isSearching || loading}
            required
          />
        </div>

        {/* Quick Selection Buttons for Neighbourhoods */}
        <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {neighbourhoods.map((hood) => (
            <button
              key={hood}
              type="button"
              onClick={() => setNeighborhood(hood)}
              className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
              disabled={isSearching || loading}
            >
              {hood}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full flex justify-center items-center py-3 px-4 rounded-md font-medium text-white shadow-sm ${
          isSearching 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
        disabled={isSearching}
      >
        {isSearching ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Searching...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Find Providers
          </>
        )}
      </button>
    </form>
  );
}

export default SearchForm;

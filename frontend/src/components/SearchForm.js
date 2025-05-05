import React from 'react';

/**
 * SearchForm component for collecting service type and neighborhood inputs
 * @param {Object} props - Component props
 * @param {string} props.service - Service type input value
 * @param {function} props.setService - Function to update service state
 * @param {string} props.neighborhood - Neighborhood input value
 * @param {function} props.setNeighborhood - Function to update neighborhood state
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
  // Common service types for suggestions
  const serviceTypes = [
    "Plumber",
    "Electrician",
    "Gardener",
    "Carpenter",
    "Painter"
  ];

  // Common neighborhoods for suggestions
  const neighborhoods = [
    "Downtown",
    "West Side",
    "North Hills"
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
            placeholder="e.g. Plumber, Electrician, Gardener"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            required
          />
        </div>
        
        {/* Service Type Suggestions */}
        <div className="mt-2 flex flex-wrap gap-2">
          {serviceTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setService(type)}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Neighborhood Input */}
      <div>
        <label 
          htmlFor="neighborhood" 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Neighborhood
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
            placeholder="e.g. Downtown, West Side, North Hills"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            required
          />
        </div>
        
        {/* Neighborhood Suggestions */}
        <div className="mt-2 flex flex-wrap gap-2">
          {neighborhoods.map(area => (
            <button
              key={area}
              type="button"
              onClick={() => setNeighborhood(area)}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {area}
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

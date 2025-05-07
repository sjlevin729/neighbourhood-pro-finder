import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SearchForm from './components/SearchForm';
import SearchMessage from './components/SearchMessage';
import ProviderResults from './components/ProviderResults';
import BookingForm from './components/BookingForm';

// Home page component
function Home() {
  // State hooks for form inputs
  const [service, setService] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // State for API results
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!service.trim() || !neighborhood.trim()) {
      setSearchMessage('Please enter both service type and neighborhood');
      return;
    }
    
    // Reset states
    setSearchMessage('');
    setError('');
    setLoading(true);
    setIsSearching(true);
    
    try {
      // Get backend URL from environment variable
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      // Construct the API URL with query parameters
      const apiUrl = `${backendUrl}/recommendations?service_type=${encodeURIComponent(service)}&neighborhood=${encodeURIComponent(neighborhood)}`;
      
      // Make the API request
      const response = await fetch(apiUrl);
      
      // Check if the response is ok
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      // Update the providers state with the results
      setProviders(data.providers || []);
      
      // Log the results to console for debugging
      console.log('API response:', data);
      
      // Set a message based on results
      if (data.providers && data.providers.length > 0) {
        setSearchMessage(`Found ${data.providers.length} providers for ${service} in ${neighborhood}`);
      } else {
        setSearchMessage(`No providers found for ${service} in ${neighborhood}`);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(`Failed to fetch recommendations: ${err.message}`);
      setProviders([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 p-4">
                <h2 className="text-xl font-semibold text-white">
                  Find a Service Provider
                </h2>
              </div>
              <div className="p-6">
                <SearchForm 
                  service={service}
                  setService={setService}
                  neighborhood={neighborhood}
                  setNeighborhood={setNeighborhood}
                  isSearching={isSearching}
                  onSubmit={handleSubmit}
                />
                
                {/* Search Message */}
                {searchMessage && <SearchMessage message={searchMessage} />}
              </div>
            </div>
            
            {/* How It Works Panel */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-6">
              <div className="bg-gray-100 p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  How It Works
                </h2>
              </div>
              <div className="p-4">
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>Enter the type of service you need</li>
                  <li>Specify your neighborhood</li>
                  <li>Our AI analyzes recommendations from your neighbors</li>
                  <li>View ranked results of trusted local professionals</li>
                </ol>
              </div>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
              <div className="bg-gray-100 p-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recommended Providers
                </h2>
              </div>
              <div className="p-6">
                {/* Provider Results */}
                <ProviderResults 
                  providers={providers} 
                  loading={loading} 
                  error={error} 
                />
                
                {/* Initial State - No Search Yet */}
                {!loading && !error && providers.length === 0 && !searchMessage && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-16 h-16 text-blue-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to find local professionals?</h3>
                    <p className="text-gray-500 max-w-md">
                      Use the search form to discover highly recommended service providers in your neighborhood.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <header className="bg-blue-600 shadow-md">
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <Link to="/" className="text-white hover:text-blue-100">
              <h1 className="text-3xl font-bold text-white text-center">
                Neighbourhood Pro Finder
              </h1>
            </Link>
            <p className="text-blue-100 text-center mt-2 max-w-2xl mx-auto">
              Find trusted professionals in your area based on neighborhood recommendations and AI-powered ranking
            </p>
          </div>
        </header>
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<BookingForm />} />
        </Routes>
        
        {/* Footer */}
        <footer className="bg-gray-800 mt-12">
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-gray-300 text-sm">
              {new Date().getFullYear()} Neighbourhood Pro Finder • AI-Powered Local Service Recommendations
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

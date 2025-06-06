import React, { useState } from 'react';

/**
 * ProviderResults component for displaying service provider recommendations
 * @param {Object} props - Component props
 * @param {Array} props.providers - List of provider objects
 * @param {boolean} props.loading - Whether results are loading
 * @param {string} props.error - Error message if any
 */
function ProviderResults({ providers, loading, error }) {
  // Helper function to render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
    
    // Add half star if needed
    if (halfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
    
    // Add empty stars to make 5 total
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
    }
    
    return (
      <div className="flex">
        {stars}
      </div>
    );
  };

  // Get recommendation strength badge color
  const getStrengthBadgeColor = (strength) => {
    switch (strength) {
      case 'Highly Recommended':
        return 'bg-green-100 text-green-800';
      case 'Strongly Recommended':
        return 'bg-blue-100 text-blue-800';
      case 'Recommended':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 text-center">Searching for the best providers in your area...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <p className="mt-2 text-sm text-red-500">Please try again or check your connection.</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return null; // Return null to let the parent component handle the empty state
  }

  return (
    <div>
      <div className="space-y-4">
        {providers.map((provider) => (
          <div 
            key={provider.id} 
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* Provider Card Header */}
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-medium text-lg mr-3">
                  {provider.rank}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStrengthBadgeColor(provider.recommendation_strength)}`}>
                {provider.recommendation_strength}
              </span>
            </div>
            
            {/* Provider Card Body */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {renderStars(provider.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {provider.rating ? provider.rating.toFixed(1) : 'N/A'}
                    </span>
                    {provider.reviews_count && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({provider.reviews_count} reviews)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-sm capitalize">{provider.service_type}</span>
                  </div>
                  
                  {/* Address information */}
                  <div className="flex items-start text-gray-600 mb-1">
                    <svg className="w-4 h-4 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <div>
                      <span className="text-sm capitalize block">{provider.neighborhood}</span>
                      {provider.street && (
                        <span className="text-xs text-gray-500 block">{provider.street}</span>
                      )}
                      {provider.postal_code && (
                        <span className="text-xs text-gray-500 block">{provider.postal_code}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Review distribution */}
                  {provider.review_distribution && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Review Distribution:</div>
                      <div className="flex items-center mb-1">
                        <div className="w-20 text-xs">5★</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${provider.review_distribution.fiveStar ? (provider.review_distribution.fiveStar / provider.reviews_count * 100) : 0}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-xs text-right">{provider.review_distribution.fiveStar || 0}</div>
                      </div>
                      <div className="flex items-center mb-1">
                        <div className="w-20 text-xs">4★</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full" 
                            style={{ width: `${provider.review_distribution.fourStar ? (provider.review_distribution.fourStar / provider.reviews_count * 100) : 0}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-xs text-right">{provider.review_distribution.fourStar || 0}</div>
                      </div>
                      <div className="flex items-center mb-1">
                        <div className="w-20 text-xs">3★</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${provider.review_distribution.threeStar ? (provider.review_distribution.threeStar / provider.reviews_count * 100) : 0}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-xs text-right">{provider.review_distribution.threeStar || 0}</div>
                      </div>
                      <div className="flex items-center mb-1">
                        <div className="w-20 text-xs">2★</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full" 
                            style={{ width: `${provider.review_distribution.twoStar ? (provider.review_distribution.twoStar / provider.reviews_count * 100) : 0}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-xs text-right">{provider.review_distribution.twoStar || 0}</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-20 text-xs">1★</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${provider.review_distribution.oneStar ? (provider.review_distribution.oneStar / provider.reviews_count * 100) : 0}%` }}
                          ></div>
                        </div>
                        <div className="w-8 text-xs text-right">{provider.review_distribution.oneStar || 0}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Column */}
                <div className="flex flex-col justify-start">
                  {/* Contact Information */}
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Information</h4>
                    
                    {provider.full_phone && (
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <a href={`tel:${provider.full_phone}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {provider.full_phone}
                        </a>
                      </div>
                    )}
                    
                    {provider.email && (
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                        <a href={`mailto:${provider.email}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {provider.email}
                        </a>
                      </div>
                    )}
                    
                    {provider.website && (
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                        </svg>
                        <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-auto">
                    <a 
                      href={`tel:${provider.full_phone}`} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 block text-center mb-2"
                    >
                      Contact Provider
                    </a>
                    
                    <a 
                      href={`/booking?provider=${encodeURIComponent(provider.name)}&service=${encodeURIComponent(provider.service_type)}&phone=${encodeURIComponent(provider.full_phone || '')}&email=${encodeURIComponent(provider.email || '')}`} 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 block text-center"
                    >
                      Make Booking
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Reviews Section */}
              {provider.reviews && provider.reviews.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Customer Reviews</h4>
                  <div className="space-y-3">
                    {provider.reviews.slice(0, 5).map((review, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-700">{review.reviewer}</span>
                          <div className="flex items-center">
                            <div className="flex mr-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-600 font-medium">AI-Powered Recommendations</p>
        </div>
        <p className="mt-1 text-sm text-blue-500">
          Our AI algorithm analyzes neighborhood recommendations and ratings to find the best service providers for you.
        </p>
      </div>
    </div>
  );
}

export default ProviderResults;

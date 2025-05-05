import React from 'react';

/**
 * SearchMessage component for displaying search feedback
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display
 */
function SearchMessage({ message }) {
  // Determine if this is an error message
  const isError = message.includes('Please enter') || message.includes('No providers found');
  const isSuccess = message.includes('Found');
  
  let icon, bgColor, textColor, borderColor;
  
  if (isError) {
    icon = (
      <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
    bgColor = 'bg-yellow-50';
    textColor = 'text-yellow-700';
    borderColor = 'border-yellow-200';
  } else if (isSuccess) {
    icon = (
      <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    bgColor = 'bg-green-50';
    textColor = 'text-green-700';
    borderColor = 'border-green-200';
  } else {
    icon = (
      <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    bgColor = 'bg-blue-50';
    textColor = 'text-blue-700';
    borderColor = 'border-blue-200';
  }
  
  return (
    <div className={`mt-4 ${bgColor} border ${borderColor} rounded-md p-3`}>
      <div className="flex">
        {icon}
        <p className={`ml-2 text-sm ${textColor}`}>{message}</p>
      </div>
    </div>
  );
}

export default SearchMessage;

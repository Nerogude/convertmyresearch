import React from 'react';
import LandingPage from './LandingPage';
import ThankYou from './ThankYou';

export default function App() {
  // Simple routing based on URL path
  const path = window.location.pathname;
  
  if (path === '/thank-you') {
    return <ThankYou />;
  }
  
  return <LandingPage />;
}
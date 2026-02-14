import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Register: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Since we are using Google SSO, we don't need a separate register page.
    // Redirect to login.
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-brand-beige/50 flex items-center justify-center">
        <p className="text-stone-500 animate-pulse">Redirecionando para login...</p>
    </div>
  );
};
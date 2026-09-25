import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  ShieldCheck, 
  ArrowLeft
} from 'lucide-react';
import LoginForm from '../components/Login/LoginForm';

export default function Login() {
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLoginSubmit = (username, password) => {
    const success = login(username, password);
    if (success) {
      if (username === 'admin') {
        navigate('/admin');
      } else {
        navigate('/worker');
      }
    } else {
      setError('Invalid username or password. Please check your credentials.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F8FAFC',
      padding: '2rem 1.5rem',
      fontFamily: "'Inter', sans-serif",
      position: 'relative'
    }}>
      
      {/* Top Left Return Button */}
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '1.75rem',
          left: '2rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          color: '#0F2A4A',
          padding: '0.45rem 0.9rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease'
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      {/* Centered Login Card */}
      <div className="login-card-container" style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        border: '1px solid #E2E8F0',
        padding: '2.5rem'
      }}>
        
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: '#0F2A4A',
            color: '#FFFFFF',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(15, 42, 74, 0.25)'
          }}>
            <Building2 size={26} />
          </div>
          
          <h2 style={{ color: '#0F2A4A', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            Official Login Portal
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
            Sign in to manage building approval applications
          </p>
        </div>

        {/* Login Form */}
        <LoginForm onSubmit={handleLoginSubmit} authError={error} />
        
        {/* Security Footer Note */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
            <ShieldCheck size={15} /> 256-Bit Encrypted Official Portal
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.35rem', margin: 0 }}>
            Building Approval Management System • Dept of Municipal Administration
          </p>
        </div>

      </div>

    </div>
  );
}

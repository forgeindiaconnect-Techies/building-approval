import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginForm({ onSubmit, authError }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!username.trim()) {
      setValidationError('Username / Email is required');
      return;
    }
    if (!password.trim()) {
      setValidationError('Password is required');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSubmit(username.trim(), password.trim());
    }, 250);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }} autoComplete="off">
      
      {/* Hidden dummy decoy inputs to stop browser password managers from auto-filling */}
      <input type="text" name="fake_user_field" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />
      <input type="password" name="fake_pass_field" style={{ display: 'none' }} tabIndex="-1" autoComplete="new-password" />

      {/* Error Banner */}
      {(validationError || authError) && (
        <div style={{
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderLeft: '4px solid #dc2626',
          color: '#991b1b',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚠️ {validationError || authError}
        </div>
      )}

      {/* Username / Email Field */}
      <div style={{ marginBottom: '1.35rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
          User ID / Email
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '1rem', color: '#64748b', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <User size={19} />
          </div>
          <input 
            type="text"
            id="gov_auth_user_field"
            name="gov_auth_user_field"
            autoComplete="one-time-code"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            placeholder="Enter your username or email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '0.78rem 1rem 0.78rem 2.85rem',
              fontSize: '0.925rem',
              fontWeight: 500,
              color: '#0f172a',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#0F2A4A';
              e.target.style.boxShadow = '0 0 0 4px rgba(15, 42, 74, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
      
      {/* Password Field */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
            Password
          </label>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#0F2A4A', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>
            Forgot Password?
          </a>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '1rem', color: '#64748b', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Lock size={19} />
          </div>
          <input 
            type={showPassword ? 'text' : 'password'}
            id="gov_auth_pass_field"
            name="gov_auth_pass_field"
            autoComplete="new-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.78rem 3rem 0.78rem 2.85rem',
              fontSize: '0.925rem',
              fontWeight: 500,
              color: '#0f172a',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#0F2A4A';
              e.target.style.boxShadow = '0 0 0 4px rgba(15, 42, 74, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.85rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>
      
      {/* Submit Button */}
      <button 
        type="submit" 
        className="login-btn-glow"
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '0.85rem 1.25rem',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#ffffff',
          backgroundColor: '#0F2A4A',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 15px rgba(15, 42, 74, 0.25)',
          opacity: isLoading ? 0.75 : 1
        }}
      >
        {isLoading ? 'Authenticating...' : (
          <>
            Sign In <ArrowRight size={18} />
          </>
        )}
      </button>

    </form>
  );
}

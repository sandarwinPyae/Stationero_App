import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Validation Error: Passwords do not match!");
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/customer/forgot-password', { 
        email: email.trim(), 
        new_password: newPassword 
      });
      if (response.status === 200) {
        navigate('/login');
      }
    } catch (error) {
      alert(`Reset Failed: Network error reaching backend server.`);
    }
  };

  return (
    <div style={isMobile ? styles.containerMobile : styles.container}>
      <div style={isMobile ? styles.cardMobile : styles.card}>
        <div style={styles.logoRow}>Stationero</div>
        <h2 style={styles.heading}>Reset Your Password</h2>
        <p style={styles.subtext}>Enter your account email address and choose a fresh secure password credentials set.</p>
        
        <form onSubmit={handlePasswordResetSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Account Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. customer@gmail.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={styles.inputField} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <div style={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Minimum 8 characters and Must include both digit and character" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={styles.passwordInput} 
                required 
              />
              <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#f25278" style={styles.svgIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={styles.svgIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={styles.passwordWrapper}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Repeat your new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={styles.inputFieldWithPadding} 
                required 
              />
              <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                {showConfirmPassword ? (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#f25278" style={styles.svgIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={styles.svgIcon}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            onMouseEnter={() => setHoveredBtn(true)} 
            onMouseLeave={() => setHoveredBtn(false)} 
            style={{ 
              ...styles.submitBtn, 
              ...(hoveredBtn ? styles.submitBtnHover : {}) 
            }} 
          > 
            Reset Password 
          </button>

          <div style={styles.backRow}> 
            Remembered your password?{' '} 
            <span onClick={() => navigate('/login')} style={styles.backLink}> 
              Back to Login 
            </span> 
          </div> 
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', width: '100%', boxSizing: 'border-box' },
  containerMobile: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px min(10px, 3%)', width: '100%', boxSizing: 'border-box' },
  card: { backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  cardMobile: { backgroundColor: '#ffffff', padding: '30px 20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  logoRow: { color: '#f25278', fontSize: '26px', fontWeight: '700', textAlign: 'center', marginBottom: '15px' },
  heading: { fontFamily: "'Poppins', sans-serif", fontSize: '22px', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0', textAlign: 'center', letterSpacing: '-0.3px' },
  subtext: { fontFamily: "'Poppins', sans-serif", fontSize: '13px', color: '#4b5563', textAlign: 'center', margin: '-16px 0 24px 0', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', boxSizing: 'border-box' },
  label: { fontFamily: "'Poppins', sans-serif", fontSize: '14px', fontWeight: '500', color: '#4b5563' },
  inputField: { fontFamily: "'Poppins', sans-serif", padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#1f2937', width: '100%', boxSizing: 'border-box' },
  passwordWrapper: { position: 'relative', width: '100%', display: 'flex', alignItems: 'center', boxSizing: 'border-box' },
  passwordInput: { fontFamily: "'Poppins', sans-serif", padding: '10px 45px 10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#1f2937', width: '100%', boxSizing: 'border-box' },
  inputFieldWithPadding: { fontFamily: "'Poppins', sans-serif", padding: '10px 45px 10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#1f2937', width: '100%', boxSizing: 'border-box' },
  eyeIcon: { position: 'absolute', right: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' },
  svgIcon: { width: '18px', height: '18px' },
  submitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', marginTop: '10px', width: '100%', outline: 'none' },
  submitBtnHover: { backgroundColor: '#e04167' },
  backRow: { fontSize: '13px', color: '#4b5563', textAlign: 'center', marginTop: '10px' },
  backLink: { color: '#f25278', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }
};

export default ForgotPasswordPage;

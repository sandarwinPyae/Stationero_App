import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🌟 axios import လုပ်ပါ
const ForgotPasswordPage = () => {
  const navigate = useNavigate(); const [hoveredBtn, setHoveredBtn] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Validation Error: Passwords do not match!");
      return;
    }

    try {
      // 🌟 axios.post သို့ ပြောင်းလဲခြင်း
      const response = await axios.post('http://localhost:8000/api/customer/forgot-password', {
        email: email.trim(),
        new_password: newPassword
      });

      // 🌟 axios တွင် response.status ကို စစ်ခြင်း
      if (response.status === 200) {
        navigate('/login');
      }
    } catch (error) {
      // 🌟 Error message ကို axios မှတဆင့် ယူခြင်း
      const msg = error.response?.data?.detail || 'Email address not found.';
      alert(`Reset Failed: ${"Network error reaching backend server."}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
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
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters and Must include both digit and character"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ ...styles.passwordInput, width: '100%', paddingRight: '45px', boxSizing: 'border-box' }}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
              >
                {showPassword ? (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#f25278" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...styles.inputField, width: '100%', paddingRight: '45px', boxSizing: 'border-box' }}
                required
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#f25278" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={{ width: '18px', height: '18px' }}>
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
            style={{ ...styles.submitBtn, ...(hoveredBtn ? styles.submitBtnHover : {}) }}
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
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  card: { backgroundColor: '#ffffff', padding: '45px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', width: '100%', maxWidth: '440px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' },
  logoRow: { color: '#f25278', fontSize: '26px', fontWeight: 'bold', textAlign: 'center', marginBottom: '15px' },
  heading: { fontSize: '20px', fontWeight: 'bold', color: '#111', margin: '0 0 8px 0', textAlign: 'center' },
  subtext: { fontSize: '13px', color: '#777', textAlign: 'center', margin: '0 0 25px 0', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#555' },
  inputField: { padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' },
  passwordInput: { padding: '12px 60px 12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  toggleText: { position: 'absolute', right: '15px', fontSize: '12px', color: '#f25278', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' },
  submitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '13px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease', marginTop: '10px', width: '100%', outline: 'none', boxShadow: '0 4px 12px rgba(242,82,120,0.15)' },
  submitBtnHover: { backgroundColor: '#e04167', boxShadow: '0 4px 15px rgba(242,82,120,0.25)' },
  backRow: { fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '15px' },
  backLink: { color: '#f25278', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }
};

export default ForgotPasswordPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const ForgotPasswordPage = () => {
  const navigate = useNavigate(); const [hoveredBtn, setHoveredBtn] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Validation Error: Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login'); // Redirects the customer back to the login screen immediately
      } else {
        alert(`Reset Failed: ${data.detail || 'Email address not found.'}`);
      }
    } catch (error) {
      console.error(error);
      alert('Network error reaching backend server.');
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
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.passwordInput}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleText}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.inputField}
              required
            />
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
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#fafafa', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
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

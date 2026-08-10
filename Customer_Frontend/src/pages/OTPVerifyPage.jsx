import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StationeroNavbar } from './StationeroPage';
import { AuthProvider } from '../context/AuthContext';

const OTPVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // SignUpPage မှ Navigate လုပ်စဉ် သယ်လာသော email ကို ပြန်ယူခြင်း
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp || otp.trim().length === 0) {
      setErrorMessage("Please enter the OTP verification code.");
      return;
    }

    setLoading(true);

    try {
      // Backend /api/verify-otp သို့ Email နှင့် OTP ပို့ပေးမည်
      const response = await axios.post('http://localhost:8000/api/verify-otp', {
        email: email,
        otp: otp.trim()
      });

      if (response.status === 201 || response.status === 200) {
        setSuccessMessage("Registration successful! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage('Invalid or expired OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <AuthProvider>
        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <StationeroNavbar showSearch={false} />
        </div>
      </AuthProvider>

      <main style={styles.mainContent}>
        <h2 style={styles.heading}>Verify Your Email</h2>

        <form onSubmit={handleVerifyOTP} style={styles.formBox}>
          <p style={{ textAlign: 'center', color: '#555', fontSize: '14px', margin: '0 0 10px 0' }}>
            We sent a verification code to <br />
            <strong style={{ color: '#f25278' }}>{email || 'your email'}</strong>
          </p>

          {errorMessage && (
            <div style={styles.errorBanner}>{errorMessage}</div>
          )}

          {successMessage && (
            <div style={styles.successBanner}>{successMessage}</div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Enter 6-Digit OTP Code</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 123456"
              style={{ ...styles.input, letterSpacing: '4px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setHoveredBtn('submitOtp')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ 
              ...styles.submitBtn, 
              ...(hoveredBtn === 'submitOtp' ? styles.submitBtnHover : {}),
              opacity: loading ? 0.7 : 1 
            }}
          >
            {loading ? "Verifying..." : "Verify & Register"}
          </button>

          <hr style={styles.divider} />

          <p style={styles.footerText}>
            Didn't receive the code?{' '}
            <span
              onClick={() => navigate('/signup')}
              onMouseEnter={() => setHoveredLink('signupBack')}
              onMouseLeave={() => setHoveredLink(null)}
              style={{ ...styles.signUpLinkBtn, ...(hoveredLink === 'signupBack' ? { color: '#c0395b' } : {}) }}
            >
              Back to Sign up
            </span>
          </p>
        </form>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#ffffff', minHeight: '100vh', margin: 0, width: '100%', boxSizing: 'border-box' },
  mainContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '20px min(20px, 4%)', boxSizing: 'border-box' },
  heading: { fontSize: '24px', marginBottom: '20px', color: '#111', textAlign: 'center' },
  formBox: { backgroundColor: '#f3f3f3', padding: '40px min(30px, 6%)', borderRadius: '15px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' },
  errorBanner: { backgroundColor: '#ffeef0', color: '#d9383a', padding: '10px 15px', borderRadius: '10px', fontSize: '14px', border: '1px solid #fccacf', fontWeight: 'bold', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  successBanner: { backgroundColor: '#e6f4ea', color: '#137333', padding: '10px 15px', borderRadius: '10px', fontSize: '14px', border: '1px solid #ceead6', fontWeight: 'bold', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', boxSizing: 'border-box' },
  label: { fontSize: '14px', color: '#333' },
  input: { padding: '12px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '16px', outline: 'none', backgroundColor: '#ffffff', width: '100%', boxSizing: 'border-box' },
  submitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px', borderRadius: '20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s ease', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' },
  submitBtnHover: { backgroundColor: '#d93a5f' },
  divider: { border: 'none', height: '1px', backgroundColor: '#ccc', margin: '15px 0', width: '100%' },
  footerText: { textAlign: 'center', fontSize: '14px', color: '#555', marginBottom: '5px' },
  signUpLinkBtn: { color: '#f25278', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', transition: 'color 0.2s ease' }
};

export default OTPVerifyPage;
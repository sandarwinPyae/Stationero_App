import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { StationeroNavbar } from './StationeroPage'; 
import { AuthProvider } from '../context/AuthContext';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/signup', {
        name: name.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        address: address.trim(),
        password: password
      });

      if (response.status === 201 || response.status === 200) {
        // OTP Page သို့ Email အချက်အလက်ပါ သယ်ဆောင်ပြီး Navigate လုပ်မည်
        navigate('/verify-otp', { state: { email: email.trim() } });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage('Server connection error. Please try again later.');
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
        <h2 style={styles.heading}>Create Account</h2>
        <form onSubmit={handleSignupSubmit} style={styles.formBox}>

          {errorMessage && (
            <div style={styles.errorBanner}>{errorMessage}</div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Home Address</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ ...styles.input, paddingRight: '45px' }} 
                required 
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#f25278" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#9ca3af" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setHoveredBtn('submitSignup')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ 
              ...styles.submitBtn, 
              ...(hoveredBtn === 'submitSignup' ? styles.submitBtnHover : {}),
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Sending OTP..." : "Get OTP Code"}
          </button>

          <hr style={styles.divider} />

          <p style={styles.footerText}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              onMouseEnter={() => setHoveredLink('loginLink')}
              onMouseLeave={() => setHoveredLink(null)}
              style={{ ...styles.signUpLinkBtn, ...(hoveredLink === 'loginLink' ? { color: '#c0395b' } : {}) }}
            >
              Log in
            </span>
          </p>
        </form>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#ffffff', minHeight: '100vh', margin: 0, width: '100%', boxSizing: 'border-box' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px min(50px, 4%)', flexWrap: 'wrap', gap: '15px' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
  link: { cursor: 'pointer', color: '#333' },
  mainContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '20px min(20px, 4%)', boxSizing: 'border-box' },
  heading: { fontSize: '24px', marginBottom: '20px', color: '#111', textAlign: 'center' },
  formBox: { backgroundColor: '#f3f3f3', padding: '40px min(30px, 6%)', borderRadius: '15px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' },
  errorBanner: { backgroundColor: '#ffeef0', color: '#d9383a', padding: '10px 15px', borderRadius: '10px', fontSize: '14px', border: '1px solid #fccacf', fontWeight: 'bold', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', boxSizing: 'border-box' },
  label: { fontSize: '14px', color: '#333' },
  input: { padding: '12px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '16px', outline: 'none', backgroundColor: '#ffffff', width: '100%', boxSizing: 'border-box' },
  submitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px', borderRadius: '20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s ease', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' },
  submitBtnHover: { backgroundColor: '#d93a5f' },
  navBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
  btnHover: { backgroundColor: '#d93a5f' },
  divider: { border: 'none', height: '1px', backgroundColor: '#ccc', margin: '15px 0', width: '100%' },
  footerText: { textAlign: 'center', fontSize: '14px', color: '#555', marginBottom: '5px' },
  signUpLinkBtn: { color: '#f25278', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', transition: 'color 0.2s ease' }
};

export default SignUpPage;
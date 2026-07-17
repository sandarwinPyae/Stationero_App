import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 🌟 useNavigate ကို Import လုပ်ပါ
import { AuthContext } from '../context/AuthContext'; // 🌟 AuthContext ကို Import လုပ်ပါ
import axios from 'axios';
import { StationeroNavbar } from './StationeroPage'; 
import { AuthProvider } from '../context/AuthContext';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // 🌟 Routing အတွက် သုံးရန်
  const { setIsLoggedIn } = useContext(AuthContext); // 🌟 Global Login State ကို ယူရန်
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear out any old cached error message text blocks on your screen instantly
    if (typeof setErrorMessage === 'function') {
      setErrorMessage('');
    }

    try {
      console.log("Dispatching clean authentication payload over the wire...");
      
      // ---- FIXED: USING AN EXPLICIT DIRECT NETWORK CLIENT POST TO BYPASS STALE STATES ----
      const response = await axios({
        method: 'post',
        url: 'http://localhost:8000/api/login',
        data: {
          email: email.trim(),
          password: password
        },
        timeout: 5000 // Fails fast if the server is dropped rather than freezing your view
      });

      const data = response.data;

      if (response.status === 200 || response.status === 201) {
        const userRole = data.role || 'customer';

        const userObj = {
          name: data.customer_name || (data.profile && data.profile.name) || 'Customer',
          email: email.trim(),
          phone: (data.profile && data.profile.phone) || '-',
          address: (data.profile && data.profile.address) || '-',
          role: userRole
        };

        // Save session tokens to persistent browser memory card
        localStorage.setItem('stationero_logged_user', JSON.stringify(userObj));
        
        if (typeof setIsLoggedIn === 'function') {
          setIsLoggedIn(true);
        }

        // ---- FIXED: BYPASS LOCAL ROUTER COMPILATION BLOCKS COMPLETELY ----
        if (userRole === 'admin') {
          console.log("Master Admin access verified! Redirecting browser port...");
          window.location.href = "http://localhost:5174/admin/dashboard"; // 👈 Port hopping
        } else {
          console.log("Customer authenticated! Forcing hard reload to sync profile layout...");
          navigate('/'); // 👈 Clean reload customer dashboard baseline
        }
      }
    } catch (error) {
      console.error("Login endpoint stream exception caught:", error);
      
      const serverFeedback = error.response?.data?.detail || error.response?.data?.message;
      const displayString = serverFeedback || "Server connection error. Please try again later.";
      
      if (typeof setErrorMessage === 'function') {
        setErrorMessage(displayString);
      } else {
        alert(displayString);
      }
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
        <h2 style={styles.heading}>Log in</h2>
        <form onSubmit={handleSubmit} style={styles.formBox}>

          {errorMessage && (
            <div style={styles.errorBanner}>{errorMessage}</div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ ...styles.input, width: '100%', paddingRight: '45px', boxSizing: 'border-box' }} 
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
            <span
              onClick={() => navigate('/forgot-password')} 
              style={{ color: '#f25278', cursor: 'pointer', fontSize: '13px', textAlign: 'right', marginTop: '8px', fontWeight: 'bold' }}
            >
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            onMouseEnter={() => setHoveredBtn('submitLogin')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ ...styles.submitBtn, ...(hoveredBtn === 'submitLogin' ? styles.submitBtnHover : {}) }}
          >
            Log in
          </button>

          <hr style={styles.divider} />

          <p style={styles.footerText}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/signup')} 
              onMouseEnter={() => setHoveredLink('signupLink')}
              onMouseLeave={() => setHoveredLink(null)}
              style={{ ...styles.signUpLinkBtn, ...(hoveredLink === 'signupLink' ? { color: '#c0395b' } : {}) }}
            >
              Sign up
            </span>
          </p>
        </form>
      </main>
    </div>
  );}

  const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#ffffff', minHeight: '100vh', margin: 0, width: '100%', boxSizing: 'border-box' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px min(50px, 4%)', flexWrap: 'wrap', gap: '15px' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
  link: { cursor: 'pointer', color: '#333' },
  toggleText: { position: 'absolute', right: '15px', fontSize: '15px', color: '#f25278', fontWeight: 200, cursor: 'pointer', userSelect: 'none' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center', width: '100%' },
  mainContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '20px min(20px, 4%)', boxSizing: 'border-box' },
  heading: { fontSize: '24px', marginBottom: '20px', color: '#111', textAlign: 'center' },
  formBox: { backgroundColor: '#f3f3f3', padding: '40px min(30px, 6%)', borderRadius: '15px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' },
  errorBanner: { backgroundColor: '#ffeef0', color: '#d9383a', padding: '10px 15px', borderRadius: '10px', fontSize: '15px', border: '1px solid #fccacf', fontWeight: 'bold', textAlign: 'center', width: '100%', boxSizing: 'border-box' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', width: '100%', boxSizing: 'border-box' },
  label: { fontSize: '15px', color: '#333' },
  input: { padding: '12px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '16px', outline: 'none', backgroundColor: '#ffffff', width: '100%', boxSizing: 'border-box' },
  submitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px', borderRadius: '20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s ease', width: '100%', boxSizing: 'border-box' },
  submitBtnHover: { backgroundColor: '#d93a5f' },
  navBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '15px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
  btnHover: { backgroundColor: '#d93a5f' },
  divider: { border: 'none', height: '1px', backgroundColor: '#ccc', margin: '15px 0', width: '100%' },
  footerText: { textAlign: 'center', fontSize: '15px', color: '#555', marginBottom: '5px' },
  signUpLinkBtn: { color: '#f25278', cursor: 'pointer', textDecoration: 'underline', fontWeight: 200, transition: 'color 0.2s ease' }
};

export default LoginPage;
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 🌟 useNavigate ကို Import လုပ်ပါ
import { AuthContext } from '../context/AuthContext'; // 🌟 AuthContext ကို Import လုပ်ပါ
import axios from 'axios';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate(); // 🌟 Routing အတွက် သုံးရန်
  const { setIsLoggedIn } = useContext(AuthContext); // 🌟 Global Login State ကို ယူရန်

  // Hover states for various interactive blocks
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // 🌟 axios.post သို့ ပြောင်းလဲခြင်း
      const response = await axios.post('http://localhost:8000/api/login', {
        email: email,
        password: password
      });

      const data = response.data;

      // 🌟 axios တွင် response.ok အစား status ကို စစ်ရပါမည်
      if (response.status === 200) {
        const userObj = {
          name: data.customer_name || (data.profile && data.profile.name) || 'Customer',
          email: email.trim(),
          phone: (data.profile && data.profile.phone) || '-',
          address: (data.profile && data.profile.address) || '-',
          role: data.role || 'customer'
        };

        localStorage.setItem('stationero_logged_user', JSON.stringify(userObj));
        setIsLoggedIn(true);

        if (data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/product');
        }

      }
    } catch (error) {
      // 🌟 Error message ကို axios မှတဆင့် ယူခြင်း
      const msg = error.response?.data?.message || error.response?.data?.detail || 'Authentication failed.';
      setErrorMessage("Server connection error. Please try again later.");
    }
  };





  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.logo}>Stationero</div>
        <nav style={styles.navLinks}>
          {/* 🌟 Navigation များကို navigate() ဖြင့် ပြောင်းထားပါသည် */}
          <span style={styles.link} onClick={() => navigate('/product')}>Home</span>
          <span style={styles.link} onClick={() => navigate('/about')}>About Us</span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            onMouseEnter={() => setHoveredBtn('navLogin')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ ...styles.navBtn, ...(hoveredBtn === 'navLogin' ? styles.btnHover : {}) }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            onMouseEnter={() => setHoveredBtn('navSignup')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ ...styles.navBtn, ...(hoveredBtn === 'navSignup' ? styles.btnHover : {}) }}
          >
            Signup
          </button>
        </nav>
      </header>

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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />

            <span
              onClick={() => navigate('/forgot-password')} // 🌟 Route ကို App.jsx အတိုင်း ပြင်ထားသည်
              style={{ color: '#f25278', cursor: 'pointer', fontSize: '13px', textAlign: 'right', marginTop: '6px', fontWeight: 'bold' }}
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
              onClick={() => navigate('/signup')} // 🌟 Route ကို App.jsx အတိုင်း ပြင်ထားသည်
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
  );
};

// Styles များ မူလအတိုင်း ထားပါသည်
const styles = {
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', margin: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { cursor: 'pointer', color: '#333' },
  mainContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' },
  heading: { fontSize: '24px', marginBottom: '20px', color: '#111' },
  formBox: { backgroundColor: '#f3f3f3', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' },
  errorBanner: { backgroundColor: '#ffeef0', color: '#d9383a', padding: '10px 15px', borderRadius: '10px', fontSize: '14px', border: '1px solid #fccacf', fontWeight: 'bold', textAlign: 'center' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '14px', color: '#333' },
  input: { padding: '12px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' },
  submitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px', borderRadius: '20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s ease' },
  submitBtnHover: { backgroundColor: '#d93a5f' },
  navBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
  btnHover: { backgroundColor: '#d93a5f' },
  divider: { border: 'none', height: '1px', backgroundColor: '#ccc', margin: '15px 0' },
  footerText: { textAlign: 'center', fontSize: '14px', color: '#555', marginBottom: '5px' },
  signUpLinkBtn: { color: '#f25278', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', transition: 'color 0.2s ease' }
};

export default Login;
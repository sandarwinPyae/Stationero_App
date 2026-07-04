import React, { useState } from 'react';

const Login = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Hover states for various interactive blocks
  const [hoveredBtn, setHoveredBtn] = useState(null); 
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. FIXED: Unified dictionary schema mapping layout structure to prevent Order & Profile drops
        const userObj = {
          name: data.customer_name || (data.profile && data.profile.name) || 'Customer',
          email: email.trim(),
          phone: (data.profile && data.profile.phone) || '-',
          address: (data.profile && data.profile.address) || '-',
          role: data.role || 'customer'
        };
        
        localStorage.setItem('stationero_logged_user', JSON.stringify(userObj));
        
        // 2. FIXED: Route explicitly to 'productdetail' matching your App.jsx lowercase scheme strings
        onNavigate('productdetail'); 
      } else {
        setErrorMessage(data.message || data.detail || 'Authentication failed.');
      }
    } catch (error) {
      setErrorMessage('Server connection error. Please try again later.');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.logo}>Stationero</div>
        <nav style={styles.navLinks}>
          <span style={styles.link} onClick={() => onNavigate('productdetail')}>Home</span>
          <span style={styles.link} onClick={() => onNavigate('productdetail')}>About Us</span>
          <button 
            type="button" 
            onClick={() => onNavigate('login')} 
            onMouseEnter={() => setHoveredBtn('navLogin')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{...styles.navBtn, ...(hoveredBtn === 'navLogin' ? styles.btnHover : {})}}
          >
            Login
          </button>
          <button 
            type="button" 
            onClick={() => onNavigate('signup')} 
            onMouseEnter={() => setHoveredBtn('navSignup')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{...styles.navBtn, ...(hoveredBtn === 'navSignup' ? styles.btnHover : {})}}
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
            
            {/* 3. FIXED: ADDED YOUR DYNAMIC FORGOT PASSWORD REDIRECT WITH A SMALL p */}
            <span 
              onClick={() => onNavigate('forgotpassword', email)} 
              style={{ color: '#f25278', cursor: 'pointer', fontSize: '13px', textAlign: 'right', marginTop: '6px', fontWeight: 'bold' }}
            >
              Forgot password?
            </span>
          </div>

          <button 
            type="submit" 
            onMouseEnter={() => setHoveredBtn('submitLogin')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{...styles.submitBtn, ...(hoveredBtn === 'submitLogin' ? styles.submitBtnHover : {})}}
          >
            Log in
          </button>
          
          <hr style={styles.divider} />
          
          <p style={styles.footerText}>
            Don't have an account?{' '}
            {/* 4. FIXED: PASS EXPLICIT ALL-LOWERCASE TARGET STRINGS TO PREVENT WHITE SCREEN BUNDLE DROPS */}
            <span 
              onClick={() => onNavigate('signup')} 
              onMouseEnter={() => setHoveredLink('signupLink')}
              onMouseLeave={() => setHoveredLink(null)}
              style={{...styles.signUpLinkBtn, ...(hoveredLink === 'signupLink' ? { color: '#c0395b' } : {})}}
            >
              Sign up
            </span>
          </p>
        </form>
      </main>
    </div>
  );
};

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

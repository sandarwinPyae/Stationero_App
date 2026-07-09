import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🌟 axios ကို import လုပ်ပါ

const SignUpPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      // 🌟 fetch အစား axios.post ကို အသုံးပြုထားသည်
      // axios က Content-Type နဲ့ JSON ပြောင်းတာတွေကို အလိုအလျောက် လုပ်ပေးပါတယ်
      const response = await axios.post('http://localhost:8000/api/signup', {
        name: name.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        address: address.trim(),
        password: password
      });

      // Axios မှာ 2xx status ဆိုရင် အောင်မြင်တယ်လို့ သတ်မှတ်ပြီး ဒီလိုင်းကို ရောက်လာပါတယ်
      if (response.status === 201 || response.status === 200) {
        navigate('/login');
      }
    } catch (error) {
      // 🌟 Error handling ကို axios ပုံစံဖြင့် ပြင်ဆင်ထားသည်
      if (error.response && error.response.data && error.response.data.detail) {
        setErrorMessage(error.response.data.detail);
      } else {
        setErrorMessage('Server connection error. Please try again later.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.navbar}>
        <div style={styles.logo}>Stationero</div>
        <nav style={styles.navLinks}>
          <span style={styles.link} onClick={() => navigate('/')}>Home</span>
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
          </div>

          <button
            type="submit"
            onMouseEnter={() => setHoveredBtn('submitSignup')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{ ...styles.submitBtn, ...(hoveredBtn === 'submitSignup' ? styles.submitBtnHover : {}) }}
          >
            Sign up
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
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', margin: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { cursor: 'pointer', color: '#333' },
  mainContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px' },
  heading: { fontSize: '24px', marginBottom: '20px', color: '#111' },
  formBox: { backgroundColor: '#f3f3f3', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' },
  errorBanner: { backgroundColor: '#ffeef0', color: '#d9383a', padding: '10px 15px', borderRadius: '10px', fontSize: '14px', border: '1px solid #fccacf', fontWeight: 'bold', textAlign: 'center' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '14px', color: '#333' },
  input: { padding: '12px', borderRadius: '15px', border: '1px solid #ccc', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff' },
  submitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px', borderRadius: '20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s ease', fontWeight: 'bold' },
  submitBtnHover: { backgroundColor: '#d93a5f' },
  navBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', transition: 'background-color 0.2s ease' },
  btnHover: { backgroundColor: '#d93a5f' },
  divider: { border: 'none', height: '1px', backgroundColor: '#ccc', margin: '15px 0' },
  footerText: { textAlign: 'center', fontSize: '14px', color: '#555', marginBottom: '5px' },
  signUpLinkBtn: { color: '#f25278', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold', transition: 'color 0.2s ease' }
};

export default SignUpPage;
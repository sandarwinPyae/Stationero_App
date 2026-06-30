import React, { useState } from 'react';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone_number: formData.phoneNumber,
          address: formData.address,
          password: formData.password
        }),
      });
      if (response.ok) {
        alert('Sign up successful!');
      } else {
        alert('Sign up failed.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.logo}>Stationero</div>
        <nav style={styles.navLinks}>
          <span style={styles.link}>Home</span>
          <span style={styles.link}>About Us</span>
          <span style={styles.link}>Order</span>
          <button style={styles.loginBtn}>Login</button>
          <button style={styles.signUpNavBtn}>Sign Up</button>
        </nav>
      </header>

      {/* Main Form Box */}
      <main style={styles.mainContent}>
        <h2 style={styles.heading}>Sign up</h2>
        <form onSubmit={handleSubmit} style={styles.formBox}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}  style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}  style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone number</label>
            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}  style={styles.input} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange}  maxLength="100" style={styles.textarea} required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}  style={styles.passwordInput} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>👁️</button>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn}>Sign Up</button>
          <p style={styles.footerText}>Already have an account? <span style={styles.loginLink}>Log in</span></p>
        </form>
      </main>
    </div>
  );
};

const styles = {
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh', margin: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 50px', backgroundColor: '#fff' },
  logo: { color: '#f25278', fontSize: '24px', fontWeight: 'bold' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { cursor: 'pointer', color: '#333' },
  loginBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer' },
  signUpNavBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer' },
  mainContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' },
  heading: { fontSize: '24px', marginBottom: '20px', color: '#111' },
  formBox: { backgroundColor: '#f3f3f3', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative' },
  label: { fontSize: '14px', color: '#333' },
  input: { padding: '12px', borderRadius: '20px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' },
  textarea: { padding: '12px', borderRadius: '10px', border: '1px solid #ccc', fontSize: '14px', height: '80px', resize: 'none', outline: 'none' },
  charCount: { fontSize: '10px', color: '#999', textAlign: 'right', marginTop: '2px' },
  passwordWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '20px', paddingRight: '10px' },
  passwordInput: { flex: 1, padding: '12px', border: 'none', borderRadius: '20px', fontSize: '14px', outline: 'none' },
  eyeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  submitBtn: { backgroundColor: '#f25278', color: 'white', border: 'none', padding: '12px', borderRadius: '20px', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
  footerText: { textAlign: 'center', fontSize: '14px', color: '#333', marginTop: '10px' },
  loginLink: { color: '#f25278', cursor: 'pointer', textDecoration: 'underline' }
};

export default SignUp;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { StationeroNavbar } from './StationeroPage'; 
import { AuthProvider } from '../context/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('stationero_logged_user');
    let activeEmail = '';
    
    if (savedProfile && savedProfile !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedProfile);
        if (parsedUser) {
          activeEmail = (parsedUser.email || parsedUser.user_email || parsedUser.customer_email || '').trim();
        }
      } catch (e) {
        console.error("Failed to parse local storage profile tokens:", e);
      }
    }

    if (!activeEmail) {
      navigate('/login');
      return; 
    }

    axios.get(`http://localhost:8000/api/customer/profile/${activeEmail}`)
      .then(res => {
        const data = res.data; 
        setName(data.name || data.customer_name || 'New Customer');
        setEmail(data.email || data.customer_email || activeEmail);
        setPhone(data.phone || data.phone_number || '-');
        setAddress(data.address || '-');
      })
      .catch(err => {
        console.error("Error pulling database profile info:", err);
        setName('New Customer');
        setEmail(activeEmail);
        setPhone('-');
        setAddress('-');
      });
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/customer/profile/update', { 
        email, 
        name, 
        phone_number: phone, 
        address 
      });

      if (response.status === 200 || response.status === 201) {
        setIsEditing(false);
        const userObj = { name, email, phone, address, role: 'customer' };
        localStorage.setItem('stationero_logged_user', JSON.stringify(userObj));
      }
    } catch (error) {
      console.error(error);
      alert('Failed updating profile parameters.');
    }
  };

  return (
    <div style={styles.container}>
      <AuthProvider>
        <StationeroNavbar showSearch={false} />
      </AuthProvider>

      <main style={styles.mainContent}>
        <div style={styles.profileCard}>
          <h2 style={styles.heading}>Account Profile</h2>
          <form onSubmit={handleUpdateProfile} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} style={styles.inputField} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} style={styles.inputField} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} style={styles.inputField} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Home Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditing} style={styles.inputField} required />
            </div>
            <div style={styles.btnRow}>
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} style={styles.editBtn}>Edit Profile</button>
              ) : (
                <>
                  <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>Save Changes</button>
                </>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};


const styles = {
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#fafafa', minHeight: '100vh' },
  mainContent: { padding: '50px 20px', display: 'flex', justifyContent: 'center' },
  profileCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', width: '100%', maxWidth: '500px', border: '1px solid #f0f0f0' },
  heading: { fontSize: '22px', fontWeight: 'bold', marginBottom: '25px', color: '#111', borderBottom: '2px solid #fdf2f4', paddingBottom: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#555' },
  inputField: { padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', backgroundColor: '#fff' },
  btnRow: { display: 'flex', gap: '15px', marginTop: '10px', justifyContent: 'center' },
  editBtn: { backgroundColor: '#f25278', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', padding: '12px 25px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  saveBtn: { backgroundColor: '#48bb78', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }
};

export default ProfilePage;

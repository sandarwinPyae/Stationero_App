import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { StationeroNavbar } from './StationeroPage'; 
import { AuthProvider } from '../context/AuthContext';
import { AlignCenter } from 'lucide-react';

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
        <StationeroNavbar showSearch={false} />
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
  mainContent: { padding: '20px 12px', display: 'flex', justifyContent: 'center', boxSizing: 'border-box' },
  profileCard: { backgroundColor: '#fff', padding: '24px 16px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', width: '100%', maxWidth: '500px', border: '1px solid #f0f0f0', boxSizing: 'border-box' },
  heading: { fontSize: '25px', fontWeight: '400', marginBottom: '25px', color: '#111', paddingBottom: '10px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '15px', fontWeight: 200, color: '#555' },
  inputField: { padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '15px', outline: 'none', backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' },
  btnRow: { display: 'flex', gap: '15px', marginTop: '10px', justifyContent: 'center', flexWrap: 'wrap' },
  editBtn: { backgroundColor: '#f25278', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '240px' },
  cancelBtn: { backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', padding: '12px 25px', borderRadius: '25px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', flex: '1 1 120px' },
  saveBtn: { backgroundColor: '#f25278', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '25px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', flex: '1 1 120px' }
};


export default ProfilePage;

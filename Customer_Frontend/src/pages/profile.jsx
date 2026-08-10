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
        setEmail(data.email || data.customer_email || 'customer@gmail.com');
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
          <div style={styles.avatarRow}>
            <div style={styles.avatarCircleLarge}>
              {name ? name.trim().charAt(0).toUpperCase() : 'K'}
            </div>
          </div>
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
  container: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' },
  mainContent: { padding: window.innerWidth <= 768 ? '10px 8px' : '16px 12px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, width: '100%', boxSizing: 'border-box' },
  profileCard: { backgroundColor: '#ffffff', padding: window.innerWidth <= 768 ? '16px 16px' : '32px 40px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: '100%', maxWidth: '560px', border: '1px solid #f3f4f6', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: window.innerWidth <= 768 ? '12px' : '24px' },
  heading: { fontFamily: "'Poppins', sans-serif", fontSize: window.innerWidth <= 768 ? '18px' : '24px', fontWeight: '600', color: '#111827', margin: window.innerWidth <= 768 ? '0 0 4px 0' : '0 0 8px 0', textAlign: 'center' },
  avatarRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '0px', width: '100%' },
  avatarCircleLarge: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fdf2f4', color: '#f25278', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: '600', border: '3px solid #fff', boxShadow: '0 4px 10px rgba(242,82,120,0.15)' },
  profileGreetingRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', width: '100%' },
  inlineLabelText: { fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '500', color: '#4b5563', margin: 0 },
  inlineValueText: { fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: '600', color: '#f25278', margin: 0, textTransform: 'capitalize' },
  form: { display: 'flex', flexDirection: 'column', gap: window.innerWidth <= 768 ? '10px' : '20px', width: '100%' },
  inputGroup: { display: 'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems: window.innerWidth <= 768 ? 'stretch' : 'center', gap: window.innerWidth <= 768 ? '4px' : '16px', width: '100%', boxSizing: 'border-box' },
  label: { fontFamily: "'Poppins', sans-serif", fontSize: '13px', fontWeight: '500', color: '#4b5563', width: window.innerWidth <= 768 ? 'auto' : '140px', minWidth: window.innerWidth <= 768 ? 'auto' : '140px', textAlign: 'left', margin: 0 },
  inputField: { fontFamily: "'Poppins', sans-serif", padding: window.innerWidth <= 768 ? '8px 12px' : '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '15px', fontWeight: '500', outline: 'none', backgroundColor: '#ffffff', color: '#1f2937', flex: 1, boxSizing: 'border-box', width: '100%' },
  btnRow: { display: 'flex', gap: '12px', marginTop: '6px', justifyContent: window.innerWidth <= 768 ? 'stretch' : 'flex-end', width: '100%' },
  editBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: '#ffffff', border: 'none', padding: '12px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', width: '100%', outline: 'none' },
  cancelBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f3f4f6', color: '#4b5563', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', flex: window.innerWidth <= 768 ? 1 : 'none', outline: 'none' },
  saveBtn: { fontFamily: "'Poppins', sans-serif", backgroundColor: '#f25278', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer', flex: window.innerWidth <= 768 ? 1 : 'none', outline: 'none' }
};



export default ProfilePage;

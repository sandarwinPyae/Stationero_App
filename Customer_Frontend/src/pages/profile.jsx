import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { StationeroNavbar } from './StationeroPage'; 

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
        if (parsedUser) { activeEmail = (parsedUser.email || parsedUser.user_email || parsedUser.customer_email || '').trim(); }
      } catch (e) { console.error("Failed to parse local storage tokens:", e); }
    }
    if (!activeEmail) { navigate('/login'); return; }

    axios.get(`http://localhost:8000/api/customer/profile/${activeEmail}`)
      .then(res => {
        const data = res.data; 
        setName(data.name || data.customer_name || 'New Customer');
        setEmail(data.email || data.customer_email || 'customer@gmail.com');
        setPhone(data.phone || data.phone_number || '-');
        setAddress(data.address || '-');
      })
      .catch(err => {
        console.error(err);
        setName('New Customer'); setEmail(activeEmail);
      });
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/customer/profile/update', { email, name, phone_number: phone, address });
      if (response.status === 200 || response.status === 201) {
        setIsEditing(false);
        const userObj = { name, email, phone, address, role: 'customer' };
        localStorage.setItem('stationero_logged_user', JSON.stringify(userObj));
        window.location.reload();
      }
    } catch (error) { alert('Failed updating profile parameters.'); }
  };

  return (
    <div style={styles.container}>
      <StationeroNavbar showSearch={false} />
      <main style={styles.mainContent}>
        <div style={styles.profileCard}>
          <h2 style={styles.heading}>Account Profile</h2>
          <div style={styles.avatarRow}>
            <div style={styles.avatarCircleLarge}>{name ? name.trim().charAt(0).toUpperCase() : 'K'}</div>
          </div>
          
          <form onSubmit={handleUpdateProfile} style={styles.form}>
            <div style={isEditing ? styles.inputGroupEdit : styles.inputGroupView}>
              {isEditing && <label style={styles.label}>Full Name</label>}
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!isEditing} 
                style={{
                  ...styles.inputField,
                  fontWeight: isEditing ? '400' : '700',
                  fontSize: isEditing ? '14px' : '22px', 
                  textAlign: isEditing ? 'left' : 'center',
                  border: isEditing ? '1px solid #d1d5db' : 'none',
                  backgroundColor: isEditing ? '#ffffff' : 'transparent'
                }} required 
              />
            </div>

            {/* ၂။ Email Address Field Block */}
            <div style={isEditing ? styles.inputGroupEdit : styles.inputGroupView}>
              {isEditing && <label style={styles.label}>Email Address</label>}
              <input 
                type="text" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} 
                style={{
                  ...styles.inputField,
                  textAlign: isEditing ? 'left' : 'center',
                  border: isEditing ? '1px solid #d1d5db' : 'none',
                  backgroundColor: isEditing ? '#ffffff' : 'transparent',
                  fontSize: isEditing ? '14px' : '16px'
                }} required 
              />
            </div>

            {/* ၃။ Phone Number Field Block */}
            <div style={isEditing ? styles.inputGroupEdit : styles.inputGroupView}>
              {isEditing && <label style={styles.label}>Phone Number</label>}
              <input 
                type="text" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} 
                style={{
                  ...styles.inputField,
                  textAlign: isEditing ? 'left' : 'center',
                  border: isEditing ? '1px solid #d1d5db' : 'none',
                  backgroundColor: isEditing ? '#ffffff' : 'transparent',
                  fontSize: isEditing ? '14px' : '16px'
                }} required 
              />
            </div>

            {/* ၄။ Home Address Field Block */}
            <div style={isEditing ? styles.inputGroupEdit : styles.inputGroupView}>
              {isEditing && <label style={styles.label}>Home Address</label>}
              <input 
                type="text" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditing} 
                style={{
                  ...styles.inputField,
                  textAlign: isEditing ? 'left' : 'center',
                  border: isEditing ? '1px solid #d1d5db' : 'none',
                  backgroundColor: isEditing ? '#ffffff' : 'transparent',
                  fontSize: isEditing ? '14px' : '16px'
                }} required 
              />
            </div>

            {/* ၅။ ခလုတ်များ တည်ရှိရာနေရာ */}
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
  )
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fafafa' },
  mainContent: { display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', padding: '20px' },
  profileCard: { backgroundColor: '#ffffff', padding: '30px 24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '360px', boxSizing: 'border-box' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#333333', marginBottom: '20px', textAlign: 'center' },
  avatarRow: { display: 'flex', justifyContent: 'center', marginBottom: '25px' },
  avatarCircleLarge: { width: '85px', height: '85px', borderRadius: '50%', backgroundColor: '#f25278', color: '#ffffff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '32px', fontWeight: '700',boxShadow: '0 4px 12px rgba(242, 82, 120, 0.2)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroupView: { display: 'flex', flexDirection: 'column', gap: '0px', width: '100%', textAlign: 'center' },
  inputGroupEdit: { display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', textAlign: 'left' },
  label: { fontSize: '13px', fontWeight: '600', color: '#6b7280', fontFamily: "'Poppins', sans-serif" },
  inputField: { width: '100%', padding: '10px 12px', boxSizing: 'border-box', borderRadius: '6px', color: '#333333', fontFamily: "inherit", outline: 'none', transition: 'all 0.2s ease' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '10px', width: '100%' },
  editBtn: { width: '100%', padding: '11px', backgroundColor: '#f25278', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s ease' },
  saveBtn: { flex: 1, padding: '11px', backgroundColor: '#f25278', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '11px', backgroundColor: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
};

export default ProfilePage;


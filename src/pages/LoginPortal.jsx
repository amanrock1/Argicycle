import React, { useState } from 'react';

export default function LoginPortal({ onLoginSuccess, initialRole = 'farmer' }) {
  const [role, setRole] = useState(initialRole); // 'farmer' or 'mcd'
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up State
  const [fullName, setFullName] = useState('');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [farmerCrop, setFarmerCrop] = useState('Wheat');
  const [mcdWard, setMcdWard] = useState('Rohini');

  // Status logs
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const resetFormState = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setFullName('');
    setFarmerVillage('');
    setFarmerCrop('Wheat');
    setMcdWard('Rohini');
  };

  // Submit Handler for Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !password) {
      setErrorMsg("कृपया सभी विवरण भरें (Please fill all fields)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.role, data.token, data.user);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "लॉगिन विफल (Login failed)");
      }
    } catch (err) {
      console.warn("Auth server offline. Checking local storage mock.");
      // Fallback lookup from localStorage
      const users = JSON.parse(localStorage.getItem('agricycle_users') || '[]');
      const localMatch = users.find(u => u.role === role && u.username === username && u.password === password);
      
      if (localMatch) {
        onLoginSuccess(role, `mock-${role}-token-offline`, localMatch);
      } else {
        // Fallback default mock
        if (role === 'mcd' && username.toLowerCase() === 'admin@mcd.gov.in' && password === 'mcdadmin2026') {
          onLoginSuccess('mcd', 'mock-mcd-token', { name: 'MCD Officer (Offline)' });
        } else if (role === 'farmer' && username === '9876543210' && password === 'farmer4321') {
          onLoginSuccess('farmer', 'mock-farmer-token', { name: 'Ramesh Singh (Offline)', village: 'Sonipat' });
        } else {
          setErrorMsg(role === 'farmer' ? "अमान्य फोन या पासकोड (Incorrect phone/passcode)" : "Incorrect Email or Password");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Handler for Sign Up
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username || !password || !fullName) {
      setErrorMsg("कृपया सभी जानकारी दर्ज करें (Please fill all fields)");
      return;
    }

    setLoading(true);

    const details = role === 'farmer' 
      ? { village: farmerVillage, cropType: farmerCrop } 
      : { ward: mcdWard };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, username, password, name: fullName, details })
      });

      if (res.ok) {
        setSuccessMsg("पंजीकरण सफल! कृपया लॉगिन करें। (Signup successful! Please login.)");
        // Save current username and switch to login
        const registeredUsername = username;
        setMode('login');
        setUsername(registeredUsername);
        setPassword('');
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "पंजीकरण विफल (Registration failed)");
      }
    } catch (err) {
      console.warn("Auth server offline. Simulating registration locally.");
      
      // Save user to client localStorage for offline testing
      const users = JSON.parse(localStorage.getItem('agricycle_users') || '[]');
      const userExists = users.some(u => u.username === username);
      if (userExists) {
        setErrorMsg("This user is already registered locally.");
        setLoading(false);
        return;
      }

      const newUser = { role, username, password, name: fullName, ...details };
      users.push(newUser);
      localStorage.setItem('agricycle_users', JSON.stringify(users));

      setSuccessMsg("पंजीकरण सफल (Local Offline signup success)! Please login.");
      const registeredUsername = username;
      setMode('login');
      setUsername(registeredUsername);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Role Tabs */}
        <div className="auth-tabs">
          <button 
            onClick={() => { setRole('farmer'); resetFormState(); }}
            className={`auth-tab auth-tab-farmer ${role === 'farmer' ? 'active' : ''}`}
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: 'middle' }}>
                <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12c0-5.52 4.48-10 10-10z"></path>
                <path d="M12 22V12"></path>
                <path d="M12 12c2-2 4-2 6-4"></path>
                <path d="M12 16c-2-2-4-2-6-4"></path>
              </svg>
              <span>किसान पोर्टल<br />(Farmer Portal)</span>
            </span>
          </button>
          <button 
            onClick={() => { setRole('mcd'); resetFormState(); }}
            className={`auth-tab auth-tab-mcd ${role === 'mcd' ? 'active' : ''}`}
          >
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ verticalAlign: 'middle' }}>
                <path d="M4 19v-9h16v9M2 20h20M12 2L2 7h20L12 2z"></path>
                <path d="M8 14v3M12 14v3M16 14v3"></path>
              </svg>
              <span>MCD Officer<br />(Govt. Portal)</span>
            </span>
          </button>
        </div>

        <div className="auth-body">
          {/* Mode toggle link */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <span 
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              style={{ fontWeight: mode === 'login' ? '700' : '400', borderBottom: mode === 'login' ? `2px solid ${role === 'farmer' ? 'var(--color-primary)' : 'var(--color-secondary)'}` : 'none', cursor: 'pointer', paddingBottom: '0.25rem', color: mode === 'login' ? 'var(--color-text)' : 'var(--color-text-muted)' }}
            >
              लॉगिन (Login)
            </span>
            <span 
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              style={{ fontWeight: mode === 'signup' ? '700' : '400', borderBottom: mode === 'signup' ? `2px solid ${role === 'farmer' ? 'var(--color-primary)' : 'var(--color-secondary)'}` : 'none', cursor: 'pointer', paddingBottom: '0.25rem', color: mode === 'signup' ? 'var(--color-text)' : 'var(--color-text-muted)' }}
            >
              रजिस्टर (Sign Up)
            </span>
          </div>

          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-text)' }}>
            {mode === 'login' 
              ? (role === 'farmer' ? 'किसान लॉगिन द्वार (Farmer Log)' : 'Municipal Admin Verification')
              : (role === 'farmer' ? 'नया किसान खाता (Create Farmer Profile)' : 'Register Municipal Officer Account')
            }
          </h2>

          {successMsg && (
            <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #16A34A', padding: '0.75rem', color: '#166534', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #EF4444', padding: '0.75rem', color: '#991B1B', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>
                  {role === 'farmer' ? 'पंजीकृत मोबाइल नंबर (Mobile Number)' : 'Official Email ID'}
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder={role === 'farmer' ? '9876543210' : 'admin@mcd.gov.in'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  {role === 'farmer' ? 'गोपनीय पासकोड (Security Pin)' : 'Password'}
                </label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder={role === 'farmer' ? 'farmer4321' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className={`btn ${role === 'farmer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'सत्यापित किया जा रहा है...' : role === 'farmer' ? 'प्रवेश करें (Verify & Enter)' : 'Authorize Access'}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit}>
              <div className="form-group">
                <label>पूरा नाम (Full Name)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Ramesh Singh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  {role === 'farmer' ? 'मोबाइल नंबर (10-Digit Mobile Phone)' : 'Official Email ID'}
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder={role === 'farmer' ? 'e.g. 9876543210' : 'e.g. yourname@mcd.gov.in'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  {role === 'farmer' ? 'सुरक्षा पासकोड (Create Pin)' : 'Create Password'}
                </label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder={role === 'farmer' ? '4-Digit Pin' : 'Min 6 characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {role === 'farmer' ? (
                /* Farmer Specific inputs */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>गाँव का नाम (Village)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Sonipat"
                      value={farmerVillage}
                      onChange={(e) => setFarmerVillage(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>मुख्य फसल (Crop Type)</label>
                    <select 
                      className="form-control"
                      value={farmerCrop}
                      onChange={(e) => setFarmerCrop(e.target.value)}
                    >
                      <option value="Wheat">गेंहू (Wheat)</option>
                      <option value="Rice">धान (Rice)</option>
                      <option value="Sugarcane">गन्ना (Sugarcane)</option>
                      <option value="Mustard">सरसों (Mustard)</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* MCD Specific inputs */
                <div className="form-group">
                  <label>Assign Municipal Ward</label>
                  <select 
                    className="form-control"
                    value={mcdWard}
                    onChange={(e) => setMcdWard(e.target.value)}
                  >
                    <option value="Rohini">Rohini Ward</option>
                    <option value="Dwarka">Dwarka Ward</option>
                    <option value="Janakpuri">Janakpuri Ward</option>
                    <option value="Pitampura">Pitampura Ward</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className={`btn ${role === 'farmer' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'पंजीकरण किया जा रहा है...' : 'पंजीकरण पूरा करें (Register Account)'}
              </button>
            </form>
          )}

          {/* Hint Credentials details */}
          <div className="auth-hint-box">
            <strong>💡 Quick Login Credentials:</strong>
            {role === 'farmer' ? (
              <div style={{ marginTop: '0.25rem' }}>
                Phone: <code style={{ fontWeight: '700' }}>9876543210</code> | Pin: <code style={{ fontWeight: '700' }}>farmer4321</code>
              </div>
            ) : (
              <div style={{ marginTop: '0.25rem' }}>
                Email: <code style={{ fontWeight: '700' }}>admin@mcd.gov.in</code> | Pass: <code style={{ fontWeight: '700' }}>mcdadmin2026</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

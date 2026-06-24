import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import FarmerPortal from './pages/FarmerPortal';
import McdDashboard from './pages/McdDashboard';
import LoginPortal from './pages/LoginPortal';

export default function App() {
  const [page, setPage] = useState('landing'); // 'landing', 'farmer', 'mcd'

  // Auth tokens
  const [farmerToken, setFarmerToken] = useState(sessionStorage.getItem('farmerToken') || null);
  const [mcdToken, setMcdToken] = useState(sessionStorage.getItem('mcdToken') || null);
  const [currentUser, setCurrentUser] = useState(null);

  // Global Theme State (default: light / white background)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleGlobalTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Dynamic Fullstack State
  const [compostStock, setCompostStock] = useState(14250);
  const [alerts, setAlerts] = useState([
    "Rain expected tomorrow. Delay irrigation by 1 day. (कल बारिश की संभावना है। सिंचाई 1 दिन के लिए रोकें।)"
  ]);
  const [orders, setOrders] = useState([]);
  const [wards, setWards] = useState({
    Rohini: { wet: 62, dry: 38, dailyTons: 42, activeTrucks: 14, efficiency: 84 },
    Dwarka: { wet: 58, dry: 42, dailyTons: 35, activeTrucks: 12, efficiency: 91 },
    Janakpuri: { wet: 55, dry: 45, dailyTons: 28, activeTrucks: 9, efficiency: 79 },
    Pitampura: { wet: 66, dry: 34, dailyTons: 31, activeTrucks: 11, efficiency: 88 }
  });

  // Fetch state
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setCompostStock(data.compostStock);
        setOrders(data.orders);
        setAlerts(data.alerts);
        setWards(data.wards);
      }
    } catch (err) {
      console.warn("Express backend server offline. Using static local cache.", err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }, [theme]);

  // Auth Callbacks
  const handleLoginSuccess = (role, token, user) => {
    if (role === 'farmer') {
      setFarmerToken(token);
      sessionStorage.setItem('farmerToken', token);
    } else if (role === 'mcd') {
      setMcdToken(token);
      sessionStorage.setItem('mcdToken', token);
    }
    setCurrentUser(user);
  };

  const handleLogout = (role) => {
    if (role === 'farmer') {
      setFarmerToken(null);
      sessionStorage.removeItem('farmerToken');
    } else if (role === 'mcd') {
      setMcdToken(null);
      sessionStorage.removeItem('mcdToken');
    }
    setCurrentUser(null);
    setPage('landing');
  };

  // API Call: Create Compost Booking Order
  const handlePlaceOrder = async (farmer, village, crop, qty) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${farmerToken}`
        },
        body: JSON.stringify({ farmer, village, crop, qty })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders([data.order, ...orders]);
        setCompostStock(data.currentStock);
        return { success: true, price: qty * 4 };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error };
      }
    } catch (err) {
      if (qty > compostStock) return { success: false, error: "Stock limit exceeded" };
      const fallback = {
        id: `AC-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString(),
        farmer,
        village,
        crop,
        qty: parseInt(qty),
        price: qty * 4,
        status: 'Processing'
      };
      setOrders([fallback, ...orders]);
      setCompostStock(compostStock - qty);
      return { success: true, price: qty * 4, isFallback: true };
    }
  };

  // API Call: Cycle Shipping Status (MCD Portal)
  const handleCycleStatus = async (id) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, { 
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${mcdToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(orders.map(o => o.id === id ? data.order : o));
      }
    } catch (err) {
      setOrders(orders.map(o => {
        if (o.id === id) {
          const next = o.status === 'Processing' ? 'In Transit' : o.status === 'In Transit' ? 'Delivered' : 'Processing';
          return { ...o, status: next };
        }
        return o;
      }));
    }
  };

  // API Call: Change alerts advisory
  const handleBroadcastAlert = async (alertMessage) => {
    try {
      const res = await fetch('/api/alerts/broadcast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mcdToken}`
        },
        body: JSON.stringify({ alertMessage })
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
      }
    } catch (err) {
      setAlerts([alertMessage]);
    }
  };

  // API Call: Update Ward segregations
  const handleLogWard = async (wardName, wetTons, dryTons) => {
    try {
      const res = await fetch('/api/wards/log', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mcdToken}`
        },
        body: JSON.stringify({ wardName, wetTons, dryTons })
      });
      if (res.ok) {
        const data = await res.json();
        setWards({ ...wards, [wardName]: data.ward });
        setCompostStock(data.currentStock);
        return { success: true };
      }
    } catch (err) {
      console.error("Unable to log ward statistics", err);
    }
    return { success: false };
  };

  const handleFooterAction = (actionName) => {
    alert(`Thank you for your interest in "${actionName}". Our circular economy coordination team will reach out shortly!`);
  };

  return (
    <div className="app-wrapper">
      {/* Universal Header */}
      <header className="header">
        <div className="container nav-container">
          <div className="logo" onClick={() => setPage('landing')} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="logo-icon-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span style={{ fontWeight: '800', letterSpacing: '-0.03em', fontSize: '1.4rem', color: 'var(--color-text)' }}>
              Agri<span className="text-gradient">cycle</span>
            </span>
          </div>
          
          <ul className="nav-links">
            <li>
              <span className={`nav-link ${page === 'landing' ? 'active' : ''}`} onClick={() => setPage('landing')}>
                Home
              </span>
            </li>
            {page === 'landing' && (
              <>
                <li><a href="#problem" className="nav-link">Problems</a></li>
                <li><a href="#solution" className="nav-link">Solutions</a></li>
                <li><a href="#public-stats" className="nav-link">Public Stats</a></li>
                <li><a href="#how-it-works" className="nav-link">Journey</a></li>
              </>
            )}
            {page !== 'landing' && (
              <li>
                <a href="#public-stats" className="nav-link" onClick={() => setPage('landing')}>
                  Public Stats
                </a>
              </li>
            )}
            <li>
              <span className={`nav-link ${page === 'farmer' ? 'active' : ''}`} onClick={() => setPage('farmer')}>
                Farmer Portal
              </span>
            </li>
            <li>
              <span className={`nav-link ${page === 'mcd' ? 'active' : ''}`} onClick={() => setPage('mcd')}>
                MCD Dashboard
              </span>
            </li>
          </ul>

          <div className="nav-actions">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleGlobalTheme} 
              className="theme-toggle-btn"
              title={theme === 'light' ? 'Switch to Dark Cyber' : 'Switch to Light Theme'}
              style={{
                background: 'var(--bg-alt)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '2.25rem',
                height: '2.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text)',
                transition: 'all 0.3s ease',
                padding: 0,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>

            {page === 'farmer' && farmerToken && (
              <button onClick={() => handleLogout('farmer')} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Logout
              </button>
            )}
            {page === 'mcd' && mcdToken && (
              <button onClick={() => handleLogout('mcd')} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Logout
              </button>
            )}
            {!farmerToken && page !== 'farmer' && (
              <button onClick={() => setPage('farmer')} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Farmer Link
              </button>
            )}
            {!mcdToken && page !== 'mcd' && (
              <button onClick={() => setPage('mcd')} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                MCD Portal
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Pages Switcher */}
      <main>
        {page === 'landing' && (
          <LandingPage 
            setPage={setPage}
            compostStock={compostStock}
            orders={orders}
            alerts={alerts}
            wards={wards}
          />
        )}
        
        {page === 'farmer' && (
          !farmerToken ? (
            <LoginPortal onLoginSuccess={handleLoginSuccess} initialRole="farmer" />
          ) : (
            <FarmerPortal 
              orders={orders} 
              onPlaceOrder={handlePlaceOrder}
              compostStock={compostStock} 
              alerts={alerts}
            />
          )
        )}

        {page === 'mcd' && (
          !mcdToken ? (
            <LoginPortal onLoginSuccess={handleLoginSuccess} initialRole="mcd" />
          ) : (
            <McdDashboard 
              mcdToken={mcdToken}
              orders={orders} 
              onCycleStatus={handleCycleStatus}
              compostStock={compostStock} 
              alerts={alerts}
              onBroadcastAlert={handleBroadcastAlert}
              wards={wards}
              onLogWard={handleLogWard}
              theme={theme}
              toggleTheme={toggleGlobalTheme}
            />
          )
        )}
      </main>

      {/* Universal Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-quote">"Someone's Trash is Someone's Gold."</div>
              <p className="footer-tagline">
                Agricycle is building the future where cities and farms grow together, recycling landfill waste into organic agricultural fertilizer.
              </p>
            </div>
            
            <div>
              <h4 className="footer-links-title">Resources</h4>
              <ul className="footer-links">
                <li><span className="nav-link" onClick={() => setPage('landing')}>Home Page</span></li>
                <li><a href="#public-stats" className="nav-link" onClick={() => setPage('landing')}>Public Stats</a></li>
                <li><span className="nav-link" onClick={() => setPage('farmer')}>Farmer Portal</span></li>
                <li><span className="nav-link" onClick={() => setPage('mcd')}>MCD Dashboard</span></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-links-title">Engage</h4>
              <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>
                  <button className="btn btn-white" style={{ padding: '0.4rem 1rem', width: '100%' }} onClick={() => handleFooterAction('Contact Us')}>
                    Contact Us
                  </button>
                </li>
                <li>
                  <button className="btn btn-white" style={{ padding: '0.4rem 1rem', width: '100%' }} onClick={() => handleFooterAction('Partner With Us')}>
                    Partner With Us
                  </button>
                </li>
                <li>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', width: '100%' }} onClick={() => handleFooterAction('Join Agricycle')}>
                    Join Agricycle
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© 2026 Agricycle Platform. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

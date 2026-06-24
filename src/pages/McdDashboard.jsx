import React, { useState, useEffect } from 'react';

export default function McdDashboard({ mcdToken, orders, onCycleStatus, compostStock, alerts, onBroadcastAlert, wards, onLogWard, theme, toggleTheme }) {
  const [selectedWard, setSelectedWard] = useState('Rohini');
  const [wasteForm, setWasteForm] = useState({ wet: 5, dry: 3 });
  const [logSuccess, setLogSuccess] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const currentWard = wards[selectedWard] || { wet: 50, dry: 50, dailyTons: 0, activeTrucks: 0, efficiency: 0 };
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const wetOffset = circumference - (currentWard.wet / 100) * circumference;

  const fetchMatchmaking = async () => {
    try {
      const res = await fetch('/api/matchmaking', {
        headers: {
          'Authorization': `Bearer ${mcdToken}`
        }
      });
      if (res.ok) setMatchData(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchMatchmaking();
    const interval = setInterval(fetchMatchmaking, 5000);
    return () => clearInterval(interval);
  }, [orders]);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setLogSuccess('');
    const res = await onLogWard(selectedWard, wasteForm.wet, wasteForm.dry);
    if (res.success) {
      setLogSuccess(`✓ Logged ${parseFloat(wasteForm.wet) + parseFloat(wasteForm.dry)} tons for ${selectedWard} Ward.`);
      setWasteForm({ wet: 5, dry: 3 });
      setTimeout(() => setLogSuccess(''), 4000);
    }
  };

  const totalDistributed = orders.reduce((sum, o) => sum + o.qty, 0);
  const carbonSaved = (totalDistributed * 1.8).toFixed(1);
  const farmersServed = new Set(orders.map((o) => o.farmer)).size;
  const landfillTons = ((totalDistributed * 2.5) / 1000).toFixed(2);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'wards', label: 'Ward Monitoring' },
    { id: 'orders', label: `Orders (${orders.length})` },
    { id: 'broadcast', label: 'Broadcast Alert' },
  ];

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>

      {/* ── Header ───────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1A0F 0%, #0F2A1A 50%, #0A1A24 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '1.5rem 0 0',
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div className="warm-chip" style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
                <span className="live-dot"></span>
                MCD Delhi — Waste Operations Hub
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem',
                fontWeight: '800',
                color: '#F0EDE4',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}>
                Administration Dashboard
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'rgba(240,237,228,0.45)', marginTop: '0.25rem' }}>
                National Capital Territory of Delhi · Waste-to-Resource Command Centre
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={toggleTheme} style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.9rem',
                color: 'rgba(240,237,228,0.75)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                {theme === 'light' ? '🌙 Dark' : '☀ Light'}
              </button>
            </div>
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: '0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: activeTab === t.id ? '#52B788' : 'rgba(240,237,228,0.45)',
                  borderBottom: activeTab === t.id ? '2px solid #52B788' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Bar ──────────────────────────────────── */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
            {[
              { label: 'Landfill Diverted', value: `${landfillTons} T`, color: 'var(--color-secondary)', sub: 'organic waste redirected' },
              { label: 'Compost Stock', value: `${compostStock.toLocaleString()} kg`, color: 'var(--color-primary)', sub: 'ready in warehouse' },
              { label: 'Carbon Offset', value: `${carbonSaved} kg`, color: 'var(--color-primary)', sub: 'CO₂ equivalent' },
              { label: 'Farmers Served', value: `${farmersServed}`, color: 'var(--color-secondary)', sub: 'active subscriptions' },
            ].map((kpi, i) => (
              <div key={kpi.label} style={{
                padding: '1.25rem 1.5rem',
                borderRight: i < 3 ? '1px solid var(--border-color)' : 'none',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                  {kpi.label}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: '800', color: kpi.color, lineHeight: 1, marginBottom: '0.2rem' }}>
                  {kpi.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────── */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="mcd-grid">
            {/* Matchmaking Engine */}
            <div>
              <div className="mcd-card" style={{ borderTop: '3px solid var(--color-primary)', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.05rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Compost Matchmaking Engine
                  </span>
                  <span className="console-badge badge-forest">Auto-Routing</span>
                </h2>
                {matchData ? (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                      {matchData.recommendationSummary}
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="order-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Farmer</th>
                            <th>Crop</th>
                            <th>Demand</th>
                            <th>Score</th>
                            <th>Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchData.activeDemandMatch && matchData.activeDemandMatch.map((match) => (
                            <tr key={match.orderId}>
                              <td style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{match.orderId}</td>
                              <td>{match.farmer} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>({match.village})</span></td>
                              <td>{match.crop}</td>
                              <td>{match.requestedQty} kg</td>
                              <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{match.matchScore}%</td>
                              <td>
                                <span className={`console-badge ${match.priority.includes('HIGH') ? 'badge-amber' : 'badge-forest'}`}>
                                  {match.priority}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '1.5rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" className="animate-spin"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                    Calculating optimum fertilizer demand curves…
                  </div>
                )}
              </div>

              {/* Farmer orders table */}
              <div className="mcd-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.05rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Farmer Compost Orders
                  {orders.length > 0 && <span className="console-badge badge-forest" style={{ marginLeft: 'auto' }}>{orders.length} pending</span>}
                </h2>
                {orders.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No pending farmer requests.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Farmer</th>
                          <th>Village</th>
                          <th>Qty</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{o.id}</td>
                            <td>{o.farmer}</td>
                            <td style={{ color: 'var(--color-text-muted)' }}>{o.village}</td>
                            <td>{o.qty} kg</td>
                            <td>
                              <span className={`status-badge status-${o.status.toLowerCase() === 'delivered' ? 'delivered' : o.status.toLowerCase() === 'in transit' ? 'transit' : 'processing'}`}>
                                {o.status}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => onCycleStatus(o.id)}
                                className="btn btn-outline"
                                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                              >
                                Advance →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Segregation donut */}
              <div className="mcd-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.05rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l8 4"/></svg>
                  Segregation Ratio — <span style={{ color: 'var(--color-primary)' }}>{selectedWard}</span>
                </h2>
                <div className="chart-container-mcd">
                  <svg width="150" height="150" className="donut-svg">
                    <circle className="donut-circle donut-bg" cx="75" cy="75" r="50" />
                    <circle
                      className="donut-circle donut-fill-wet"
                      cx="75" cy="75" r="50"
                      strokeDasharray={circumference}
                      strokeDashoffset={wetOffset}
                    />
                    <text x="75" y="70" textAnchor="middle" style={{ fill: 'var(--color-text)', fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
                      {currentWard.wet}%
                    </text>
                    <text x="75" y="88" textAnchor="middle" style={{ fill: 'var(--color-text-muted)', fontSize: '9px', fontFamily: 'var(--font-body)' }}>
                      Wet waste
                    </text>
                  </svg>
                  <div style={{ marginLeft: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }}></span>
                      Wet Waste: <strong>{currentWard.wet}%</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-secondary)', flexShrink: 0 }}></span>
                      Dry Waste: <strong>{currentWard.dry}%</strong>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>Segregation efficiency</div>
                      <div className="console-bar-bg">
                        <div className="console-bar-fill" style={{ width: `${currentWard.efficiency}%` }}></div>
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', marginTop: '0.3rem' }}>
                        {currentWard.efficiency}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cleanliness leaderboard */}
              <div className="mcd-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.05rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a6 6 0 0 1 6 6c0 3.6-2 5.5-6 6-4-.5-6-2.4-6-6a6 6 0 0 1 6-6z"/></svg>
                  Cleanliness Leaderboard
                </h2>
                <div className="leaderboard-list">
                  {[
                    { rank: '1', ward: 'Dwarka', score: '91%' },
                    { rank: '2', ward: 'Pitampura', score: '88%' },
                    { rank: '3', ward: 'Rohini', score: '84%' },
                    { rank: '4', ward: 'Janakpuri', score: '79%' },
                  ].map(item => (
                    <div key={item.ward} className="leaderboard-item">
                      <span className={`leaderboard-rank rank-${item.rank === '4' ? 'other' : item.rank}`}>
                        {item.rank}
                      </span>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">{item.ward} Ward</div>
                      </div>
                      <div className="leaderboard-score">{item.score} seg.</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current broadcast */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(45,106,79,0.06) 0%, rgba(82,183,136,0.03) 100%)',
                border: '1px solid rgba(45,106,79,0.15)',
                borderLeft: '4px solid var(--color-primary-mid)',
                borderRadius: '0 0.75rem 0.75rem 0',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="live-dot amber-dot"></span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Active Farmer Broadcast
                  </span>
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-text)', lineHeight: 1.4 }}>
                  {alerts && alerts[0] ? alerts[0].split('(')[0].trim() : 'Normal weather. Continue regular irrigation.'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                  📲 Sent via WhatsApp & IVR · Switch in "Broadcast" tab
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WARD MONITORING TAB */}
        {activeTab === 'wards' && (
          <div>
            <div className="mcd-card" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
                Area-wise Waste Monitoring — click a ward to select
              </h2>
              <div className="delhi-map-grid">
                {Object.keys(wards).map((ward) => (
                  <div
                    key={ward}
                    onClick={() => setSelectedWard(ward)}
                    className={`map-area-card ${selectedWard === ward ? 'selected' : ''}`}
                  >
                    <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', fontWeight: '700' }}>{ward}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0.5rem' }}>
                      {wards[ward].dailyTons} T/day
                    </p>
                    <span className={`area-badge ${wards[ward].efficiency >= 85 ? 'badge-green-filled' : 'badge-yellow-filled'}`}>
                      {wards[ward].efficiency}% clean
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mcd-card">
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
                Log Daily Waste Collection — <span style={{ color: 'var(--color-primary)' }}>{selectedWard} Ward</span>
              </h3>
              {logSuccess && (
                <div style={{ background: '#DCFCE7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600' }}>
                  {logSuccess}
                </div>
              )}
              <form onSubmit={handleLogSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--color-text-muted)' }}>
                    Wet Waste (Tons)
                  </label>
                  <input
                    type="number" step="0.1"
                    className="form-control"
                    value={wasteForm.wet}
                    onChange={(e) => setWasteForm({ ...wasteForm, wet: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '0.3rem', color: 'var(--color-text-muted)' }}>
                    Dry Waste (Tons)
                  </label>
                  <input
                    type="number" step="0.1"
                    className="form-control"
                    value={wasteForm.dry}
                    onChange={(e) => setWasteForm({ ...wasteForm, dry: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                  Record Log
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="mcd-card">
            <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>All Farmer Compost Orders</h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                <p>No pending farmer requests at this time.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="order-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Farmer</th>
                      <th>Village</th>
                      <th>Crop</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{o.id}</td>
                        <td style={{ fontWeight: '600' }}>{o.farmer}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{o.village}</td>
                        <td>{o.crop}</td>
                        <td>{o.qty} kg</td>
                        <td>
                          <span className={`status-badge status-${o.status.toLowerCase() === 'delivered' ? 'delivered' : o.status.toLowerCase() === 'in transit' ? 'transit' : 'processing'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => onCycleStatus(o.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                          >
                            Advance →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BROADCAST ALERT TAB */}
        {activeTab === 'broadcast' && (
          <div style={{ maxWidth: '640px' }}>
            <div className="mcd-card">
              <h2 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>📡 Broadcast Irrigation Alert</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Select an advisory below. It will be sent immediately to all enrolled farmers
                via <strong>WhatsApp Business API</strong> and <strong>Twilio IVR</strong> calls.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  {
                    value: 'Rain expected tomorrow. Delay irrigation by 1 day. (कल बारिश की संभावना है। सिंचाई 1 दिन के लिए रोकें।)',
                    label: '🌧 Rain Warning — Delay irrigation by 1 day',
                    sub: 'कल बारिश की संभावना है',
                  },
                  {
                    value: 'Dry winds expected. Maintain moisture level by irrigating fields today. (शुष्क हवाएं चलेंगी। खेतों में नमी बनाए रखें।)',
                    label: '💨 Dry Wind Warning — Irrigate fields today',
                    sub: 'शुष्क हवाएं चलेंगी',
                  },
                  {
                    value: 'Normal weather. Continue regular irrigation. (मौसम सामान्य है। नियमित सिंचाई जारी रखें।)',
                    label: '☀ Normal Advisory — Continue regular schedule',
                    sub: 'मौसम सामान्य है',
                  },
                ].map((option) => {
                  const isActive = alerts[0] === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => onBroadcastAlert(option.value)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '1rem 1.25rem',
                        border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--border-color)'}`,
                        borderRadius: '0.75rem',
                        background: isActive ? 'rgba(45,106,79,0.06)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--color-text)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                            {option.label}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            {option.sub}
                          </div>
                        </div>
                        {isActive && (
                          <span className="console-badge badge-forest">Active</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem 1.25rem',
                background: 'var(--bg-alt)',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--color-text)' }}>Reach:</strong> All enrolled farmers in Haryana & Uttar Pradesh.
                Delivered in Hindi, Haryanvi, and Punjabi via WhatsApp + IVR calls within 2 minutes of broadcast.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

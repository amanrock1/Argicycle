import React, { useState, useEffect } from 'react';

export default function LandingPage({ setPage, compostStock, orders, alerts, wards }) {
  // Dynamic metrics calculations
  const totalDistributed = orders ? orders.reduce((sum, o) => sum + o.qty, 0) : 0;
  const carbonSaved = (totalDistributed * 1.8).toFixed(1);
  const landfillTons = ((totalDistributed * 2.5) / 1000).toFixed(2);
  const farmersCount = orders ? new Set(orders.map((o) => o.farmer)).size : 0;

  const sortedWards = wards ? Object.entries(wards)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.efficiency - a.efficiency) : [];

  // Historical / Milestones animation on mount
  const [compostKg, setCompostKg] = useState(0);
  const [farmersSupported, setFarmersSupported] = useState(0);
  const [landfillReduced, setLandfillReduced] = useState(0);
  const [inputCostReduction, setInputCostReduction] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCompostKg(Math.floor((10450 / steps) * currentStep));
      setFarmersSupported(Math.floor((520 / steps) * currentStep));
      setLandfillReduced(Math.floor((35 / steps) * currentStep));
      setInputCostReduction(Math.floor((25 / steps) * currentStep));

      if (currentStep >= steps) {
        clearInterval(timer);
        setCompostKg(10450);
        setFarmersSupported(520);
        setLandfillReduced(35);
        setInputCostReduction(25);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section section">
        <div className="container hero-grid">
          <div className="hero-content-left">
            {/* Warm chip instead of cold dev badge */}
            <div className="warm-chip">
              <span className="live-dot"></span>
              <span>Live Platform — Delhi NCR</span>
            </div>

            <span className="hero-eyebrow">Circular Economy in Action</span>

            <h1 className="hero-display-title">
              Turning City Trash<br />
              Into <span className="accent-word highlight-text-glow">Farmer's Gold</span>
            </h1>

            <div className="hero-description-block">
              <p className="hero-description-text">
                Agricycle bridges <strong>MCD Delhi</strong> and <strong>regional farmers</strong> — transforming kitchen waste into affordable organic compost, while cutting fertilizer costs by 55% and diverting tons from landfills.
              </p>
            </div>

            <div className="hero-ctas">
              <button onClick={() => setPage('farmer')} className="btn btn-primary btn-icon-right">
                Order Compost <span className="btn-arrow">→</span>
              </button>
              <button onClick={() => setPage('mcd')} className="btn btn-glass btn-icon-left">
                <span className="btn-prompt">⚙</span> MCD Dashboard
              </button>
            </div>
          </div>

          {/* Single clean console card instead of 3 floating widgets */}
          <div className="hero-visual-cluster" style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
            <div className="hero-console-card">
              {/* Mac-style header */}
              <div className="hero-console-header">
                <div className="console-dots">
                  <span className="console-dot console-dot-r"></span>
                  <span className="console-dot console-dot-y"></span>
                  <span className="console-dot console-dot-g"></span>
                </div>
                <span className="console-title">Agricycle Control Panel</span>
                <div className="console-live-badge">
                  <span className="live-dot" style={{ width: '5px', height: '5px' }}></span>
                  LIVE
                </div>
              </div>

              <div className="hero-console-body">
                {/* Compost stock row */}
                <div className="console-row">
                  <span className="console-row-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    Compost Stock
                  </span>
                  <span className="console-row-value console-val-green">
                    {compostStock ? compostStock.toLocaleString() : '14,250'} kg
                  </span>
                </div>

                {/* Active orders */}
                <div className="console-row">
                  <span className="console-row-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                    Active Orders
                  </span>
                  <span className="console-badge badge-forest">
                    {orders && orders.length > 0 ? orders.length : 4} orders
                  </span>
                </div>

                {/* Wards status */}
                <div className="console-row">
                  <span className="console-row-label">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    Delhi Wards Online
                  </span>
                  <span className="console-badge badge-forest">4 Active</span>
                </div>

                {/* Alert row */}
                <div className="console-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                  <span className="console-row-label">
                    <span className="live-dot amber-dot" style={{ width: '6px', height: '6px' }}></span>
                    Weather Advisory
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text)', fontWeight: '600', lineHeight: 1.3 }}>
                    {alerts && alerts[0] ? alerts[0].split('(')[0].trim() : 'Rain expected. Delay irrigation by 1 day.'}
                  </span>
                </div>

                {/* Progress bars */}
                <div className="console-progress-wrap">
                  <div className="console-progress-row">
                    <span className="console-progress-label">Avg Ward Segregation Efficiency</span>
                    <span className="console-progress-num">85%</span>
                  </div>
                  <div className="console-bar-bg">
                    <div className="console-bar-fill" style={{ width: '85%' }}></div>
                  </div>
                  <div className="console-progress-row" style={{ marginTop: '0.5rem' }}>
                    <span className="console-progress-label">Carbon Credits Registered</span>
                    <span className="console-progress-num" style={{ color: 'var(--color-accent)' }}>ACTIVE</span>
                  </div>
                  <div className="console-bar-bg">
                    <div className="console-bar-fill console-bar-fill-amber" style={{ width: '72%' }}></div>
                  </div>
                </div>

                {/* Compost price callout */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'linear-gradient(135deg, rgba(45,106,79,0.06) 0%, rgba(233,196,106,0.04) 100%)', border: '1px solid rgba(45,106,79,0.15)', borderRadius: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Compost price</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>₹4/kg</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: '0.4rem', textDecoration: 'line-through' }}>₹9 urea</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section section" id="problem">
        <div className="blur-blob blur-blob-green" style={{ top: '10%', left: '-5%', width: '300px', height: '300px' }}></div>
        <div className="blur-blob blur-blob-cyan" style={{ bottom: '10%', right: '-5%', width: '350px', height: '350px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-8">
            <div className="warm-chip" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>01 — The Challenge</div>
            <h2 className="section-h2-display">A Tale of Two Crises</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '580px', margin: '0 auto', fontSize: '1.05rem' }}>
              While Delhi drowns in 11,000 tons of daily waste, farmers 200 km away struggle with unaffordable fertilizers and failing wells.
            </p>
          </div>

          <div className="split-layout">
            {/* Farmers Section */}
            <div className="split-card">
              <div className="problem-section-header">
                <div className="problem-icon-box icon-box-green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                </div>
                <h3 className="split-title-farmer" style={{ marginBottom: 0 }}>India's Farmers</h3>
              </div>
              <ul className="problem-list">
                <li>
                  <span className="problem-icon-red">✕</span>
                  <span><strong>Rising Input Costs:</strong> Chemical fertilizers inflate every season, crushing already-thin margins.</span>
                </li>
                <li>
                  <span className="problem-icon-red">✕</span>
                  <span><strong>Irrigation Guesswork:</strong> Unpredictable monsoons drain groundwater and cause crop failure.</span>
                </li>
                <li>
                  <span className="problem-icon-red">✕</span>
                  <span><strong>Soil Degradation:</strong> Chemical overuse depletes carbon, shortening the productive life of farmland.</span>
                </li>
              </ul>
              <div className="stats-grid">
                <div className="big-stat-box">
                  <div className="big-stat-number green">30%+</div>
                  <div className="big-stat-label">Fertilizer Inflation (YoY)</div>
                </div>
                <div className="big-stat-box">
                  <div className="big-stat-number green">54%</div>
                  <div className="big-stat-label">Wells Depleting Fast</div>
                </div>
              </div>
            </div>

            {/* Cities Section */}
            <div className="split-card">
              <div className="problem-section-header">
                <div className="problem-icon-box icon-box-teal">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18M3 7V5a2 2 0 012-2h3a2 2 0 012 2v2M3 11h18M3 15h18M3 19h18"/></svg>
                </div>
                <h3 className="split-title-city" style={{ marginBottom: 0 }}>Municipal Corporations</h3>
              </div>
              <ul className="problem-list">
                <li>
                  <span className="problem-icon-red">✕</span>
                  <span><strong>Landfill Overflow:</strong> Delhi generates 11,000 tonnes of waste daily — and landfills are full.</span>
                </li>
                <li>
                  <span className="problem-icon-red">✕</span>
                  <span><strong>Poor Segregation:</strong> Wet and dry waste get mixed, making organic processing nearly impossible.</span>
                </li>
                <li>
                  <span className="problem-icon-red">✕</span>
                  <span><strong>Mounting Penalties:</strong> High dumping costs and carbon emission taxes with no sustainable outlet.</span>
                </li>
              </ul>
              <div className="stats-grid">
                <div className="big-stat-box">
                  <div className="big-stat-number teal">11k T</div>
                  <div className="big-stat-label">Daily Waste in Delhi</div>
                </div>
                <div className="big-stat-box">
                  <div className="big-stat-number teal">60%</div>
                  <div className="big-stat-label">Is Organic Waste</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="section" id="solution" style={{ overflow: 'hidden' }}>
        <div className="blur-blob blur-blob-cyan" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)', width: '450px', height: '450px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-8">
            <div className="warm-chip" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>02 — What We Built</div>
            <h2 className="section-h2-display">Six Ways We Close the Loop</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
              Every feature connects city supply chains with farm-level demand — no hardware, no middlemen.
            </p>
          </div>

          <div className="grid-3">
            {/* Feature 1 */}
            <div className="solution-card">
              <div className="solution-icon-container icon-bg-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h3>Smart Irrigation Alerts</h3>
              <p>Farmers receive granular, hyper-local water forecasts via automated IVR calls and WhatsApp alerts based on satellite data.</p>
              <div className="solution-highlight">
                "Rain expected. Delay irrigation by 1 day."
              </div>
            </div>

            {/* Feature 2 */}
            <div className="solution-card">
              <div className="solution-icon-container icon-bg-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              </div>
              <h3>Affordable Compost Access</h3>
              <p>High-grade organic compost sourced from city kitchen waste, packed and shipped via farming cooperatives at 40% lesser price.</p>
              <div className="solution-highlight">
                ₹4 per kg vs ₹9 for urea/NPK.
              </div>
            </div>

            {/* Feature 3 */}
            <div className="solution-card">
              <div className="solution-icon-container icon-bg-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
              <h3>Zero-Hardware Waste Tracking</h3>
              <p>No expensive GPS/sensors needed. Workers log waste collection metrics per ward using zero-rate mobile forms.</p>
              <div className="solution-highlight highlight-blue">
                Live dashboard updates via simple forms.
              </div>
            </div>

            {/* Feature 4 */}
            <div className="solution-card">
              <div className="solution-icon-container icon-bg-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </div>
              <h3>Segregation Monitoring</h3>
              <p>Aggregates wet vs dry waste ratios to spot wards neglecting source segregation, backing local MCD policy changes.</p>
              <div className="solution-highlight highlight-blue">
                Incentive systems for top wards.
              </div>
            </div>

            {/* Feature 5 */}
            <div className="solution-card">
              <div className="solution-icon-container icon-bg-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
              </div>
              <h3>Unified Impact Dashboard</h3>
              <p>Real-time calculators showing landfill tons averted, carbon credits stored in soils, and local farmers helped.</p>
              <div className="solution-highlight">
                Audited calculations for green bonds.
              </div>
            </div>

            {/* Feature 6 */}
            <div className="solution-card">
              <div className="solution-icon-container icon-bg-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </div>
              <h3>Matchmaking Engine</h3>
              <p>Predictive model matches regional farm cropping cycles and fertilizer demand with MCD compost inventory levels.</p>
              <div className="solution-highlight highlight-blue">
                Prevents stockouts during peak sowing seasons.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Stats Section */}
      <section className="section" id="public-stats" style={{ backgroundColor: 'var(--bg-alt)', overflow: 'hidden' }}>
        <div className="blur-blob blur-blob-green" style={{ top: '5%', right: '0', width: '350px', height: '350px' }}></div>
        <div className="blur-blob blur-blob-cyan" style={{ bottom: '5%', left: '0', width: '350px', height: '350px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-8">
            <div className="warm-chip" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>03 — Real-Time Impact</div>
            <h2 className="section-h2-display">Live Environmental Pulse</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
              Every kg of compost delivered is a kg of landfill waste saved. Watch the numbers update in real time.
            </p>
          </div>

          {/* Active Irrigation Broadcast Advice */}
          <div className="broadcast-alert-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <span className="live-dot amber-dot"></span>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Active Farmer Broadcast
              </h3>
            </div>
            <p style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--color-text)', fontFamily: 'var(--font-heading)', lineHeight: 1.4 }}>
              {alerts && alerts[0] ? alerts[0].split('(')[0].trim() : 'Rain expected tomorrow. Delay irrigation by 1 day.'}
            </p>
            {alerts && alerts[0] && alerts[0].includes('(') && (
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                {alerts[0].match(/\(([^)]+)\)/)?.[1] || ''}
              </p>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              Sent via WhatsApp &amp; IVR to all enrolled farmers • Updated from meteorological feeds
            </p>
          </div>

          {/* Live Counters Grid */}
          <div className="stats-grid mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="public-stat-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Landfill Reduction</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-stat-primary)', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                  {landfillTons} Tons
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                Organic waste diverted from landfills
              </p>
            </div>

            <div className="public-stat-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Compost Stock Balance</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-stat-secondary)', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                  {compostStock ? compostStock.toLocaleString() : '14,200'} kg
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                Ready for distribution in warehouse
              </p>
            </div>

            <div className="public-stat-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Carbon Sequestration</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58-1 8.9A6.99 6.99 0 0 1 11 20z"></path>
                    <path d="M19 2a22 22 0 0 1-13 14"></path>
                  </svg>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-stat-primary)', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                  {parseFloat(carbonSaved || '2880.0').toFixed(1)} kg
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                CO₂ equivalent emissions offset
              </p>
            </div>

            <div className="public-stat-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Farmers Impacted</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-stat-secondary)', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                  {farmersCount || 4} farmers
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                Active crop health subscriptions
              </p>
            </div>
          </div>

          {/* Cleanliness Leaderboard & Citizen Guide split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            
            {/* Leaderboard Card */}
            <div className="premium-split-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--bg-alt)', paddingBottom: '0.75rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                  <path d="M12 2a6 6 0 0 1 6 6c0 3.6-2 5.5-6 6-4-.5-6-2.4-6-6a6 6 0 0 1 6-6z"></path>
                </svg>
                Cleanliness Rank
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Wards ranked by wet vs dry waste source segregation efficiency. Segregating wet waste allows compost production.
              </p>
              <div className="leaderboard-list">
                {sortedWards.length > 0 ? (
                  sortedWards.map((ward, index) => (
                    <div key={ward.name} className="leaderboard-item" style={{ padding: '0.75rem 1rem' }}>
                      <span className={`leaderboard-rank rank-${index + 1}`}>
                        {index + 1}
                      </span>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">{ward.name} Ward</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <div className="stock-bar-container" style={{ flexGrow: 1, height: '0.25rem', marginBottom: 0 }}>
                            <div className="stock-bar-fill fill-primary" style={{ width: `${ward.efficiency}%` }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{ward.efficiency}% seg.</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="leaderboard-item" style={{ padding: '0.75rem 1rem' }}>
                      <span className="leaderboard-rank rank-1">1</span>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">Dwarka Ward</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <div className="stock-bar-container" style={{ flexGrow: 1, height: '0.25rem', marginBottom: 0 }}>
                            <div className="stock-bar-fill fill-primary" style={{ width: '91%' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>91% seg.</span>
                        </div>
                      </div>
                    </div>
                    <div className="leaderboard-item" style={{ padding: '0.75rem 1rem' }}>
                      <span className="leaderboard-rank rank-2">2</span>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">Pitampura Ward</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <div className="stock-bar-container" style={{ flexGrow: 1, height: '0.25rem', marginBottom: 0 }}>
                            <div className="stock-bar-fill fill-primary" style={{ width: '88%' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>88% seg.</span>
                        </div>
                      </div>
                    </div>
                    <div className="leaderboard-item" style={{ padding: '0.75rem 1rem' }}>
                      <span className="leaderboard-rank rank-3">3</span>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">Rohini Ward</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <div className="stock-bar-container" style={{ flexGrow: 1, height: '0.25rem', marginBottom: 0 }}>
                            <div className="stock-bar-fill fill-primary" style={{ width: '84%' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>84% seg.</span>
                        </div>
                      </div>
                    </div>
                    <div className="leaderboard-item" style={{ padding: '0.75rem 1rem' }}>
                      <span className="leaderboard-rank rank-other">4</span>
                      <div className="leaderboard-info">
                        <div className="leaderboard-name">Janakpuri Ward</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <div className="stock-bar-container" style={{ flexGrow: 1, height: '0.25rem', marginBottom: 0 }}>
                            <div className="stock-bar-fill fill-primary" style={{ width: '79%' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>79% seg.</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Citizen Guide Card */}
            <div className="premium-split-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '2px solid var(--bg-alt)', paddingBottom: '0.75rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Citizen Segregation Guide
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#DCFCE7', color: '#15803D', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.9rem' }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>Separate Wet Kitchen Waste</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Place vegetable peels, fruits leftovers, and tea bags in the <strong>Green Dustbin</strong>. We process this organic matter into farming compost.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.9rem' }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>Keep Recyclables Dry</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      Place clean papers, dry cardboard packaging, plastic bottles, and tin cans in the <strong>Blue Dustbin</strong> to preserve clean recycling lines.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#FEF3C7', color: '#D97706', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.9rem' }}>
                    3
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>Empower Local Farms</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      By separating at source, you ensure organic fractions don't get contaminated, supplying premium soil carbon to crop growers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="problem-section section" id="how-it-works" style={{ overflow: 'hidden' }}>
        <div className="blur-blob blur-blob-green" style={{ top: '15%', right: '10%', width: '280px', height: '280px' }}></div>
        <div className="blur-blob blur-blob-cyan" style={{ bottom: '15%', left: '5%', width: '280px', height: '280px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-8">
            <div className="warm-chip" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>04 — The Journey</div>
            <h2 className="section-h2-display">From Bin to Harvest: 7 Steps</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
              A city citizen's kitchen scraps become a farmer's fertilizer in days, not decades.
            </p>
          </div>

          <div className="timeline-container">
            <div className="timeline-line"></div>

            <div className="timeline-item">
              <div className="timeline-dot">1</div>
              <div className="timeline-content">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Citizens Segregate
                </h3>
                <p>Wet kitchen waste is separated from dry paper/plastic waste at households.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">2</div>
              <div className="timeline-content">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  Collection Logs
                </h3>
                <p>Municipal sanitation trucks collect wet waste separately and log volumes into Agricycle.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">3</div>
              <div className="timeline-content">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                    <path d="M2 20h20"></path>
                    <path d="M5 17V7l7 4V7l7 4v6"></path>
                  </svg>
                  Composting Facility
                </h3>
                <p>Organic waste undergoes aerobic decomposition at regional facilities to create high-carbon compost.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">4</div>
              <div className="timeline-content">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                  </svg>
                  Inventory Sync
                </h3>
                <p>Compost bags are quality-certified, barcode-scanned, and loaded onto the central catalog.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">5</div>
              <div className="timeline-content">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12c0-5.52 4.48-10 10-10z"></path>
                    <path d="M12 22V12"></path>
                    <path d="M12 12c2-2 4-2 6-4"></path>
                    <path d="M12 16c-2-2-4-2-6-4"></path>
                  </svg>
                  Farmer Ordering
                </h3>
                <p>Farmers place orders on the catalog based on crop nutrition plans via Web or local MCD cooperatives.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">6</div>
              <div className="timeline-content">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                  Cooperative Delivery
                </h3>
                <p>Consolidated trucks transport compost loads directly to rural distribution points.</p>
              </div>
            </div>

            <div className="timeline-item">
              <div className="timeline-dot">7</div>
              <div className="timeline-content">
                <h3>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                  Bumper Harvest
                </h3>
                <p>Farmers apply nutrient-rich organic compost, saving costs and harvesting premium crops for the city.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section section">
        <div className="container">
          <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(233, 196, 106, 0.12)', border: '1px solid rgba(233, 196, 106, 0.25)', color: '#E9C46A', padding: '0.35rem 0.9rem', borderRadius: '2rem', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>05 — Milestones</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '2.75rem', lineHeight: '1.15', letterSpacing: '-0.025em', color: 'white', marginBottom: '1rem' }}>Numbers That Matter</h2>
            <p style={{ color: 'rgba(240, 237, 228, 0.65)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
              Tracking carbon sequestration and landfill diversion across North India — in real time.
            </p>
          </div>
          <div className="impact-grid">
            <div className="impact-stat">
              <div className="impact-number">{compostKg.toLocaleString()}+ Kg</div>
              <div className="impact-label">Compost Recycled</div>
              <div className="impact-desc">Diverted from city landfill blocks</div>
            </div>
            <div className="impact-stat">
              <div className="impact-number">{farmersSupported}+</div>
              <div className="impact-label">Farmers Supported</div>
              <div className="impact-desc">Across Haryana & Uttar Pradesh</div>
            </div>
            <div className="impact-stat">
              <div className="impact-number">{landfillReduced}%</div>
              <div className="impact-label">Landfill Reduction</div>
              <div className="impact-desc">Average drop in municipal dump mass</div>
            </div>
            <div className="impact-stat">
              <div className="impact-number">{inputCostReduction}%</div>
              <div className="impact-label">Cost Reduction</div>
              <div className="impact-desc">Saved by farmers on fertilizer bills</div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="section" id="tech-stack">
        <div className="container text-center">
          <div className="warm-chip" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>06 — Built With</div>
          <h2 className="section-h2-display">Lightweight by Design</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
            Optimized for government dashboards, low-bandwidth rural access, and zero-hardware deployment.
          </p>
          <div className="tech-grid">
            <div className="tech-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)"></ellipse>
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"></ellipse>
                <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"></ellipse>
                <circle cx="12" cy="12" r="2" fill="var(--color-primary)"></circle>
              </svg>
              React 19 & Vite
              <span className="tech-badge badge-green">Frontend</span>
            </div>
            <div className="tech-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
              Firebase / Firestore
              <span className="tech-badge badge-green">Real-time DB</span>
            </div>
            <div className="tech-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03345 19.1769 5.09355 19.4357 5.01168 19.6749C4.85627 20.129 4.77114 20.6133 4.77114 21.1167C4.77114 21.6063 5.1681 22 5.65768 22H12Z"></path>
                <circle cx="7.5" cy="10.5" r="1" fill="var(--color-primary)"></circle>
                <circle cx="11.5" cy="7.5" r="1" fill="var(--color-primary)"></circle>
                <circle cx="16.5" cy="9.5" r="1" fill="var(--color-primary)"></circle>
                <circle cx="15.5" cy="14.5" r="1" fill="var(--color-primary)"></circle>
              </svg>
              CSS Custom Tokens
              <span className="tech-badge badge-green">Styling</span>
            </div>
            <div className="tech-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              WhatsApp Business API
              <span className="tech-badge badge-blue">Alert Engine</span>
            </div>
            <div className="tech-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Twilio IVR
              <span className="tech-badge badge-blue">Offline Access</span>
            </div>
            <div className="tech-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Responsive SVG Charts
              <span className="tech-badge badge-dark">Analytics</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

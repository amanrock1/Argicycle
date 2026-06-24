import React from 'react';

export default function PublicDashboard({ compostStock, orders, alerts, wards }) {
  // Calculations
  const totalDistributed = orders.reduce((sum, o) => sum + o.qty, 0);
  const carbonSaved = (totalDistributed * 1.8).toFixed(1);
  const landfillTons = ((totalDistributed * 2.5) / 1000).toFixed(2);
  const farmersCount = new Set(orders.map((o) => o.farmer)).size;

  // Leaderboard sorting
  const sortedWards = Object.entries(wards)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.efficiency - a.efficiency);

  return (
    <div style={{ backgroundColor: 'var(--bg-alt)', minHeight: '80vh', paddingBottom: '4rem' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-primary-hover) 0%, var(--color-dark-green) 100%)', color: 'white', padding: '3.5rem 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
            Public Environmental Impact Hub
          </h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            Real-time environmental metrics displaying how household waste recycling directly supports local farming communities.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        {/* Active Irrigation Alerts */}
        <div style={{ backgroundColor: '#F0FDF4', borderLeft: '6px solid var(--color-primary)', borderRadius: '0.75rem', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" style={{ flexShrink: 0 }}><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-dark-green)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Irrigation Broadcast Advice
            </h3>
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--color-text)' }}>
            "{alerts[0] || 'Regular watering schedules recommended.'}"
          </p>
        </div>

        {/* Live Counters */}
        <div className="stats-grid mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div className="farmer-card" style={{ marginBottom: 0, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Landfill Reduction</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                {landfillTons} Tons
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              Organic waste collected at houses and recycled, preventing methane buildup in landfills.
            </p>
          </div>

          <div className="farmer-card" style={{ marginBottom: 0, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Carbon Sequestration</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                {parseFloat(carbonSaved).toLocaleString()} kg
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              CO₂ equivalent emissions prevented by replacing chemical nitrogen with organic carbon compost.
            </p>
          </div>

          <div className="farmer-card" style={{ marginBottom: 0, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Compost Stock Balance</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--color-secondary)', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                {compostStock.toLocaleString()} kg
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              High-carbon organic compost cured and ready for delivery to farming cooperatives.
            </p>
          </div>

          <div className="farmer-card" style={{ marginBottom: 0, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Farmers Supported</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zm14 14v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: '800', color: 'var(--color-secondary)', fontFamily: 'var(--font-heading)', lineHeight: '1.1' }}>
                {farmersCount} Farmers
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
              Active growers receiving soil nourishment and irrigation forecasting guidelines.
            </p>
          </div>
        </div>

        {/* Dynamic Leaderboard & Citizen Education Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', marginTop: '3rem' }}>
          
          {/* Leaderboard Card */}
          <div className="farmer-card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-alt)', paddingBottom: '0.75rem' }}>
              Cleanliness Leaderboard
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Wards ranked by wet vs dry waste source segregation efficiency. Segregating wet waste allows compost production.
            </p>
            <div className="leaderboard-list">
              {sortedWards.map((ward, index) => (
                <div key={ward.name} className="leaderboard-item" style={{ padding: '1rem' }}>
                  <span className={`leaderboard-rank rank-${index + 1}`}>
                    {index + 1}
                  </span>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">{ward.name} Ward</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <div className="stock-bar-container" style={{ flexGrow: 1, height: '0.25rem', marginBottom: 0 }}>
                        <div className="stock-bar-fill fill-primary" style={{ width: `${ward.efficiency}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{ward.efficiency}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Guide Card */}
          <div className="farmer-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-alt)', paddingBottom: '0.75rem' }}>
              Citizen Segregation Guide: How to help
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ backgroundColor: '#DCFCE7', color: '#15803D', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyStyle: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700' }}>
                  1
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>Separate your Wet Kitchen Waste</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Place vegetable peels, fruit remnants, tea bags, leftover food, and eggshells into your **Green Dustbin**. This is organic matter which our composting plants cure into agricultural compost.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyStyle: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700' }}>
                  2
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>Keep Recyclables Dry</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Place papers, dry cardboard box packages, clean plastic containers, glass bottles, and tin cans into the **Blue Dustbin**. Keeping them dry preserves their recycling qualities.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ backgroundColor: '#FEF3C7', color: '#D97706', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyStyle: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700' }}>
                  3
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-text)', marginBottom: '0.25rem' }}>Empower Local Farmers</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    By segregating at home, you ensure the waste collection trucks don't receive contaminated organic mixes. Cleaner waste translates directly into healthier soil compost for our crop farmers.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

export default function FarmerPortal({ orders, onPlaceOrder, compostStock, alerts }) {
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    cropType: 'Wheat',
    quantity: 100
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name || !formData.village || !formData.quantity) {
      setErrorMsg('कृपया सभी जानकारी भरें — Please fill in all fields.');
      return;
    }

    const qty = parseInt(formData.quantity);
    if (qty > compostStock) {
      setErrorMsg(`गोदाम में केवल ${compostStock} kg स्टॉक बचा है। Only ${compostStock} kg remaining in stock.`);
      return;
    }

    const res = await onPlaceOrder(formData.name, formData.village, formData.cropType, qty);
    if (res.success) {
      setSuccessMsg(`बुकिंग सफल! ₹${res.price} में ${qty} kg खाद बुक हुई। Village: ${formData.village}`);
      setFormData({ name: '', village: '', cropType: 'Wheat', quantity: 100 });
    } else {
      setErrorMsg(res.error || 'Order could not be placed. Please try again.');
    }
  };

  const cropEmoji = { Wheat: '🌾', Rice: '🌾', Sugarcane: '🎋', Mustard: '🌻', Vegetables: '🥬' };
  const totalOrdered = orders.reduce((s, o) => s + o.qty, 0);

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>

      {/* ── Hero Banner ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0D2618 0%, #1A3A1A 40%, #1A2808 100%)',
        padding: '3rem 0 2.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background texture dots */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(82,183,136,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
          background: 'radial-gradient(ellipse at right, rgba(233,196,106,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              {/* Warm chip */}
              <div className="warm-chip" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                <span className="live-dot amber-dot"></span>
                🌱 किसान सुविधा पोर्टल
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#F0EDE4',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '0.6rem',
              }}>
                Farmer's Compost Booking
              </h1>
              <p style={{ color: 'rgba(240,237,228,0.60)', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.6 }}>
                Order organic city compost at <strong style={{ color: '#E9C46A' }}>₹4/kg</strong> — over 55% cheaper than urea.
                Weather-based irrigation advice sent directly to your phone.
              </p>
            </div>

            {/* Live stock badge */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderTop: '2px solid rgba(233,196,106,0.5)',
              borderRadius: '1rem',
              padding: '1.25rem 1.75rem',
              textAlign: 'center',
              minWidth: '160px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'rgba(233,196,106,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                गोदाम स्टॉक
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '800', color: '#52B788', lineHeight: 1 }}>
                {compostStock.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,237,228,0.5)', marginTop: '0.2rem' }}>kg available</div>
              {totalOrdered > 0 && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'rgba(233,196,106,0.7)' }}>
                  {totalOrdered} kg already ordered
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Irrigation Alert Bar ─────────────────────── */}
      {alerts && alerts[0] && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(45,106,79,0.08) 0%, rgba(233,196,106,0.04) 100%)',
          borderBottom: '1px solid var(--border-color)',
          borderTop: '1px solid var(--border-color)',
          padding: '0.85rem 0',
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="live-dot amber-dot"></span>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              आज की सिंचाई सलाह
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-text)' }}>
              {alerts[0].split('(')[0].trim()}
            </span>
            {alerts[0].includes('(') && (
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                {alerts[0].match(/\(([^)]+)\)/)?.[1]}
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              📲 WhatsApp &amp; IVR
            </span>
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────── */}
      <div className="container section">
        <div className="farmer-grid">

          {/* ── Left Column: Compost Store + Form ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Compost product card */}
            <div className="farmer-card" style={{ borderTop: '3px solid var(--color-primary)', padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div className="problem-icon-box icon-box-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700' }}>
                  खाद बाजार — Organic Compost Store
                </h2>
              </div>

              <div className="market-item" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
                <div className="market-details">
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', fontWeight: '700', marginBottom: '0.3rem' }}>
                    Agricycle Premium Compost
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>
                    100% organic · sourced from Delhi kitchen waste · high carbon content
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="console-badge badge-forest">✓ Certified Organic</span>
                    <span className="console-badge badge-amber">↓ 55% Cheaper than Urea</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {compostStock.toLocaleString()} kg in stock
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end' }}>
                  <div className="market-price" style={{ fontFamily: 'var(--font-display)' }}>
                    ₹4 <span>/ kg</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#999', textDecoration: 'line-through' }}>₹9/kg (urea)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                    Save ₹5 per kg
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="farmer-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <div className="problem-icon-box icon-box-teal">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: '700' }}>
                  खाद बुकिंग — Book Your Supply
                </h2>
              </div>

              {/* Success */}
              {successMsg && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(45,106,79,0.08) 0%, rgba(82,183,136,0.05) 100%)',
                  border: '1px solid rgba(45,106,79,0.25)',
                  borderLeft: '4px solid var(--color-primary)',
                  padding: '1rem 1.25rem',
                  borderRadius: '0 0.75rem 0.75rem 0',
                  marginBottom: '1.5rem',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                }}>
                  ✓ {successMsg}
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div style={{
                  background: '#FFF3F3',
                  border: '1px solid #FECACA',
                  borderLeft: '4px solid #EF4444',
                  padding: '1rem 1.25rem',
                  borderRadius: '0 0.75rem 0.75rem 0',
                  marginBottom: '1.5rem',
                  color: '#991B1B',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}>
                  ⚠ {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    किसान का नाम <span style={{ color: 'var(--color-text-muted)', fontWeight: '400' }}>— Farmer's Full Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g. Ramesh Singh"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    गाँव / क्षेत्र <span style={{ fontWeight: '400' }}>— Village or Society Name</span>
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="e.g. Sonipat Ward-3, Haryana"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                      फसल <span style={{ fontWeight: '400' }}>— Crop Type</span>
                    </label>
                    <select
                      name="cropType"
                      value={formData.cropType}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="Wheat">🌾 गेहूं — Wheat</option>
                      <option value="Rice">🌾 धान — Paddy / Rice</option>
                      <option value="Sugarcane">🎋 गन्ना — Sugarcane</option>
                      <option value="Mustard">🌻 सरसों — Mustard</option>
                      <option value="Vegetables">🥬 सब्जियां — Vegetables</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                      मात्रा <span style={{ fontWeight: '400' }}>— Quantity (kg)</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="50"
                      max="10000"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Price preview */}
                {formData.quantity > 0 && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(45,106,79,0.05) 0%, rgba(233,196,106,0.04) 100%)',
                    border: '1px solid rgba(45,106,79,0.15)',
                    borderRadius: '0.75rem',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      {cropEmoji[formData.cropType] || '🌱'} {formData.quantity} kg × ₹4
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: '800', color: 'var(--color-primary)', lineHeight: 1 }}>
                        ₹{(formData.quantity * 4).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        vs ₹{(formData.quantity * 9).toLocaleString()} urea
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                  बुकिंग की पुष्टि करें — Confirm Compost Booking →
                </button>
              </form>
            </div>
          </div>

          {/* ── Right Column: Orders + Helpline ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Order history */}
            <div className="farmer-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <div className="problem-icon-box icon-box-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700' }}>
                  मेरी बुकिंग्स — My Orders
                </h2>
                {orders.length > 0 && (
                  <span className="console-badge badge-forest" style={{ marginLeft: 'auto' }}>
                    {orders.length} orders
                  </span>
                )}
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                  <p style={{ fontSize: '0.9rem' }}>No orders yet. Place your first compost booking above.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="order-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Qty</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: '600', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{o.id}</td>
                          <td>{o.qty} kg</td>
                          <td>
                            <span className={`status-badge status-${o.status.toLowerCase() === 'delivered' ? 'delivered' : o.status.toLowerCase() === 'in transit' ? 'transit' : 'processing'}`}>
                              {o.status === 'Processing' ? 'प्रोसेसिंग' : o.status === 'In Transit' ? 'रास्ते में' : 'पहुंच गया'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Savings calculator */}
            {totalOrdered > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(45,106,79,0.06) 0%, rgba(82,183,136,0.03) 100%)',
                border: '1px solid rgba(45,106,79,0.15)',
                borderRadius: '1rem',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                  💰 Your Savings vs Chemical Urea
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                      ₹{(totalOrdered * 5).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total saved</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-secondary)' }}>
                      {totalOrdered} kg
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Total ordered</div>
                  </div>
                </div>
              </div>
            )}

            {/* Helpline card */}
            <div style={{
              background: 'linear-gradient(135deg, #0D2618 0%, #1A2808 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0, width: '60%', height: '100%',
                background: 'radial-gradient(ellipse at right, rgba(233,196,106,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'rgba(240,237,228,0.9)', marginBottom: '0.4rem', position: 'relative', zIndex: 1 }}>
                📞 किसान सहायता — Helpline
              </h3>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: '800', color: '#E9C46A', marginBottom: '0.3rem', position: 'relative', zIndex: 1 }}>
                1800-419-7220
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,228,0.5)', lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
                Toll-free · Open 24/7<br />
                Hindi • Haryanvi • Punjabi
              </p>
            </div>

            {/* How compost helps */}
            <div className="farmer-card" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-alt)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                जैविक खाद के फायदे
              </div>
              {[
                ['🌱', 'Improves soil carbon & water retention'],
                ['📉', 'Cuts fertilizer cost by up to 55%'],
                ['🌾', 'Increases yield by 15–20% in 2 seasons'],
                ['♻️', 'Diverts Delhi waste from landfills'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '0.6rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ flexShrink: 0 }}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Wallet, 
  Plus, 
  LogOut, 
  Bell, 
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2
} from 'lucide-react';

/* --- Core App Component --- */
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  // App Data State
  const [shifts, setShifts] = useState([]);
  const [vault, setVault] = useState([]);
  const [docs, setDocs] = useState([]);
  const [vaultId, setVaultId] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('sm_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setShifts(JSON.parse(localStorage.getItem(`sm_shifts_${u.email}`) || '[]'));
      setDocs(JSON.parse(localStorage.getItem(`sm_docs_${u.email}`) || '[]'));
      setVaultId(localStorage.getItem(`sm_vault_id_${u.email}`));
      setVault(JSON.parse(localStorage.getItem(`sm_vault_data_${u.email}`) || '[]'));
    }
    setLoading(false);
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('sm_user', JSON.stringify(u));
    setShifts(JSON.parse(localStorage.getItem(`sm_shifts_${u.email}`) || '[]'));
    setDocs(JSON.parse(localStorage.getItem(`sm_docs_${u.email}`) || '[]'));
    setVaultId(localStorage.getItem(`sm_vault_id_${u.email}`));
    setVault(JSON.parse(localStorage.getItem(`sm_vault_data_${u.email}`) || '[]'));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sm_user');
    setActiveTab('home');
  };

  const connectVault = (id) => {
    setVaultId(id);
    localStorage.setItem(`sm_vault_id_${user.email}`, id);
  };

  const addShifts = (batch) => {
    setShifts(prev => {
      const batchDays = batch.map(b => b.day);
      const filtered = prev.filter(s => !batchDays.includes(s.day));
      const updated = [...filtered, ...batch.map(s => ({ ...s, id: Math.random() }))];
      localStorage.setItem(`sm_shifts_${user.email}`, JSON.stringify(updated));
      return updated;
    });
    setModal(null);
  };

  const addTxn = (t) => {
    const newVault = [{ ...t, id: Date.now(), date: new Date().toLocaleDateString() }, ...vault];
    setVault(newVault);
    localStorage.setItem(`sm_vault_data_${user.email}`, JSON.stringify(newVault));
    setModal(null);
  };

  const removeTxn = (id) => {
    const newVault = vault.filter(v => v.id !== id);
    setVault(newVault);
    localStorage.setItem(`sm_vault_data_${user.email}`, JSON.stringify(newVault));
  };

  const addDoc = (d) => {
    const newDocs = [...docs, { ...d, id: Date.now() }];
    setDocs(newDocs);
    localStorage.setItem(`sm_docs_${user.email}`, JSON.stringify(newDocs));
    setModal(null);
  };

  const clearVault = () => {
    setVault([]);
    localStorage.setItem(`sm_vault_data_${user.email}`, '[]');
  };

  if (loading) return null;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      
      <main className="main-scroll">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Dashboard key="home" shifts={shifts} vault={vault} docs={docs} vaultId={vaultId} onNavToVault={() => setActiveTab('vault')} />}
          {activeTab === 'shifts' && <Shifts key="shifts" shifts={shifts} onAdd={() => setModal('shift')} />}
          {activeTab === 'vault' && <Vault key="vault" txns={vault} onAdd={() => setModal('vault')} onRemove={removeTxn} vaultId={vaultId} onConnect={connectVault} onClear={clearVault} />}
          {activeTab === 'docs' && <Documents key="docs" docs={docs} onAdd={() => setModal('doc')} />}
        </AnimatePresence>
      </main>

      <Navigation active={activeTab} setActive={setActiveTab} />

      {/* Global Modals */}
      <AnimatePresence>
        {modal === 'shift' && <AddShiftModal onAdd={addShifts} onClose={() => setModal(null)} />}
        {modal === 'vault' && <AddVaultModal onAdd={addTxn} onClose={() => setModal(null)} />}
        {modal === 'doc' && <AddDocModal onAdd={addDoc} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </>
  );
}

/* --- Sub Components --- */

const Header = ({ user, onLogout }) => (
  <header style={{ padding: '24px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), #059669)', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', boxShadow: '0 8px 16px -4px var(--primary-glow)', fontSize: '18px' }}>
        {user.name[0]}
      </div>
      <div>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Welcome, Mate</span>
        <h3 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>{user.name}</h3>
      </div>
    </div>
    <div style={{ display: 'flex', gap: '10px' }}>
      <motion.button whileTap={{ scale: 0.9 }} className="glass-card" style={{ padding: '10px', borderRadius: '14px', border: '1px solid var(--border-bright)', color: 'var(--text-muted)' }}>
        <Bell size={22} />
      </motion.button>
      <motion.button whileTap={{ scale: 0.9 }} className="glass-card" style={{ padding: '10px', borderRadius: '14px', border: '1px solid var(--border-bright)', color: 'var(--danger)' }} onClick={onLogout}>
        <LogOut size={22} />
      </motion.button>
    </div>
  </header>
);

const Navigation = ({ active, setActive }) => (
  <nav style={{ position: 'fixed', bottom: '16px', left: '16px', right: '16px', height: '76px', background: 'rgba(25, 30, 45, 0.85)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-bright)', borderRadius: '24px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: '100', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
    {[
      { id: 'home', icon: Home, label: 'Home' },
      { id: 'shifts', icon: Calendar, label: 'Shifts' },
      { id: 'vault', icon: Wallet, label: 'Vault' },
      { id: 'docs', icon: FileText, label: 'Legal' },
    ].map((tab) => (
      <motion.button 
        key={tab.id}
        onClick={() => setActive(tab.id)}
        whileTap={{ scale: 0.85 }}
        style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: active === tab.id ? 'var(--primary)' : 'var(--text-dim)', transition: 'var(--transition)', width: '60px' }}
      >
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <tab.icon size={active === tab.id ? 26 : 24} style={{ transition: 'var(--transition)' }} />
          {active === tab.id && (
            <motion.div layoutId="nav-bg" style={{ position: 'absolute', width: '40px', height: '40px', background: 'var(--primary-glow)', borderRadius: '12px', zIndex: -1 }} />
          )}
        </div>
        <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tab.label}</span>
      </motion.button>
    ))}
  </nav>
);

const AuthScreen = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const submit = () => {
    if (!formData.email || !formData.password) return;
    onLogin({ name: formData.name || 'User', email: formData.email });
  };

  return (
    <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--primary), #059669)', borderRadius: '24px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900', color: 'var(--bg-dark)', boxShadow: '0 20px 40px -10px var(--primary-glow)' }}>S</motion.div>
        <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px' }}>Shift<span>Mate</span> 2.0</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '8px', fontWeight: '500' }}>Kuwait's Employee Hub</p>
      </div>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '32px 24px' }}>
        <AnimatePresence mode="wait">
          {isSignup && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px', display: 'block', fontWeight: '700' }}>FULL NAME</label>
              <input 
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '16px', borderRadius: '14px', color: 'white', outline: 'none', transition: 'var(--transition)' }}
                placeholder="Ex. Ahmed Salem"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px', display: 'block', fontWeight: '700' }}>EMAIL ADDRESS</label>
          <input 
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '16px', borderRadius: '14px', color: 'white', outline: 'none' }}
            placeholder="mate@kuwait.com"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '6px', display: 'block', fontWeight: '700' }}>SECURE PASSWORD</label>
          <input 
            type="password"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '16px', borderRadius: '14px', color: 'white', outline: 'none' }}
            placeholder="••••••••"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={submit}
          style={{ width: '100%', background: 'var(--primary)', color: 'var(--bg-dark)', padding: '18px', borderRadius: '16px', border: 'none', fontWeight: '900', marginTop: '12px', cursor: 'pointer', fontSize: '16px', boxShadow: '0 10px 20px -5px var(--primary-glow)' }}
        >
          {isSignup ? 'Begin My Journey' : 'Login to Vault'}
        </motion.button>
      </div>

      <button 
        onClick={() => setIsSignup(!isSignup)}
        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '14px', marginTop: '32px', cursor: 'pointer', fontWeight: '700' }}
      >
        {isSignup ? 'Already a Shiftmate? Login' : "New here? Create your profile"}
      </button>
    </div>
  );
};

/* --- Module: Dashboard --- */
const Dashboard = ({ shifts, vault, docs, vaultId, onNavToVault }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentShift = shifts[shifts.length - 1] || { type: 'off', title: 'No Shift', time: 'Relax Today' };
  
  const getBalance = () => {
    const total = vault.reduce((acc, t) => acc + (parseFloat(t.amt) || 0), 0);
    return total.toFixed(3);
  };
  
  const urgentDocs = docs.filter(d => d.daysLeft < 60).length;

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fade-in">
      <div className="heading-row">
        <h2 className="page-title">Over<span>view</span></h2>
        <div style={{ color: 'var(--secondary)', fontSize: '11px', fontWeight: '950', background: 'var(--secondary-glow)', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--secondary)', letterSpacing: '1px' }}>{dateStr}</div>
      </div>

      <div className="glass-card" style={{ marginBottom: '28px', background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.1), rgba(0,0,0,0))', border: '1px solid var(--border-bright)', padding: '32px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '16px' }}>Current Station</span>
        <h1 style={{ fontSize: '72px', fontWeight: '950', letterSpacing: '-4px', margin: '12px 0', textShadow: '0 10px 40px rgba(0,212,170,0.2)', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center' }}>
          <div style={{ padding: '6px 14px', borderRadius: '24px', background: currentShift.type === 'off' ? 'rgba(255,255,255,0.05)' : 'var(--primary-glow)', color: currentShift.type === 'off' ? 'var(--text-muted)' : 'var(--primary)', fontSize: '11px', fontWeight: '900', border: '1px solid' }}>● {currentShift.title.toUpperCase()}</div>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>{currentShift.time}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {vaultId ? (
          <StatCard label="Unit Vault" value={getBalance()} sub="KWD" color="var(--secondary)" />
        ) : (
          <motion.div onClick={onNavToVault} whileTap={{ scale: 0.95 }} className="glass-card" style={{ border: '1px solid var(--primary)', background: 'var(--primary-glow)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
             <Wallet size={20} color="var(--primary)" />
             <span style={{ fontSize: '11px', fontWeight: '950', color: 'var(--primary)', textAlign: 'center' }}>LINK STATION</span>
          </motion.div>
        )}
        <StatCard label="Legal Status" value={urgentDocs > 0 ? "Warning" : "Secure"} sub={urgentDocs > 0 ? `${urgentDocs} Urgent` : "No Expiry"} color={urgentDocs > 0 ? "var(--danger)" : "var(--primary)"} />
      </div>

      <h3 style={{ fontSize: '13px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '900', letterSpacing: '1.5px' }}>Critical Alerts</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {docs.length === 0 && (
           <AlertItem icon="🎖️" title="Setup Digital Vault" desc="Track your Civil ID & Passport status." />
        )}
        {docs.map(d => (
           <AlertItem key={d.id} icon="📑" title={d.title} desc={`Expires in ${d.daysLeft} days`} urgent={d.daysLeft < 60} />
        ))}
      </div>
    </motion.div>
  );
};

/* --- Module: Shifts --- */
const Shifts = ({ shifts, onAdd }) => {
  const getWeekDates = () => {
    const now = new Date();
    const sun = new Date(now);
    sun.setDate(now.getDate() - now.getDay()); // Sunday is 0
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      const foundShift = shifts.find(s => s.day === dayName);
      
      return { 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        fullName: dayName,
        date: d.getDate(),
        dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: d.toDateString() === now.toDateString(),
        shift: foundShift
      };
    });
  };

  const week = getWeekDates();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fade-in">
      <div className="heading-row">
        <h2 className="page-title">Weekly <span>Roster</span></h2>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onAdd} style={{ background: 'var(--secondary)', border: 'none', padding: '12px', borderRadius: '16px', boxShadow: '0 12px 24px -6px var(--secondary-glow)' }}>
          <Plus size={28} color="var(--bg-dark)" />
        </motion.button>
      </div>

      <div className="glass-card" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', padding: '24px 16px', border: '2px solid rgba(255,255,255,0.02)' }}>
        {week.map((day, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: day.isToday ? 'var(--secondary)' : 'var(--text-dim)', fontWeight: '900', textTransform: 'uppercase' }}>{day.name}</span>
            <motion.div whileTap={{ scale: 0.8 }} style={{ width: '42px', height: '42px', borderRadius: '16px', background: day.isToday ? 'var(--secondary)' : 'rgba(255,255,255,0.03)', border: day.isToday ? 'none' : '1px solid var(--border)', color: day.isToday ? 'var(--bg-dark)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '950', fontSize: '16px' }}>
              {day.date}
            </motion.div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {week.map((day, i) => {
          const s = day.shift;
          return (
            <div key={i} className="glass-card" style={{ display: 'flex', padding: '20px 24px', gap: '20px', alignItems: 'center', borderLeft: `6px solid ${s ? (s.type === 'morning' ? 'var(--primary)' : 'var(--secondary)') : 'var(--border)'}`, opacity: s ? 1 : 0.4 }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {s ? (s.type === 'morning' ? '☀️' : s.type === 'evening' ? '🌙' : s.type === 'night' ? '🌃' : '🛌') : '⚪'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '17px', fontWeight: '950', letterSpacing: '-0.5px' }}>{s ? s.title : 'Unassigned'}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: day.isToday ? 'var(--secondary)' : 'var(--text-dim)', fontWeight: '950' }}>{day.dateLabel}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>{day.fullName}</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '700', marginTop: '2px' }}>{s ? s.time : 'Assign weekly shift'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

/* --- Module: Vault --- */
const Vault = ({ txns, onAdd, onRemove, vaultId, onConnect }) => {
  const [joinCode, setJoinCode] = useState('');
  
  // Strict validation for vaultId
  const isVaultActive = vaultId && vaultId !== 'null' && vaultId !== 'undefined' && vaultId.length === 6;

  if (!isVaultActive) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in" style={{ padding: '40px 0', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--primary-glow)', borderRadius: '24px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={40} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '950', letterSpacing: '-1px' }}>Vault <span>Access</span></h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '8px', fontWeight: '600', padding: '0 40px' }}>Securely track shared expenses with your roommates.</p>
        
        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
             <h4 style={{ fontSize: '13px', fontWeight: '950', color: 'var(--primary)', marginBottom: '12px', textTransform: 'uppercase' }}>Join Roommate Vault</h4>
             <input 
               style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '16px', borderRadius: '16px', color: 'white', textAlign: 'center', fontSize: '20px', fontWeight: '950', letterSpacing: '4px', outline: 'none' }}
               placeholder="000 000"
               maxLength={6}
               onChange={(e) => setJoinCode(e.target.value)}
             />
             <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => joinCode.length === 6 && onConnect(joinCode)}
               style={{ width: '100%', background: 'var(--primary)', color: 'var(--bg-dark)', padding: '16px', borderRadius: '14px', border: 'none', fontWeight: '950', marginTop: '16px' }}
             >
               Interlink Vault
             </motion.button>
          </div>

          <div style={{ position: 'relative', margin: '16px 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)' }}></div>
            <span style={{ position: 'relative', background: '#0D111A', padding: '0 16px', color: 'var(--text-dim)', fontSize: '12px', fontWeight: '900' }}>OR</span>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => onConnect(Math.floor(100000 + Math.random() * 900000).toString())}
            style={{ width: '100%', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', padding: '20px', borderRadius: '24px', fontWeight: '950', fontSize: '16px' }}
          >
            Forge New Shared Vault
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const getBalance = () => {
    const total = txns.reduce((acc, t) => acc + (parseFloat(t.amt) || 0), 0);
    return total.toFixed(3);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="fade-in">
      <div className="heading-row">
        <div>
          <h2 className="page-title">Unit <span>Vault</span></h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '950', letterSpacing: '1px' }}>ID: {vaultId}</span>
            <button onClick={() => onConnect(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', padding: '2px 4px', border: '1px solid var(--border)', borderRadius: '4px', opacity: 0.5 }}>Unlink</button>
            <button onClick={() => confirm('Clear all vault data?') && onClear()} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', padding: '2px 4px', border: '1px solid var(--danger)', borderRadius: '4px', opacity: 0.5 }}>Settle Up</button>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onAdd} style={{ background: 'var(--primary)', border: 'none', padding: '12px', borderRadius: '16px', boxShadow: '0 12px 24px -6px var(--primary-glow)' }}>
          <Plus size={28} color="var(--bg-dark)" />
        </motion.button>
      </div>

      <div className="glass-card" style={{ marginBottom: '32px', background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1), rgba(0,0,0,0))', border: '1px solid var(--primary-glow)', padding: '32px 24px' }}>
         <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px' }}>Net Unit Currency</span>
         <h1 style={{ fontSize: '48px', fontWeight: '950', margin: '12px 0', letterSpacing: '-2px' }}>{getBalance()} <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-dim)' }}>KWD</span></h1>
         <div style={{ height: '4px', width: '40px', background: 'var(--primary)', borderRadius: '2px', marginTop: '16px' }}></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {txns.map((t) => (
          <div key={t.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: t.amt.startsWith('-') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.amt.startsWith('-') ? 'var(--danger)' : 'var(--success)', border: '1px solid' }}>
              {t.amt.startsWith('-') ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '900' }}>{t.desc}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '800' }}>{t.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '17px', fontWeight: '950', color: t.amt.startsWith('-') ? 'var(--danger)' : 'var(--success)' }}>{t.amt}</div>
              <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px', opacity: 0.2 }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* --- Module: Documents --- */
const Documents = ({ docs, onAdd }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="fade-in">
    <div className="heading-row">
      <h2 className="page-title">Digital <span>Vault</span></h2>
      <motion.button whileTap={{ scale: 0.9 }} onClick={onAdd} style={{ background: 'var(--secondary)', border: 'none', padding: '12px', borderRadius: '16px' }}>
        <Plus size={28} color="var(--bg-dark)" />
      </motion.button>
    </div>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
       {docs.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '64px 24px', borderStyle: 'dashed', background: 'transparent' }}>
            <FileText size={40} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p style={{ color: 'var(--text-dim)', fontWeight: '700' }}>Secure your legal identity. Add a document.</p>
          </div>
       ) : (
         docs.map(d => (
           <DocItem key={d.id} title={d.title} expiry={d.expiry} days={d.daysLeft} progress={d.progress} color={d.daysLeft < 60 ? 'var(--danger)' : 'var(--secondary)'} />
         ))
       )}
    </div>
  </motion.div>
);

/* --- Helpers --- */
const StatCard = ({ label, value, sub, color }) => (
  <div className="glass-card" style={{ border: `1px solid ${color}40`, background: `linear-gradient(135deg, ${color}05, transparent)` }}>
    <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '950', letterSpacing: '1px' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
       <h2 style={{ fontSize: '26px', fontWeight: '950', color, letterSpacing: '-1px' }}>{value}</h2>
       <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '900' }}>{sub}</span>
    </div>
  </div>
);

const AlertItem = ({ icon, title, desc, urgent }) => (
  <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', border: urgent ? '1px solid var(--danger)' : '1px solid var(--border-bright)', padding: '20px 24px', background: urgent ? 'rgba(255, 77, 77, 0.08)' : 'var(--bg-card)' }}>
    <div style={{ fontSize: '32px' }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <h4 style={{ fontSize: '16px', fontWeight: '950', letterSpacing: '-0.3px' }}>{title}</h4>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>{desc}</p>
    </div>
    <ChevronRight size={20} color="var(--text-dim)" />
  </div>
);

const DocItem = ({ title, expiry, days, progress, color }) => (
  <div className="glass-card" style={{ padding: '28px', borderLeft: `6px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: '950', letterSpacing: '-0.5px' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: '800' }}>EXPIRE: {expiry}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '28px', fontWeight: '950', color, letterSpacing: '-1px' }}>{days}</div>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '950' }}>Days Remaining</div>
      </div>
    </div>
    <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', position: 'relative', overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: progress + '%' }} transition={{ duration: 1 }} style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: color, boxShadow: `0 0 20px ${color}` }} />
    </div>
  </div>
);

/* --- Modals --- */
const ModalOverlay = ({ title, onClose, children }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(30px)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 35, stiffness: 450 }} style={{ width: '100%', background: '#0D111A', borderTop: '2px solid var(--secondary)', borderRadius: '48px 48px 0 0', padding: '48px 24px 40px', maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <div style={{ width: '48px', height: '5px', background: 'var(--border)', borderRadius: '3px', margin: '-24px auto 32px' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '28px', fontWeight: '950', letterSpacing: '-1.5px' }}>{title}</h3>
        <motion.button whileTap={{ scale: 0.8 }} onClick={onClose} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-dim)', width: '44px', height: '44px', borderRadius: '50%', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</motion.button>
      </div>
      {children}
    </motion.div>
  </div>
);

const AddShiftModal = ({ onAdd, onClose }) => {
  const types = ['Morning', 'Evening', 'Night', 'Off'];
  const times = { 'Morning': '08:00 - 16:00', 'Evening': '14:00 - 22:00', 'Night': '22:00 - 06:00', 'Off': 'Full Day Rest' };
  
  const getWeekDates = () => {
    const now = new Date();
    const sun = new Date(now);
    sun.setDate(now.getDate() - now.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      return { 
        day: d.toLocaleDateString('en-US', { weekday: 'long' }),
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  };

  const week = getWeekDates();

  const [weeklyPlan, setWeeklyPlan] = useState({
    Sunday: 'Morning', Monday: 'Morning', Tuesday: 'Morning',
    Wednesday: 'Morning', Thursday: 'Morning', Friday: 'Off', Saturday: 'Off'
  });

  const [notifEnabled, setNotifEnabled] = useState(false);

  const requestNotif = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') setNotifEnabled(true);
    }
  };

  const handleSave = () => {
    const batch = week.map(w => ({
      title: `${weeklyPlan[w.day]} Shift`,
      time: times[weeklyPlan[w.day]],
      type: weeklyPlan[w.day].toLowerCase(),
      day: w.day,
      dateLabel: w.date,
      notif: notifEnabled
    }));
    onAdd(batch);
  };

  return (
    <ModalOverlay title="Weekly Planner" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: 'rgba(0, 212, 170, 0.05)', border: '1px solid var(--primary-glow)', padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <h4 style={{ fontSize: '15px', fontWeight: '950' }}>30-Min Intelligent Reminders</h4>
             <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>Receive alerts before your shift starts.</p>
           </div>
           <motion.button 
             onClick={requestNotif}
             whileTap={{ scale: 0.9 }} 
             style={{ background: notifEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: notifEnabled ? 'black' : 'white', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '10px', fontWeight: '950', textTransform: 'uppercase' }}
           >
             {notifEnabled ? 'Active' : 'Enable'}
           </motion.button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {week.map(w => (
            <div key={w.day} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 <span style={{ fontSize: '14px', fontWeight: '900', color: w.day === 'Sunday' ? 'var(--secondary)' : 'white' }}>{w.day}</span>
                 <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '800' }}>{w.date}</span>
               </div>
               <div style={{ display: 'flex', gap: '6px' }}>
                 {['M', 'E', 'N', 'O'].map((abbr, i) => (
                   <motion.button 
                     key={abbr} 
                     whileTap={{ scale: 0.9 }}
                     onClick={() => setWeeklyPlan({...weeklyPlan, [w.day]: types[i]})}
                     style={{ width: '32px', height: '32px', borderRadius: '10px', background: weeklyPlan[w.day] === types[i] ? 'var(--primary)' : 'rgba(255,255,255,0.05)', border: 'none', color: weeklyPlan[w.day] === types[i] ? 'black' : 'var(--text-dim)', fontSize: '11px', fontWeight: '950' }}
                   >
                     {abbr}
                   </motion.button>
                 ))}
               </div>
            </div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} style={{ width: '100%', background: 'var(--secondary)', color: 'var(--bg-dark)', padding: '24px', borderRadius: '24px', border: 'none', fontWeight: '950', marginTop: '16px', fontSize: '18px', boxShadow: '0 12px 30px -10px var(--secondary-glow)' }}>Deploy Weekly Schedule</motion.button>
      </div>
    </ModalOverlay>
  );
};

const AddVaultModal = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({ desc: '', amt: '', mode: 'deduct' });

  return (
    <ModalOverlay title="Ledger Entry" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '18px', border: '1px solid var(--border)' }}>
          <button onClick={() => setFormData({...formData, mode: 'deduct'})} style={{ flex: 1, padding: '12px', borderRadius: '14px', border: 'none', background: formData.mode === 'deduct' ? 'var(--danger)' : 'transparent', color: formData.mode === 'deduct' ? 'white' : 'var(--text-dim)', fontWeight: '950', fontSize: '12px', transition: '0.3s' }}>DEDUCTION</button>
          <button onClick={() => setFormData({...formData, mode: 'add'})} style={{ flex: 1, padding: '12px', borderRadius: '14px', border: 'none', background: formData.mode === 'add' ? 'var(--success)' : 'transparent', color: formData.mode === 'add' ? 'white' : 'var(--text-dim)', fontWeight: '950', fontSize: '12px', transition: '0.3s' }}>TOP UP</button>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block', fontWeight: '900', letterSpacing: '1px' }}>PURPOSE</label>
          <input style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '20px', borderRadius: '20px', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '700' }} placeholder="Ex: Room Rent, Electricity" onChange={e => setFormData({...formData, desc: e.target.value})} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block', fontWeight: '900', letterSpacing: '1px' }}>VALUE (KWD)</label>
          <div style={{ position: 'relative' }}>
             <input style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '20px 80px 20px 20px', borderRadius: '20px', color: 'white', outline: 'none', fontSize: '24px', fontWeight: '950' }} type="number" placeholder="0.000" onChange={e => setFormData({...formData, amt: e.target.value})} />
             <span style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', color: formData.mode === 'add' ? 'var(--success)' : 'var(--danger)', fontWeight: '950', fontSize: '14px' }}>{formData.mode === 'add' ? '+' : '-'}</span>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onAdd({ desc: formData.desc, amt: (formData.mode === 'add' ? '' : '-') + (parseFloat(formData.amt) || 0).toFixed(3) })} style={{ width: '100%', background: formData.mode === 'add' ? 'var(--success)' : 'var(--primary)', color: 'var(--bg-dark)', padding: '24px', borderRadius: '24px', border: 'none', fontWeight: '950', marginTop: '16px', fontSize: '18px', boxShadow: `0 12px 30px -10px ${formData.mode === 'add' ? 'var(--success)' : 'var(--primary-glow)'}` }}>Commit Transaction</motion.button>
      </div>
    </ModalOverlay>
  );
};

const AddDocModal = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({ title: '', expiry: '' });
  
  const calculateProgress = (dateStr) => {
    const exp = new Date(dateStr);
    const now = new Date();
    const diff = exp - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    let progress = 100 - ((days / 365) * 100);
    if (progress < 0) progress = 0;
    if (progress > 100) progress = 100;
    return { days, progress };
  };

  const handleSave = () => {
    if (!formData.expiry || !formData.title) return;
    const { days, progress } = calculateProgress(formData.expiry);
    onAdd({ title: formData.title, expiry: formData.expiry, daysLeft: days, progress });
  };

  return (
    <ModalOverlay title="Secure Identity" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block', fontWeight: '900', letterSpacing: '1px' }}>DOCUMENT NAME</label>
          <input style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '20px', borderRadius: '20px', color: 'white', outline: 'none', fontSize: '16px', fontWeight: '700' }} placeholder="Ex: Civil ID, Passport, Driver License" onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block', fontWeight: '900', letterSpacing: '1px' }}>VALID UNTIL</label>
          <input type="date" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '20px', borderRadius: '20px', color: 'white', outline: 'none', fontWeight: '700' }} onChange={e => setFormData({...formData, expiry: e.target.value})} />
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} style={{ width: '100%', background: 'var(--secondary)', color: 'var(--bg-dark)', padding: '24px', borderRadius: '24px', border: 'none', fontWeight: '950', marginTop: '16px', fontSize: '18px', boxShadow: '0 12px 30px -10px var(--secondary-glow)' }}>Secure Document</motion.button>
      </div>
    </ModalOverlay>
  );
};

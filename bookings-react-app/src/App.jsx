import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { 
  Calendar, 
  MapPin, 
  User, 
  ArrowRight, 
  Search, 
  Loader2,
  RefreshCw,
  Phone,
  ArrowDown
} from 'lucide-react'
import { 
  isToday, 
  isThisWeek, 
  isThisMonth, 
  parseISO, 
  format as formatDateFns,
  parse
} from 'date-fns'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit, 
  getDocs, 
  startAfter 
} from 'firebase/firestore'
import { db } from './firebase'
import './App.css'

const PAGE_SIZE = 10;

function App() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  
  // Real-time stats listener (all data)
  const [allDataForStats, setAllDataForStats] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'all-bookings'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        let tripDate = new Date();
        try {
          if (d.dateOfTrip) {
            if (d.dateOfTrip.includes('/')) {
              const parts = d.dateOfTrip.split(' ')[0].split('/');
              if (parts[0].length === 4) tripDate = parseISO(d.dateOfTrip);
              else tripDate = parse(d.dateOfTrip, 'MM/dd/yyyy', new Date());
            } else tripDate = parseISO(d.dateOfTrip);
          } else if (d.bookingDate) {
             tripDate = d.bookingDate.toDate ? d.bookingDate.toDate() : new Date(d.bookingDate);
          }
        } catch (e) { /* ignore */ }
        return { ...d, date: tripDate };
      });
      setAllDataForStats(data);
    });
    return () => unsub();
  }, []);

  const fetchBookings = useCallback(async (isFirstPage = false) => {
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let q = query(
        collection(db, 'all-bookings'), 
        orderBy('bookingDate', 'desc'), 
        limit(PAGE_SIZE)
      );

      if (!isFirstPage && lastDoc) {
        q = query(
          collection(db, 'all-bookings'), 
          orderBy('bookingDate', 'desc'), 
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const newBookings = snapshot.docs.map(doc => {
        const data = doc.data();
        let tripDate = new Date();
        try {
          if (data.dateOfTrip) {
            if (data.dateOfTrip.includes('/')) {
              const parts = data.dateOfTrip.split(' ')[0].split('/');
              if (parts[0].length === 4) tripDate = parseISO(data.dateOfTrip);
              else tripDate = parse(data.dateOfTrip, 'MM/dd/yyyy', new Date());
            } else tripDate = parseISO(data.dateOfTrip);
          } else if (data.bookingDate) {
             tripDate = data.bookingDate.toDate ? data.bookingDate.toDate() : new Date(data.bookingDate);
          }
        } catch (e) { /* ignore */ }

        return {
          id: doc.id,
          customer: data.name || 'Valued Customer',
          source: data.from || 'Gujarat Area',
          destination: data.to || 'Gujarat Area',
          date: tripDate,
          price: data.price || 0,
          status: data.status || 'Received',
          type: data.type || 'Standard',
          phone: data.phone || ''
        };
      });

      if (isFirstPage) {
        setBookings(newBookings);
      } else {
        setBookings(prev => [...prev, ...newBookings]);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Pagination error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  // Initial load
  useEffect(() => {
    fetchBookings(true);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const date = booking.date;
      if (filter === 'today') return isToday(date);
      if (filter === 'week') return isThisWeek(date, { weekStartsOn: 1 });
      if (filter === 'month') return isThisMonth(date);
      return true;
    });
  }, [filter, bookings]);

  const stats = useMemo(() => {
    return {
      today: allDataForStats.filter(b => isToday(b.date)).length,
      week: allDataForStats.filter(b => isThisWeek(b.date, { weekStartsOn: 1 })).length,
      month: allDataForStats.filter(b => isThisMonth(b.date)).length,
      total: allDataForStats.length
    };
  }, [allDataForStats]);

  const refreshData = () => {
    setLastDoc(null);
    fetchBookings(true);
  };

  return (
    <div className="app-container">
      <header className="header">
        <img 
          src="/logo.webp" 
          alt="Patel Cab Service Logo" 
          className="brand-logo" 
          onError={(e) => e.target.style.display = 'none'} 
        />
        <h1 className="title">Booking Management</h1>
        <p className="subtitle">Patel Cab Service Dashboard</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div className="info-label" style={{ marginBottom: '0.5rem' }}>Today's Trips</div>
          <div className="stat-value">{stats.today}</div>
        </div>
        <div className="glass stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div className="info-label" style={{ marginBottom: '0.5rem' }}>This Week</div>
          <div className="stat-value">{stats.week}</div>
        </div>
        <div className="glass stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div className="info-label" style={{ marginBottom: '0.5rem' }}>This Month</div>
          <div className="stat-value">{stats.month}</div>
        </div>
        <div className="glass stats-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div className="info-label" style={{ marginBottom: '0.5rem' }}>Full History</div>
          <div className="stat-value">{stats.total}</div>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'today', 'week', 'month'].map((f) => (
          <button 
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All Data' : f === 'today' ? 'Trips Today' : f === 'week' ? 'Weekly View' : 'Monthly View'}
          </button>
        ))}
        <button 
           className="filter-btn" 
           onClick={refreshData}
           style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '10px' }}
        >
          <RefreshCw size={14} className={loading && !loadingMore ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="booking-card-list">
        {loading ? (
          <div className="empty-state glass">
             <Loader2 size={48} className="animate-spin" style={{ color: '#fdc501', marginBottom: '1rem' }} />
             <div>Fetching primary data...</div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <>
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-card glass">
                <div className="booking-id">ID: {booking.id.slice(0, 8)}</div>
                
                <div className="booking-info-group">
                  <div className="info-label">Customer</div>
                  <div className="info-value" style={{ marginBottom: '4px' }}>
                    <User size={18} color="#fdc501" style={{ marginRight: '8px' }} />
                    {booking.customer}
                  </div>
                </div>

                <div className="booking-info-group">
                  <div className="info-label">Pick & Drop</div>
                  <div className="info-value">
                    <MapPin size={16} color="#ef4444" />
                    <span style={{ fontSize: '0.95rem', marginLeft: '6px' }}>{booking.source}</span>
                  </div>
                  <div style={{ padding: '4px 0 4px 5px' }}>
                     <ArrowDown size={14} className="route-arrow" />
                  </div>
                  <div className="info-value">
                    <MapPin size={16} color="#10b981" />
                    <span style={{ fontSize: '0.95rem', marginLeft: '6px' }}>{booking.destination}</span>
                  </div>
                </div>

                <div className="booking-info-group">
                  <div className="info-label">Trip Schedule</div>
                  <div className="info-value date-value">
                    <Calendar size={16} style={{ marginRight: '8px' }} />
                    {formatDateFns(booking.date, 'dd MMM yyyy')}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '4px', fontWeight: 700 }}>{booking.type.toUpperCase()}</div>
                </div>

                <div className="status-container">
                    <div className="firebase-tag">
                       <span style={{ color: '#10b981' }}>●</span> Live Sync
                    </div>
                    <div className={`status-badge ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </div>
                    {booking.phone && (
                      <a href={`tel:${booking.phone}`} className="call-link">
                        <Phone size={14} /> Call {booking.customer.split(' ')[0]}
                      </a>
                    )}
                </div>
              </div>
            ))}
            
            {hasMore && (
              <button 
                className="glass load-more-btn" 
                onClick={() => fetchBookings(false)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <ArrowDown size={16} style={{ marginRight: '8px' }} />
                    Load 10 More Bookings
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="empty-state glass">
             <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
             <div>No active bookings found for "{filter}".</div>
          </div>
        )}
      </div>

      <footer style={{ marginTop: '4rem', padding: '2rem', color: '#475569', fontSize: '0.85rem' }}>
        &copy; 2026 Patel Cab Service - Real-time Management Console
      </footer>
    </div>
  )
}

export default App

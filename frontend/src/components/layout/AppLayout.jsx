import { useState } from 'react';
import {
  NavLink,
  Outlet,
  useNavigate
} from 'react-router-dom';
import {
  FaBars,
  FaFolderOpen,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const exit = async () => {
    await logout();
    navigate('/login');
  };

  const handleClose = () => {
    if (window.innerWidth <= 768) {
      setOpen(false);
    } else {
      setMessage('This option is only available on mobile.');

      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  const links = [
    {
      to: '/dashboard',
      icon: <FaTachometerAlt />,
      text: 'Dashboard'
    },
    {
      to: '/projects',
      icon: <FaFolderOpen />,
      text: 'Projects'
    }
  ];

  return (
    <div className="shell">

      {/* Custom notification */}
      {message && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <FaInfoCircle
            style={{
              color: '#4f46e5',
              fontSize: '16px'
            }}
          />

          <span>{message}</span>

          <button
            type="button"
            onClick={() => setMessage('')}
            style={{
              marginLeft: '8px',
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '2px 5px'
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>

        {/* Brand */}
        <div className="brand">

          <img
            src="/favicon.svg"
            alt="ProjectFlow"
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />

          <span
            style={{
              background: 'none',
              padding: 0,
              fontSize: '18px',
              fontWeight: '800',
              color: '#ffffff'
            }}
          >
            ProjectFlow
          </span>

          {/* Mobile Close */}
          <button
            type="button"
            className="mobile-close icon-btn"
            onClick={handleClose}
            aria-label="Close navigation"
            style={{
              marginLeft: 'auto',
              color: '#ffffff',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <FaTimes />
          </button>

        </div>

        {/* Navigation */}
        <nav>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
            >
              {link.icon}
              {link.text}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          type="button"
          className="nav-logout"
          onClick={exit}
        >
          <FaSignOutAlt />
          Logout
        </button>

      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="drawer-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <main>

        {/* Topbar */}
        <header className="topbar">

          <button
            type="button"
            className="menu-btn icon-btn"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <FaBars />
          </button>

          <div className="page-title">
            Project workspace
          </div>

          {/* Profile */}
          <div className="profile">

            <span>
              {user?.fullName
                ?.split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')}
            </span>

            <div>
              <strong>
                {user?.fullName}
              </strong>

              <small>
                {user?.email}
              </small>
            </div>

          </div>

        </header>

        {/* Page Content */}
        <div className="content">
          <Outlet />
        </div>

      </main>

    </div>
  );
}


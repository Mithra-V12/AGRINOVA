import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router";
import { Globe, Leaf, Menu, Mic, User, X, Bell, ShoppingCart, LogOut } from "lucide-react";
import { LANGUAGES, useI18n } from "../../lib/i18n";
import { cn } from "../../lib/utils";
import { getCart, getNotifications, markNotificationRead, Notification, UserProfile } from "../../lib/api";

const NAV_ITEMS: { to: string; key: Parameters<ReturnType<typeof useI18n>["t"]>[0] }[] = [
  { to: "/", key: "home" },
  { to: "/marketplace", key: "marketplace" },
  { to: "/weather", key: "weather" },
  { to: "/schemes", key: "schemes" },
];

export default function Navbar() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      setCurrentUser(JSON.parse(userStr));
      fetchCartAndNotifs();
    } else {
      setCurrentUser(null);
      setCartCount(0);
      setNotifications([]);
    }
  }, [location.pathname]);

  async function fetchCartAndNotifs() {
    try {
      const [cartItems, notifItems] = await Promise.all([
        getCart().catch(() => []),
        getNotifications().catch(() => [])
      ]);
      
      const count = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
      setCartCount(count);
      setNotifications(notifItems);
    } catch (e) {
      console.log("Error loading navbar context", e);
    }
  }

  async function handleReadNotif(id: string) {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setCartCount(0);
    setNotifications([]);
    setProfileOpen(false);
    navigate("/");
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-husk/90 backdrop-blur border-b border-forest/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-full bg-canopy flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-husk" size={18} />
          </span>
          <span className="font-display text-xl font-semibold text-forest-dark tracking-tight">AGRINOVA</span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3.5 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive ? "bg-forest text-husk" : "text-ink-soft hover:bg-husk-dim hover:text-forest-dark"
                )
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
          {currentUser && (
            <NavLink
              to={currentUser.userType === "farmer" ? "/dashboard" : "/customer-dashboard"}
              className={({ isActive }) =>
                cn(
                  "px-3.5 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive ? "bg-forest text-husk" : "text-ink-soft hover:bg-husk-dim hover:text-forest-dark"
                )
              }
            >
              {t("dashboard")}
            </NavLink>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => { setLangOpen(v => !v); setNotifOpen(false); setProfileOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-forest/15 text-sm font-medium text-forest-dark hover:bg-husk-dim transition-colors"
            >
              <Globe size={14} />
              {LANGUAGES.find((l) => l.code === lang)?.native || "English"}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-48 max-h-80 overflow-y-auto card-surface p-1.5 z-50">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      localStorage.setItem("language", l.code);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-husk-dim",
                      lang === l.code && "bg-sprout-light text-forest font-semibold"
                    )}
                  >
                    <span>{l.native}</span>
                    <span className="text-xs text-ink-soft">{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentUser && (
            <>
              {/* Shopping Cart Icon */}
              <NavLink
                to="/checkout"
                className="relative w-9 h-9 rounded-full border border-forest/15 text-forest flex items-center justify-center hover:bg-husk-dim transition-colors"
              >
                <ShoppingCart size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-clay text-husk text-[10px] font-mono-data font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-husk">
                    {cartCount}
                  </span>
                )}
              </NavLink>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(v => !v); setLangOpen(false); setProfileOpen(false); }}
                  className="relative w-9 h-9 rounded-full border border-forest/15 text-forest flex items-center justify-center hover:bg-husk-dim transition-colors"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-clay rounded-full w-2.5 h-2.5 border border-husk" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card-surface p-3 z-50 divide-y divide-forest/5 shadow-lg">
                    <div className="flex justify-between items-center pb-2 mb-2">
                      <span className="font-semibold text-forest-dark text-sm">Notifications ({unreadCount} unread)</span>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-ink-soft py-4 text-center">No notifications yet.</p>
                    ) : (
                      <div className="space-y-2 pt-2">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleReadNotif(n.id)}
                            className={cn(
                              "text-xs p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-husk-dim",
                              !n.read ? "bg-sprout-light/40 border-l-2 border-canopy" : "opacity-80"
                            )}
                          >
                            <p className="text-forest-dark leading-snug font-medium">{n.text}</p>
                            <p className="text-[10px] text-ink-soft mt-1">{new Date(n.createdAt).toLocaleTimeString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* User Profile / Login dropdown */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(v => !v); setLangOpen(false); setNotifOpen(false); }}
              className="w-9 h-9 rounded-full bg-forest text-husk flex items-center justify-center hover:bg-forest-dark transition-colors"
            >
              <User size={16} />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 card-surface p-2 z-50 divide-y divide-forest/8 shadow-lg">
                {currentUser ? (
                  <>
                    <div className="px-3 py-2 text-left">
                      <p className="font-semibold text-sm text-forest-dark truncate">{currentUser.name}</p>
                      <p className="text-xs text-ink-soft uppercase font-bold">{currentUser.userType}</p>
                    </div>
                    <div className="py-1">
                      <NavLink
                        to={currentUser.userType === "farmer" ? "/dashboard" : "/customer-dashboard"}
                        onClick={() => setProfileOpen(false)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm text-ink-soft hover:bg-husk-dim hover:text-forest-dark"
                      >
                        Dashboard
                      </NavLink>
                      <NavLink
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm text-ink-soft hover:bg-husk-dim hover:text-forest-dark"
                      >
                        Edit Details
                      </NavLink>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-clay hover:bg-clay-dim flex items-center gap-1.5 font-medium"
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-1">
                    <NavLink
                      to="/login"
                      onClick={() => setProfileOpen(false)}
                      className="block w-full text-center py-2 rounded-lg text-sm font-semibold bg-canopy text-husk hover:bg-forest transition-colors"
                    >
                      Sign In
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button className="lg:hidden w-9 h-9 flex items-center justify-center text-forest-dark" onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-forest/10 bg-husk px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn("block px-3 py-2.5 rounded-lg text-[15px] font-medium", isActive ? "bg-forest text-husk" : "text-ink-soft hover:bg-husk-dim")
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
          {currentUser ? (
            <>
              <NavLink
                to={currentUser.userType === "farmer" ? "/dashboard" : "/customer-dashboard"}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-[15px] font-medium text-ink-soft hover:bg-husk-dim"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-[15px] font-medium text-ink-soft hover:bg-husk-dim"
              >
                Edit Profile
              </NavLink>
              <button
                onClick={() => { handleLogout(); setOpen(false); }}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-[15px] font-medium text-clay hover:bg-clay-dim"
              >
                Log Out
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-[15px] font-medium text-ink-soft hover:bg-husk-dim"
            >
              Sign In
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}

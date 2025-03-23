'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout, cartItemCount } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef(null);

  const isActive = (path) => pathname === path;

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close user menu on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-lg z-50 relative" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center" aria-label="Home">
            <span className="text-xl md:text-2xl font-bold text-ourArabGreen">Our Arab Heritage</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/products" 
              className={`${
                isActive('/products') ? 'text-ourArabGreen border-b-2 border-ourArabGreen' : 'text-gray-600'
              } hover:text-ourArabGreen px-3 py-2 transition-colors duration-200`}
            >
              Marketplace
            </Link>

            {user?.role === 'SELLER' && (
              <Link
                href="/sell"
                className={`${
                  isActive('/sell') ? 'text-ourArabGreen border-b-2 border-ourArabGreen' : 'text-gray-600'
                } hover:text-ourArabGreen px-3 py-2 transition-colors duration-200`}
              >
                Sell
              </Link>
            )}

            <Link 
              href="/cart" 
              className="flex items-center text-gray-600 hover:text-ourArabGreen relative"
              aria-label={`Shopping cart (${cartItemCount} items)`}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="ml-1 bg-ourArabGreen text-white rounded-full px-2 py-1 text-xs">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-gray-600 hover:text-ourArabGreen"
                  aria-expanded={isUserMenuOpen}
                  aria-controls="user-menu"
                  aria-haspopup="true"
                  aria-label="User menu"
                  tabIndex={0}
                >
                  <UserIcon className="h-6 w-6" />
                </button>
                
                {isUserMenuOpen && (
                  <div
                    id="user-menu"
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    role="menu"
                    tabIndex={0}
                  >
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className={`w-full text-left px-4 py-2 ${
                        loggingOut ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-100'
                      } transition-colors`}
                      role="menuitem"
                    >
                      {loggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`${
                  isActive('/login') ? 'text-ourArabGreen border-b-2 border-ourArabGreen' : 'text-gray-600'
                } hover:text-ourArabGreen px-3 py-2 transition-colors duration-200`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-ourArabGreen"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={menuRef}
          className={`md:hidden transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2">
            <Link
              href="/products"
              className={`block px-3 py-2 rounded ${
                isActive('/products') ? 'text-ourArabGreen bg-gray-100' : 'text-gray-600 hover:bg-gray-100'
              } transition-colors`}
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>

            {user?.role === 'SELLER' && (
              <Link
                href="/sell"
                className={`block px-3 py-2 rounded ${
                  isActive('/sell') ? 'text-ourArabGreen bg-gray-100' : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sell
              </Link>
            )}

            <Link
              href="/cart"
              className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
              aria-label={`Shopping cart (${cartItemCount} items)`}
            >
              <ShoppingCartIcon className="h-6 w-6 mr-2" />
              Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`w-full text-left px-3 py-2 rounded ${
                    loggingOut ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'
                  } transition-colors`}
                >
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`block px-3 py-2 rounded ${
                  isActive('/login') ? 'text-ourArabGreen bg-gray-100' : 'text-gray-600 hover:bg-gray-100'
                } transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}





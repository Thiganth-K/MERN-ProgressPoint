import React, { useState } from 'react'
import { useNavigate } from 'react-router';

const NavBar = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('adminName');
        navigate('/');
    };

    return (
        <header className="bg-base-100 shadow-md sticky top-0 z-50 w-full">
            <nav className="flex items-center justify-between p-4 w-full max-w-none">
                <div className="text-xl font-bold text-primary">Progress Point</div>
                {/* Hamburger for mobile */}
                <div className="sm:hidden">
                    <button
                        className="text-primary focus:outline-none"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                        </svg>
                    </button>
                </div>
                {/* Desktop Menu */}
                <div className="hidden sm:flex items-center gap-4">
                    <a href="/admin" className="text-secondary hover:text-primary font-medium px-3 py-1 rounded transition">Home</a>
                    <a href="/leaderboard" className="text-secondary hover:text-primary font-medium px-3 py-1 rounded transition">Leaderboard</a>
                    <a href="/attendancepage" className="text-secondary hover:text-primary font-medium px-3 py-1 rounded transition">Attendance</a>
                    <a href="/markentry" className="text-secondary hover:text-primary font-medium px-3 py-1 rounded transition">Mark Entry</a>
                    <a href="/about" className="text-secondary hover:text-primary font-medium px-3 py-1 rounded transition">About</a>
                    <button
                        onClick={handleLogout}
                        className="btn btn-sm btn-error ml-2"
                    >
                        Logout
                    </button>
                </div>
            </nav>
            {/* Mobile Menu */}
            {menuOpen && (
                <div className="sm:hidden bg-base-100 shadow-md px-4 pb-4">
                    <a href="/admin" className="block text-secondary hover:text-primary font-medium py-2" onClick={() => setMenuOpen(false)}>Home</a>
                    <a href="/about" className="block text-secondary hover:text-primary font-medium py-2" onClick={() => setMenuOpen(false)}>About</a>
                    <a href="/leaderboard" className="block text-secondary hover:text-primary font-medium py-2" onClick={() => setMenuOpen(false)}>Leaderboard</a>
                    <a href="/attendancepage" className="block text-secondary hover:text-primary font-medium py-2" onClick={() => setMenuOpen(false)}>Attendance</a>
                    <a href="/markentry" className="block text-secondary hover:text-primary font-medium py-2" onClick={() => setMenuOpen(false)}>Mark Entry</a>
                    <button
                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                        className="btn btn-sm btn-error w-full mt-2"
                    >
                        Logout
                    </button>
                </div>
            )}
        </header>
    );
};

export default NavBar;
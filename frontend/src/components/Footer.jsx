import React from 'react';

const navLinks = [
  { href: '/admin', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/attendancepage', label: 'Attendance' },
  { href: '/markentry', label: 'Mark Entry' },
  { href: '/about', label: 'About' }
];

const appName = "Progress Point";

const Footer = () => (
  <footer className="bg-base-100 border-t border-base-200 w-full">
    {/* Add margin-top for space above the footer */}
    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center py-8 px-4 mt-8 gap-8">
      {/* Nav links in 2x2 grid on left (desktop), below app name on mobile */}
      <div className="w-full sm:w-2/3 flex flex-col items-center sm:items-start">
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {navLinks.slice(0, 4).map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-secondary hover:text-primary font-medium px-3 py-2 rounded transition text-center border border-base-200"
            >
              {link.label}
            </a>
          ))}
        </div>
        {/* About link full width below grid */}
        <div className="w-full mt-4">
          <a
            href="/about"
            className="block text-secondary hover:text-primary font-medium px-3 py-2 rounded transition text-center border border-base-200"
          >
            About
          </a>
        </div>
      </div>
      {/* App name and copyright on right (desktop), top (mobile) */}
      <div className="w-full sm:w-1/3 flex flex-col items-center sm:items-end">
        <div className="text-primary font-bold text-2xl mb-2">{appName}</div>
        <div className="text-xs text-gray-500 text-center sm:text-right">
          &copy; {new Date().getFullYear()} {appName}<br />Sona College of Technology, Salem
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
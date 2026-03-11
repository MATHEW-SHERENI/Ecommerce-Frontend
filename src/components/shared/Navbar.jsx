import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const baseLinkClass =
        'px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200';

    const getLinkClass = ({ isActive }) =>
        isActive
            ? `${baseLinkClass} text-blue-700 bg-blue-50`
            : `${baseLinkClass} text-gray-700 hover:text-blue-700 hover:bg-gray-100`;

    const handleCloseMenu = () => setIsMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    <Link
                        to="/"
                        className="text-xl font-bold tracking-tight text-gray-900"
                        onClick={handleCloseMenu}
                    >
                        SmartCart
                    </Link>

                    <div className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={getLinkClass}
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMenuOpen}
                    >
                        <span className="text-xl leading-none">{isMenuOpen ? '✕' : '☰'}</span>
                    </button>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-gray-100">
                        <div className="pt-3 flex flex-col gap-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/'}
                                    className={getLinkClass}
                                    onClick={handleCloseMenu}
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;
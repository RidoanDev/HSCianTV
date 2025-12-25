import { useState } from 'react';
import { Menu, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import { usePwaInstall } from '@/hooks/use-pwa-install';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isInstalled, installApp } = usePwaInstall();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="text-xl font-bold text-foreground">
            HSCianTV
          </Link>

          <div className="flex items-center gap-2">
            {!isInstalled && (
              <button
                onClick={installApp}
                className="nav-button flex items-center gap-2 text-sm"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(true)}
              className="nav-button"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Navbar;

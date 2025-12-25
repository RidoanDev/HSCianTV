import { BookOpen, FileText, Link as LinkIcon, GraduationCap, Facebook, Youtube, MessageCircle, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { to: '/', icon: BookOpen, label: 'All Courses' },
    { to: '#materials', icon: FileText, label: 'Materials' },
    { to: '#pdfs', icon: LinkIcon, label: 'PDFs' },
    { to: '#resources', icon: GraduationCap, label: 'Resources' },
  ];

  const socialLinks = [
    { href: 'https://facebook.com/hsciantv', icon: Facebook, label: 'Facebook Page', color: 'text-blue-600' },
    { href: 'https://facebook.com/groups/hsciantv', icon: Facebook, label: 'Facebook Group', color: 'text-blue-500' },
    { href: 'https://youtube.com/@hsciantv', icon: Youtube, label: 'YouTube', color: 'text-red-500' },
    { href: 'https://wa.me/+8801234567890', icon: MessageCircle, label: 'WhatsApp', color: 'text-green-500' },
    { href: 'https://t.me/hsciantv', icon: Send, label: 'Telegram', color: 'text-blue-400' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-52 fixed left-0 top-14 bottom-0 bg-sidebar border-r border-sidebar-border">
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`sidebar-link ${location.pathname === link.to ? 'sidebar-link-active' : ''}`}
            >
              <link.icon size={20} />
              <span className="text-sm">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="border-t border-sidebar-border mx-3 my-2" />

        <div className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground px-4 mb-2 font-medium">যোগাযোগ</p>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-link"
            >
              <link.icon size={20} className={link.color} />
              <span className="text-sm">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

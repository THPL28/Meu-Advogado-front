import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  MessageSquare,
  Menu,
  Search
} from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { ActiveTab } from '../../context/PlatformContext';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu }) => {
  const {
    activeTab,
    setActiveTab,
    jobs,
    proposals,
    notifications,
    role
  } = useLegalPlatform();

  const activeJobsCount = jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'OPEN').length;
  const pendingProposalsCount = proposals.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').length;
  const unreadMessagesCount = notifications.filter(n => n.type === 'CHAT_MESSAGE' && !n.isRead).length;

  const items: { id: ActiveTab | 'menu'; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: role === 'LAWYER' ? 'find-jobs' : 'find-lawyers', label: 'Buscar', icon: Search },
    { id: 'cases', label: role === 'LAWYER' ? 'Casos' : 'Demandas', icon: Briefcase, badge: activeJobsCount },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined },
    { id: 'menu', label: 'Menu', icon: Menu }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40 px-1 py-1.5 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.id !== 'menu' && (activeTab === item.id || (item.id === 'cases' && activeTab === 'case-detail'));

        const handleClick = () => {
          if (item.id === 'menu') {
            onOpenMobileMenu();
          } else {
            setActiveTab(item.id as ActiveTab);
          }
        };

        return (
          <button
            key={item.id}
            onClick={handleClick}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-xs font-medium transition-all relative ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-muted-foreground/90 hover:text-foreground'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-muted-foreground/90'}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-emerald-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mt-0.5 text-[11px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

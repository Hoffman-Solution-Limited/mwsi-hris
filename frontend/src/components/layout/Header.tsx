import React from 'react';
import {
  Bell, Search, Settings, LogOut, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/contexts/UsersContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { users } = useUsers()
  const navigate = useNavigate();
  const { getUserNotifications, getUnreadCount, markAllRead, markRead } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleEditPhoto = () => {
    // If the avatar upload input exists on the page (profile), open it. Otherwise navigate to profile then try again.
    const tryClick = () => {
      const input = document.getElementById('avatarUpload') as HTMLInputElement | null;
      if (input) {
        input.click();
        return true;
      }
      return false;
    }

    if (!tryClick()) {
      navigate('/profile');
      // Try again after navigation — short delay to allow profile to mount
      setTimeout(() => tryClick(), 300);
    }
  };

  const handleSettings = () => {
    navigate('/change-password');
  };

  const notifications = user ? getUserNotifications(user.id) : [];
  const unreadCount = user ? getUnreadCount(user.id) : 0;

  // Prefer avatar from the authenticated user object; if missing, fall back to the users context record
  const avatarSrc = user?.avatar || users.find(u => (user && (u.id === user.id || u.email === user.email)))?.avatar || undefined

  return (
    <header className="sticky top-0 z-10 h-16 bg-header border-b border-border shadow-sm flex items-center justify-between px-6">
      {/* Left: Mobile Sidebar Toggle + Search */}
      <div className="flex items-center gap-4 flex-1">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden text-foreground hover:text-primary"
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-header-foreground/70" />
          <Input
            placeholder="Search employees, documents, or records..."
            className="pl-10 w-80"
          />
        </div>
      </div>

      {/* Right: Notifications and User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative text-header-foreground">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {user && notifications.length > 0 && (
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => markAllRead(user.id)}
                >
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 6).map((n) => (
              <DropdownMenuItem key={n.id} className={`p-3 ${!n.read ? 'bg-muted/40' : ''}`}
                onClick={() => {
                  markRead(n.id);
                  if (n.link) navigate(n.link);
                }}
              >
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">No notifications</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-header-foreground">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback>{
                  (user?.name ? user.name.split(' ').map(n => n[0]).slice(0,2).join('') : 'U')
                }</AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
             {(user?.role != 'admin') && (
            <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
              )}
            <DropdownMenuItem onClick={handleEditPhoto} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Edit photo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

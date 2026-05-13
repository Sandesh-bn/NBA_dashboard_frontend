import React, { useState } from 'react';
import { 
  Users, 
  User, 
  Swords, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  Moon, 
  Sun,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  const navItems = [
    { id: 'player', label: 'Player Stats', icon: User },
    { id: 'team', label: 'Team Stats', icon: Users },
    { id: 'pvp', label: 'Player vs Player', icon: Swords },
    { id: 'tvt', label: 'Team vs Team', icon: Trophy },
  ];

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen bg-card/40 backdrop-blur-2xl border-r transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 mb-4">
        {!isCollapsed && <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">NBA Insights</h1>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center w-full p-3 rounded-lg transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "mx-auto" : "mr-3")} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-start px-2"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 mr-3" /> : <Moon className="h-5 w-5 mr-3" />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;

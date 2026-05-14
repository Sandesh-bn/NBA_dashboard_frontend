import React, { useState } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import PlayerStats from '@/pages/PlayerStats';
import TeamStats from '@/pages/TeamStats';
import PlayerVsPlayer from '@/pages/PlayerVsPlayer';
import TeamVsTeam from '@/pages/TeamVsTeam';
import Logo from './assets/logo.png';

function App() {
  const [activeTab, setActiveTab] = useState('player');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Persistence State
  const [playerCache, setPlayerCache] = useState({ lastSelected: null, map: {} });
  const [teamCache, setTeamCache] = useState({ selected: null, stats: null });
  const [pvpCache, setPvpCache] = useState({ p1: null, p2: null, comparison: null });
  const [tvtCache, setTvtCache] = useState({ t1: null, t2: null, comparison: null });

  const renderContent = () => {
    switch (activeTab) {
      case 'player': return <PlayerStats cache={playerCache} setCache={setPlayerCache} />;
      case 'team': return <TeamStats cache={teamCache} setCache={setTeamCache} />;
      case 'pvp': return <PlayerVsPlayer cache={pvpCache} setCache={setPvpCache} />;
      case 'tvt': return <TeamVsTeam cache={tvtCache} setCache={setTvtCache} />;
      default: return <PlayerStats cache={playerCache} setCache={setPlayerCache} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="nba-dashboard-theme">
      <div className="flex h-screen bg-background overflow-hidden relative">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-64 h-full" onClick={e => e.stopPropagation()}>
              <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} />
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out">
          {/* Mobile Header */}
          <div className="flex items-center p-4 border-b md:hidden bg-card/50 backdrop-blur">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">NBA Insights</h1>
          </div>

          <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Search, TrendingUp, Zap, Target, Shield, Activity, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PlayerStats = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState('pts');

  // Search players
  useEffect(() => {
    const fetchPlayers = async () => {
      if (searchQuery.length < 2) {
        setPlayers([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/players?search=${searchQuery}`);
        setPlayers(res.data);
      } catch (err) {
        console.error('Error fetching players:', err);
      }
    };
    const delayDebounceFn = setTimeout(fetchPlayers, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (selectedPlayer) setSelectedPlayer(null); // Reset when typing new search
  };

  // Fetch player stats when selected
  useEffect(() => {
    if (!selectedPlayer) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/players/${selectedPlayer.playerId}`);
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedPlayer]);

  const metrics = [
    { id: 'pts', label: 'Points', color: '#3b82f6' },
    { id: 'ast', label: 'Assists', color: '#10b981' },
    { id: 'reb', label: 'Rebounds', color: '#f59e0b' },
    { id: 'ts', label: 'Efficiency', color: '#8b5cf6' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Player Analytics</h2>
          <p className="text-muted-foreground">Deep dive into individual performance and trends.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search players (e.g. Curry, James)..." 
            className="pl-10 h-11 bg-card border-2 border-transparent focus-visible:border-primary transition-all shadow-sm"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {players.length > 0 && !selectedPlayer && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
              {players.map(p => (
                <button
                  key={p.playerId}
                  onClick={() => { setSelectedPlayer(p); setPlayers([]); setSearchQuery(`${p.firstName} ${p.lastName}`); }}
                  className="w-full text-left px-5 py-4 hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-between border-b last:border-0 border-muted"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-base">{p.firstName} {p.lastName}</span>
                    <span className="text-xs opacity-70">Team ID: {p.teamId}</span>
                  </div>
                  <Users className="h-4 w-4 opacity-50" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!stats ? (
        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-3xl bg-muted/30">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a player to view detailed analytics</p>
        </div>
      ) : (
        <>
          {/* Player Info Card */}
          <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-card to-muted/50">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-primary/20">
                  {/* {stats.player.firstName[0]}{stats.player.lastName[0]} */}
                  <img src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${stats.player.playerId}.png`}/>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-1">
                    {stats.player.firstName} {stats.player.lastName}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground font-medium">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">Team ID: {stats.player.teamId}</span>
                    <span>Player ID: {stats.player.playerId}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">PTS/G</p>
                    <p className="text-2xl font-black">{stats.archetype.pts.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">AST/G</p>
                    <p className="text-2xl font-black">{stats.archetype.ast.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">REB/G</p>
                    <p className="text-2xl font-black">{stats.archetype.reb.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">PER</p>
                    <p className="text-2xl font-black text-green-500">{stats.advanced.per}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero Visual: Trend Line */}
          <Card className="col-span-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Evolution
                </CardTitle>
                <CardDescription>Visualizing game-by-game progression throughout the season.</CardDescription>
              </div>
              <div className="flex bg-muted p-1 rounded-lg gap-1">
                {metrics.map(m => (
                  <Button
                    key={m.id}
                    variant={metric === m.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMetric(m.id)}
                    className="text-xs h-8"
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.trend}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={metrics.find(m => m.id === metric).color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={metrics.find(m => m.id === metric).color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={metric} 
                      stroke={metrics.find(m => m.id === metric).color} 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorMetric)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Radar: Archetype */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Player Archetype
                </CardTitle>
                <CardDescription>Relative strength across key dimensions.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { subject: 'PTS', A: stats.archetype.pts, fullMark: 35 },
                    { subject: 'AST', A: stats.archetype.ast, fullMark: 12 },
                    { subject: 'REB', A: stats.archetype.reb, fullMark: 15 },
                    { subject: 'STL', A: stats.archetype.stl * 10, fullMark: 30 },
                    { subject: 'BLK', A: stats.archetype.blk * 10, fullMark: 30 },
                    { subject: 'TOV', A: (5 - stats.archetype.tov) * 5, fullMark: 25 },
                  ]}>
                    <PolarGrid stroke="hsl(var(--muted))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Radar
                      name={stats.player.lastName}
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Game Log Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Last 10 Games Performance
                </CardTitle>
                <CardDescription>Consistency and win contribution.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.gameLog}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="gameDate" 
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      fontSize={10}
                    />
                    <YAxis fontSize={10} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                    />
                    <Bar 
                      dataKey="pts" 
                      radius={[4, 4, 0, 0]}
                    >
                      {stats.gameLog.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.wl === 'W' ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Shooting Splits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  Shooting Efficiency
                </CardTitle>
                <CardDescription>FG%, 3P%, and FT% distribution.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'FG%', value: stats.splits.fgPct },
                        { name: '3P%', value: stats.splits.fg3Pct },
                        { name: 'FT%', value: stats.splits.ftPct },
                      ]}
                      cx="50%" cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Advanced Metrics Panel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Advanced Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Usage Rate</p>
                    <p className="text-3xl font-black">{stats.advanced.usage}%</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">Plus / Minus</p>
                    <p className="text-3xl font-black">{stats.advanced.plusMinus > 0 ? '+' : ''}{stats.advanced.plusMinus.toFixed(1)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">PER Proxy</p>
                    <p className="text-3xl font-black">{stats.advanced.per}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-center">
                    <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Eff Rating</p>
                    <p className="text-3xl font-black">{(stats.splits.fgPct + stats.splits.fg3Pct + stats.splits.ftPct).toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerStats;

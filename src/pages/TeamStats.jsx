import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, Legend, Cell, ComposedChart
} from 'recharts';
import { Search, Trophy, BarChart3, Globe, Zap, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/').replace(/\/$/, '') + '/';

const TeamStatsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded-lg"></div>
        <div className="h-4 w-48 bg-muted rounded-lg opacity-60"></div>
      </div>
      <div className="h-11 w-full md:w-80 bg-muted rounded-xl"></div>
    </div>
    <div className="h-40 w-full bg-muted rounded-3xl"></div>
    <div className="h-[400px] w-full bg-muted rounded-3xl"></div>
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="h-[300px] bg-muted rounded-3xl"></div>
      <div className="h-[300px] lg:col-span-2 bg-muted rounded-3xl"></div>
      <div className="h-[300px] lg:col-span-3 bg-muted rounded-3xl"></div>
    </div>
  </div>
);

const TeamStats = ({ cache, setCache }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(cache.selected);
  const [stats, setStats] = useState(cache.stats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(API_URL + 'api/teams');
        setTeams(res.data);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    if (!selectedTeam || stats) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}api/teams/${selectedTeam.teamId}`);
        setStats(res.data);
        setCache({ selected: selectedTeam, stats: res.data });
      } catch (err) {
        console.error('Error fetching team stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedTeam]);

  if (loading) {
    return <TeamStatsSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Team Dynamics</h2>
          <p className="text-muted-foreground">Analyze team efficiency and season performance.</p>
        </div>
        <div className="w-full md:w-80">
          <select 
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
            onChange={(e) => setSelectedTeam(teams.find(t => t.teamId === parseInt(e.target.value)))}
          >
            <option value="">Select a Team</option>
            {teams.map(t => (
              <option key={t.teamId} value={t.teamId}>{t.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {!stats ? (
        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-3xl bg-muted/30">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a team to view detailed performance metrics</p>
        </div>
      ) : (
        <>
          {/* Team Info Header */}
          <Card className="glass-card border-none shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-3xl shadow-lg">
                  {/* {stats.team.abbreviation} */}
                  <img src={`https://a.espncdn.com/i/teamlogos/nba/500/${stats.team.abbreviation}.png`}/>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-4xl font-black tracking-tight">{stats.team.fullName}</h3>
                  <p className="text-muted-foreground font-medium">{stats.team.city}, {stats.team.conference} Conference</p>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Offensive RTG</p>
                    <p className="text-3xl font-black">{stats.comparison.team.offRating.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Defensive RTG</p>
                    <p className="text-3xl font-black">{stats.comparison.team.defRating.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Net RTG</p>
                    <p className="text-3xl font-black text-primary">+{stats.comparison.team.netRating.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hero Visual: Comparison with League Avg */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Team vs League Average
              </CardTitle>
              <CardDescription>How this team stacks up against the rest of the NBA.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Offensive Rating', team: stats.comparison.team.offRating, league: stats.comparison.league.offRating },
                    { name: 'Defensive Rating', team: stats.comparison.team.defRating, league: stats.comparison.league.defRating },
                    { name: 'Net Rating', team: stats.comparison.team.netRating + 100, league: stats.comparison.league.netRating + 100 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[90, 130]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="team" fill="hsl(var(--primary))" name="This Team" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="league" fill="hsl(var(--muted-foreground))" name="League Avg" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Efficiency Radar */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Efficiency Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={[
                    { subject: 'Offense', A: stats.efficiency.offense, fullMark: 100 },
                    { subject: 'Defense', A: stats.efficiency.defense, fullMark: 100 },
                    { subject: 'Pace', A: stats.efficiency.pace, fullMark: 100 },
                    { subject: 'Rebounds', A: stats.efficiency.rebounds, fullMark: 100 },
                    { subject: 'Assists', A: stats.efficiency.assists, fullMark: 100 },
                    { subject: 'Turnovers', A: (100 - stats.efficiency.turnovers), fullMark: 100 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar name="Team" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Win/Loss Timeline */}
            <Card className="lg:col-span-2 glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Win/Loss Timeline
                </CardTitle>
                <CardDescription>Streak analysis and seasonal momentum.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={stats.timeline}>
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short' })} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score">
                      {stats.timeline.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.result === 'W' ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Home vs Away Split */}
            <Card className="lg:col-span-3 glass-card">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Home vs Away Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Win %', home: 65, away: 42 },
                      { name: 'Points Scored', home: 118, away: 112 },
                      { name: 'Points Allowed', home: 110, away: 115 },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="home" fill="#3b82f6" name="Home" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="away" fill="#94a3b8" name="Away" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamStats;

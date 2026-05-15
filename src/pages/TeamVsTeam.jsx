import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Cell, LineChart, Line, PieChart, Pie
} from 'recharts';
import { Trophy, Swords, Calendar, TrendingUp, Home, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/').replace(/\/$/, '') + '/';

const TeamVsTeam = () => {
  const [teams, setTeams] = useState([]);
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get(API_URL + 'api/teams');
        setTeams(res.data);
      } catch (err) { console.error(err); }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    if (!team1 || !team2) return;
    
    // If stats already exist for these teams, don't fetch again
    if (stats && stats.team1?.teamId === team1.teamId && stats.team2?.teamId === team2.teamId) return;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}api/compare/teams?id1=${team1.teamId}&id2=${team2.teamId}`);
        setStats(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [team1, team2]);

  const TeamSelect = ({ label, selected, onSelect }) => (
    <div className="flex-1">
      <p className="text-xs font-bold text-muted-foreground uppercase mb-2 ml-1">{label}</p>
      <select 
        className="w-full h-12 px-4 rounded-xl border border-input bg-card shadow-sm font-bold text-lg focus:ring-2 ring-primary"
        value={selected?.teamId || ''}
        onChange={(e) => {
          const team = teams.find(t => t.teamId === parseInt(e.target.value));
          onSelect(team);
          setStats(null); // Clear stats to show loader
        }}
      >
        <option value="">Select Team</option>
        {teams.map(t => <option key={t.teamId} value={t.teamId}>{t.fullName}</option>)}
      </select>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Rivalry Analytics</h2>
        <p className="text-muted-foreground">Historical matchups and matchup probability.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 bg-card border p-8 rounded-3xl shadow-xl">
        <TeamSelect label="Home Team" selected={team1} onSelect={setTeam1} />
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted border-4 border-background text-2xl font-black text-muted-foreground">VS</div>
        <TeamSelect label="Away Team" selected={team2} onSelect={setTeam2} />
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {stats && !loading && (
        <div className="grid gap-8">
          {/* Head-to-Head Scoreboard */}
          <Card className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground border-none shadow-2xl">
            <CardContent className="p-10">
              <div className="flex justify-between items-center">
                <div className="text-center space-y-2">
                  <p className="text-5xl font-black">{stats.team1.wins}</p>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80">{team1.name} WINS</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Trophy className="h-12 w-12 text-yellow-400" />
                  <div className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-bold">
                    Last 10: W W L W L W W W L W
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-5xl font-black">{stats.team2.wins}</p>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80">{team2.name} WINS</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Match History Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Matchup Evolution
                </CardTitle>
                <CardDescription>Score differences over historical games.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { date: '2021-01', diff: 12 },
                    { date: '2021-04', diff: -5 },
                    { date: '2022-01', diff: 8 },
                    { date: '2022-11', diff: -15 },
                    { date: '2023-02', diff: 2 },
                    { date: '2024-01', diff: 18 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="diff" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Blowout vs Close Games */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Game Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Blowout (>15)', value: 2 },
                        { name: 'Double Digit', value: 4 },
                        { name: 'Clutch (<5)', value: 6 },
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#ec4899" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Average Performance Comparison */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Rivalry Averages
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'PPG', t1: 115.4, t2: 112.8 },
                      { name: 'Def RTG', t1: 110.2, t2: 114.5 },
                      { name: 'Rebounds', t1: 44.5, t2: 42.1 },
                      { name: 'Assists', t1: 28.2, t2: 25.4 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="t1" fill="hsl(var(--primary))" name={team1.name} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="t2" fill="#94a3b8" name={team2.name} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!stats && !loading && (
        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-3xl bg-muted/10">
          <Swords className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg font-medium">Choose two teams to analyze historical matchups and trends</p>
        </div>
      )}
    </div>
  );
};

export default TeamVsTeam;

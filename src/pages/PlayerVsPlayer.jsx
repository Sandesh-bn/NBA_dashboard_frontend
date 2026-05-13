import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell
} from 'recharts';
import { Search, Swords, TrendingUp, Zap, Target, Activity, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PlayerVsPlayer = ({ cache, setCache }) => {
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [players1, setPlayers1] = useState([]);
  const [players2, setPlayers2] = useState([]);
  const [player1, setPlayer1] = useState(cache?.p1 || null);
  const [player2, setPlayer2] = useState(cache?.p2 || null);
  const [comparison, setComparison] = useState(cache?.comparison || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch1 = async () => {
      if (search1.length < 2) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/players?search=${search1}`);
        if (Array.isArray(res.data)) {
          setPlayers1(res.data);
        } else {
          setPlayers1([]);
        }
      } catch (err) { 
        console.error(err); 
        setPlayers1([]);
      }
    };
    const t = setTimeout(fetch1, 300);
    return () => clearTimeout(t);
  }, [search1]);

  useEffect(() => {
    const fetch2 = async () => {
      if (search2.length < 2) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/players?search=${search2}`);
        if (Array.isArray(res.data)) {
          setPlayers2(res.data);
        } else {
          setPlayers2([]);
        }
      } catch (err) { 
        console.error(err); 
        setPlayers2([]);
      }
    };
    const t = setTimeout(fetch2, 300);
    return () => clearTimeout(t);
  }, [search2]);

  useEffect(() => {
    if (!player1 || !player2 || comparison) return;
    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/compare/players?id1=${player1.playerId}&id2=${player2.playerId}`);
        setComparison(res.data);
        setCache({ p1: player1, p2: player2, comparison: res.data });
      } catch (err) {
        console.error('Error fetching comparison:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [player1, player2]);

  const renderPlayerSelect = (p, setP, search, setSearch, results, setResults, label) => (
    <div className="flex flex-col gap-4 flex-1">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder={`Search ${label}...`} 
          className="pl-10 h-12 text-lg bg-card border-2 border-transparent focus-visible:border-primary transition-all"
          value={p ? `${p.firstName} ${p.lastName}` : search}
          onChange={(e) => { 
            setSearch(e.target.value); 
            setP(null); 
            setComparison(null); 
            setCache(prev => ({ ...prev, comparison: null, [label === "Player 1" ? 'p1' : 'p2']: null }));
          }}
        />
        {results.length > 0 && !p && search.length >= 2 && (
          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border-2 border-primary/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
            {results.map(res => (
              <button
                key={res.playerId}
                onClick={() => { setP(res); setResults([]); setSearch(''); }}
                className="w-full text-left px-5 py-4 hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-between border-b last:border-0 border-muted"
              >
                <div className="flex flex-col">
                  <span className="font-bold">{res.firstName} {res.lastName}</span>
                  <span className="text-xs opacity-70">{res.teamName}</span>
                </div>
                <Users className="h-4 w-4 opacity-50" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Player Duel</h2>
        <p className="text-muted-foreground">Head-to-head comparison of elite performers.</p>
      </div>

      {/* Duel Selection */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-muted/30 p-6 rounded-3xl border border-dashed">
        {renderPlayerSelect(player1, setPlayer1, search1, setSearch1, players1, setPlayers1, "Player 1")}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-black italic">VS</div>
        {renderPlayerSelect(player2, setPlayer2, search2, setSearch2, players2, setPlayers2, "Player 2")}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {comparison && !loading && player1 && player2 && (
        <div className="grid gap-8">
          {/* Spider/Radar Comparison (BEST UX) */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Swords className="h-6 w-6 text-primary" />
                HEAD-TO-HEAD BATTLE
              </CardTitle>
              <CardDescription>Overlapping performance profiles across key metrics.</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] py-8">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { subject: 'Points', A: comparison.player1.stats.pts, B: comparison.player2.stats.pts, fullMark: 35 },
                  { subject: 'Assists', A: comparison.player1.stats.ast, B: comparison.player2.stats.ast, fullMark: 12 },
                  { subject: 'Rebounds', A: comparison.player1.stats.reb, fullMark: 15 },
                  { subject: 'FG%', A: comparison.player1.stats.fgPct, B: comparison.player2.stats.fgPct, fullMark: 60 },
                  { subject: 'Win Share', A: comparison.player1.wins || 0, B: comparison.player2.wins || 0, fullMark: 100 },
                ]}>
                  <PolarGrid stroke="hsl(var(--muted))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name={player1.lastName}
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name={player2.lastName}
                    dataKey="B"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.5}
                  />
                  <Legend iconType="circle" />
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Side-by-side bar chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-bold">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Statistical Edge
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'PTS', p1: comparison.player1.stats.pts, p2: comparison.player2.stats.pts },
                      { name: 'AST', p1: comparison.player1.stats.ast, p2: comparison.player2.stats.ast },
                      { name: 'REB', p1: comparison.player1.stats.reb, p2: comparison.player2.stats.reb },
                    ]}
                    margin={{ left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="p1" fill="hsl(var(--primary))" name={player1.lastName} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="p2" fill="#ef4444" name={player2.lastName} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-bold">
                  <Target className="h-5 w-5 text-blue-500" />
                  Efficiency Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'True Shooting %', p1: 62.5, p2: 58.2 },
                  { label: 'Usage Rate', p1: 32.1, p2: 29.5 },
                  { label: 'Assist %', p1: 45.2, p2: 38.1 },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.p1}% vs {item.p2}%</span>
                    </div>
                    <div className="flex h-3 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="bg-primary" 
                        style={{ width: `${(item.p1 / (item.p1 + item.p2)) * 100}%` }} 
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(item.p2 / (item.p1 + item.p2)) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!comparison && !loading && (
        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-3xl bg-muted/10">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">Select two players to initiate a head-to-head breakdown</p>
        </div>
      )}
    </div>
  );
};

export default PlayerVsPlayer;

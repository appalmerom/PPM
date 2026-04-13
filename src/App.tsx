/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  FolderKanban, 
  FileSearch, 
  MessageSquare, 
  Send, 
  Search, 
  Bell, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Filter,
  MoreVertical,
  ExternalLink,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  mockDemands, 
  mockProjects, 
  mockPortfolios, 
  mockDocuments,
  Demand,
  Project,
  Portfolio,
  Document as PPMDocument
} from './mockData';
import { chatWithAgent } from './geminiService';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const PREDEFINED_ANSWERS: Record<string, string> = {
  "What is the status of Demand DMND001?": "Demand **DMND001 (Cloud Migration Phase 1)** is currently in the **Qualified** stage. It has a high priority and a budget of $250,000. All readiness checks (Business Case, Cost Inputs) are complete and it is ready for the next CAB review.",
  "Which projects are at risk?": "There are currently **2 projects at risk**: <br/><br/>1. **Cybersecurity Hardening (PRJ003)** - Red Status (Budget Overrun & Resource Shortage)<br/>2. **HR System Upgrade (PRJ004)** - Red Status (Technical Dependency Issues)<br/><br/>Would you like me to generate a mitigation plan for either of these?",
  "Summarize risks for PRJ003": "Project **PRJ003 (Cybersecurity Hardening)** is at critical risk due to:<br/>• **Budget**: 15% over allocated spend ($1.15M vs $1M).<br/>• **Resources**: Shortage of Senior Security Architects.<br/>• **Schedule**: Milestone 'Security Audit' is delayed by 14 days.<br/><br/>I recommend reallocating $50k from the 'Legacy Decommissioning' project to cover the gap.",
  "Find the latest RAID log": "The latest **RAID Log** (Risk, Action, Issue, Decision) was updated on **May 10, 2024**. It is stored in SharePoint under the 'Governance Packs' folder. <br/><br/>**Current Summary:**<br/>• 12 Active Risks<br/>• 4 Open Issues<br/>• 8 Pending Decisions"
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    // Welcome toast
    const timer = setTimeout(() => {
      toast("PPM AI Agent is ready", {
        description: "I can help you analyze portfolio risks and update ServiceNow records.",
        action: {
          label: "Ask a Question",
          onClick: () => setIsChatOpen(true),
        },
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (overrideMessage?: string) => {
    const userMessage = overrideMessage || chatInput;
    if (!userMessage.trim()) return;

    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
    setIsTyping(true);

    // Check for predefined answer first for instant response
    if (PREDEFINED_ANSWERS[userMessage]) {
      // Small delay to make it feel natural but still "instant"
      setTimeout(() => {
        setIsTyping(false);
        setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: PREDEFINED_ANSWERS[userMessage] }] }]);
      }, 600);
      return;
    }

    const response = await chatWithAgent(userMessage, chatHistory);
    
    setIsTyping(false);
    setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
  };

  const RAGBadge = ({ status }: { status: string }) => {
    const colors = {
      Red: 'bg-red-100 text-red-700 border-red-200',
      Amber: 'bg-amber-100 text-amber-700 border-amber-200',
      Green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    return (
      <Badge variant="outline" className={`${colors[status as keyof typeof colors]} font-medium`}>
        {status}
      </Badge>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    return (
      <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 font-medium">
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Toaster />
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FolderKanban className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-900">PPM Agent</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="Demands" 
            active={activeTab === 'demands'} 
            onClick={() => setActiveTab('demands')} 
          />
          <NavItem 
            icon={<Briefcase size={20} />} 
            label="Projects" 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
          />
          <NavItem 
            icon={<FolderKanban size={20} />} 
            label="Portfolios" 
            active={activeTab === 'portfolios'} 
            onClick={() => setActiveTab('portfolios')} 
          />
          <NavItem 
            icon={<FileSearch size={20} />} 
            label="SharePoint" 
            active={activeTab === 'documents'} 
            onClick={() => setActiveTab('documents')} 
          />
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              ServiceNow Connected
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <Input 
                placeholder="Search demands, projects, or documents..." 
                className="pl-12 h-11 bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
              />
            </div>
            
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl gap-2 font-bold px-6 h-11 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <MessageSquare size={18} className="animate-pulse" />
              Ask AI Agent
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">Alex Palmer</p>
                <p className="text-xs text-slate-500">Portfolio Manager</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                AP
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-7xl mx-auto space-y-8">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Portfolio Overview</h2>
                    <p className="text-slate-500">Real-time insights across all active initiatives.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <Download size={16} /> Export Report
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                      <Plus size={16} /> New Demand
                    </Button>
                  </div>
                </div>

                {/* AI Insights Banner */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/30">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        AI Agent Insights
                      </div>
                      <h3 className="text-3xl font-bold tracking-tight">"Portfolio health is currently at 84%. I've identified 2 critical bottlenecks in the Infrastructure portfolio."</h3>
                      <p className="text-indigo-100 text-lg opacity-90">I can help you reallocate resources or generate a mitigation plan for the Cybersecurity Hardening project.</p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <Button 
                          onClick={() => {
                            setIsChatOpen(true);
                            handleSendMessage("Which projects are at risk?");
                          }}
                          className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl px-6 h-12 gap-2 shadow-lg shadow-black/10"
                        >
                          <MessageSquare size={18} />
                          Analyze Risks Now
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-white hover:bg-white/10 font-bold rounded-xl px-6 h-12 border border-white/20"
                        >
                          View Full Analysis
                        </Button>
                      </div>
                    </div>
                    
                    <div className="hidden lg:block relative">
                      <div className="w-48 h-48 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                        <div className="text-center space-y-2">
                          <div className="text-4xl font-bold">84%</div>
                          <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Health Score</div>
                          <div className="w-32 h-1.5 bg-white/20 rounded-full mx-auto overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '84%' }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                              className="h-full bg-emerald-400"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                        <TrendingUp size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Active Projects" 
                    value={mockProjects.length.toString()} 
                    change="+2 this month" 
                    icon={<Briefcase className="text-indigo-600" />} 
                  />
                  <StatCard 
                    title="Demand Pipeline" 
                    value={mockDemands.length.toString()} 
                    change="3 pending review" 
                    icon={<FileText className="text-blue-600" />} 
                  />
                  <StatCard 
                    title="Budget Burn" 
                    value="78%" 
                    change="+5% vs last month" 
                    trend="up"
                    icon={<TrendingUp className="text-emerald-600" />} 
                  />
                  <StatCard 
                    title="At Risk" 
                    value="2" 
                    change="Requires attention" 
                    trend="down"
                    icon={<AlertCircle className="text-amber-600" />} 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Charts */}
                  <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Budget vs. Actuals by Portfolio</CardTitle>
                      <CardDescription>Financial performance across major portfolios.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockPortfolios.map(p => ({
                          id: p.id,
                          name: p.name,
                          budget: p.kpis.budgetBurn,
                          capacity: p.kpis.capacityForecast
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="budget" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Budget Burn %" />
                          <Bar dataKey="capacity" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Capacity %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Recent Activity / Alerts */}
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Critical Alerts</CardTitle>
                      <CardDescription>Items requiring immediate governance review.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mockProjects.filter(p => p.ragStatus === 'Red').map(p => (
                        <div key={`alert-project-${p.id}`} className="flex gap-4 p-3 rounded-lg bg-red-50 border border-red-100">
                          <AlertCircle className="text-red-600 shrink-0" size={20} />
                          <div>
                            <p className="text-sm font-semibold text-red-900">{p.name}</p>
                            <p className="text-xs text-red-700">Status: Red - Resource shortage</p>
                          </div>
                        </div>
                      ))}
                      {mockDemands.filter(d => !d.readiness.costInputs).map(d => (
                        <div key={`alert-demand-${d.id}`} className="flex gap-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                          <Clock className="text-amber-600 shrink-0" size={20} />
                          <div>
                            <p className="text-sm font-semibold text-amber-900">{d.name}</p>
                            <p className="text-xs text-amber-700">Missing cost inputs for 2026</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'demands' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Demand Pipeline</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2"><Filter size={14} /> Filter</Button>
                    <Button size="sm" className="bg-indigo-600">New Demand</Button>
                  </div>
                </div>
                <Card className="border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Budget (2026)</TableHead>
                        <TableHead>Readiness</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDemands.map((demand) => (
                        <TableRow key={demand.id}>
                          <TableCell className="font-mono text-xs text-slate-500">{demand.id}</TableCell>
                          <TableCell className="font-medium">{demand.name}</TableCell>
                          <TableCell><StatusBadge status={demand.status} /></TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              demand.priority === 'Critical' ? 'text-red-600 border-red-200 bg-red-50' : 
                              demand.priority === 'High' ? 'text-amber-600 border-amber-200 bg-amber-50' : ''
                            }>
                              {demand.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>${demand.estimatedBudget.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <CheckCircle2 size={16} className={demand.readiness.assessment ? 'text-emerald-500' : 'text-slate-200'} />
                              <CheckCircle2 size={16} className={demand.readiness.businessCase ? 'text-emerald-500' : 'text-slate-200'} />
                              <CheckCircle2 size={16} className={demand.readiness.costInputs ? 'text-emerald-500' : 'text-slate-200'} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon"><MoreVertical size={16} /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Project Portfolio</h2>
                  <Button size="sm" className="bg-indigo-600">Add Project</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockProjects.map((project) => (
                    <Card key={project.id} className="border-slate-200 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-mono text-slate-500">{project.id}</p>
                          <RAGBadge status={project.ragStatus} />
                        </div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>{project.status}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Budget Forecast</span>
                          <span className="font-semibold">${project.budget.forecast.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full" 
                            style={{ width: `${(project.budget.actual / project.budget.forecast) * 100}%` }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase">Next Milestone</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-slate-400" />
                            <span>{project.milestones.find(m => m.status !== 'Completed')?.name || 'All completed'}</span>
                          </div>
                        </div>
                      </CardContent>
                      <Separator />
                      <div className="p-4 flex justify-between items-center">
                        <span className="text-xs text-slate-400">Updated {project.lastUpdated}</span>
                        <Button variant="ghost" size="sm" className="text-indigo-600">Details <ChevronRight size={14} /></Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'portfolios' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Portfolio Performance</h2>
                  <Button size="sm" className="bg-indigo-600">Portfolio Settings</Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {mockPortfolios.map((portfolio) => (
                    <Card key={portfolio.id} className="border-slate-200">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{portfolio.name}</CardTitle>
                          <Badge variant="outline">{portfolio.manager}</Badge>
                        </div>
                        <CardDescription>ID: {portfolio.id}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-2xl font-bold text-indigo-600">{portfolio.kpis.budgetBurn}%</p>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Budget Burn</p>
                          </div>
                          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-2xl font-bold text-blue-600">{portfolio.kpis.capacityForecast}%</p>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Capacity</p>
                          </div>
                          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-2xl font-bold text-amber-600">{portfolio.kpis.atRiskProjects}</p>
                            <p className="text-xs text-slate-500 uppercase font-semibold">At Risk</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-900">Active Initiatives</h4>
                          <div className="space-y-2">
                            {mockProjects.filter(p => p.portfolioId === portfolio.id).map(p => (
                              <div key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${p.ragStatus === 'Red' ? 'bg-red-500' : p.ragStatus === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                  <span className="text-sm font-medium">{p.name}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">{p.id}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">SharePoint Documents</h2>
                  <Button variant="outline" size="sm" className="gap-2"><ExternalLink size={14} /> Open SharePoint</Button>
                </div>
                <Card className="border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium flex items-center gap-3">
                            <FileText size={18} className="text-indigo-500" />
                            {doc.name}
                          </TableCell>
                          <TableCell><Badge variant="outline">{doc.category}</Badge></TableCell>
                          <TableCell className="uppercase text-xs font-bold text-slate-500">{doc.type}</TableCell>
                          <TableCell>{doc.lastModified}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Download size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

          </div>
        </div>

        {/* AI Agent Floating Chat */}
        <AnimatePresence>
          {isChatOpen ? (
            <motion.div 
              initial={{ opacity: 0, x: 480 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 480 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 bottom-0 right-0 w-[480px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] border-l border-slate-200 flex flex-col z-50 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white flex items-center justify-between relative overflow-hidden shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,white_0%,transparent_70%)] animate-[pulse_8s_infinite]" />
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-inner">
                    <MessageSquare size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">PPM AI Orchestrator</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-xs text-indigo-100 font-medium">Intelligent Agent Online</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                    onClick={() => {
                      setChatHistory([]);
                      setChatInput('');
                    }}
                    title="Reset Chat"
                  >
                    <RotateCcw size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10 rounded-full h-8 w-8"
                    onClick={() => setIsChatOpen(false)}
                  >
                    <Minus size={20} />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 min-h-0 p-6 bg-slate-50/50" ref={scrollRef}>
                <div className="space-y-6 pb-4">
                  {chatHistory.length === 0 && (
                    <div className="text-center py-6 space-y-6">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200"
                      >
                        <MessageSquare className="text-white" size={32} />
                      </motion.div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-xl text-slate-900">I'm your PPM Orchestrator</h4>
                        <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
                          I can analyze your portfolio, update ServiceNow records, and retrieve SharePoint governance docs.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-3 px-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Suggested Actions</p>
                        {[
                          { text: "What is the status of Demand DMND001?", icon: <FileText size={14} /> },
                          { text: "Which projects are at risk?", icon: <AlertCircle size={14} /> },
                          { text: "Summarize risks for PRJ003", icon: <TrendingUp size={14} /> },
                          { text: "Find the latest RAID log", icon: <FileSearch size={14} /> }
                        ].map((prompt) => (
                          <button 
                            key={prompt.text}
                            onClick={() => handleSendMessage(prompt.text)}
                            className="text-left p-4 text-sm bg-white hover:bg-indigo-50 hover:border-indigo-200 rounded-2xl border border-slate-200 transition-all shadow-sm flex items-center gap-3 group"
                          >
                            <span className="p-1.5 bg-slate-50 group-hover:bg-white rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors">
                              {prompt.icon}
                            </span>
                            <span className="font-medium text-slate-700 group-hover:text-indigo-900">{prompt.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[90%] p-4 rounded-2xl text-sm shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 prose prose-slate prose-sm max-w-none'
                      }`}>
                        {msg.role === 'model' ? (
                          <div dangerouslySetInnerHTML={{ __html: msg.parts[0].text.replace(/\n/g, '<br/>') }} />
                        ) : (
                          msg.parts[0].text
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1.5 shadow-sm">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  {chatHistory.length > 0 && !isTyping && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center pt-4"
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setChatHistory([]);
                          setChatInput('');
                        }}
                        className="rounded-full bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-50 gap-2 shadow-sm"
                      >
                        <RotateCcw size={14} />
                        Start New Conversation
                      </Button>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="p-5 bg-white border-t border-slate-100 shrink-0 relative z-10">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex gap-3"
                >
                  <div className="relative flex-1">
                    <Input 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="w-full bg-slate-50 border-slate-200 rounded-2xl py-6 pl-4 pr-12 focus-visible:ring-indigo-500 transition-all shadow-inner"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 shrink-0 transition-transform active:scale-95">
                    <Send size={20} />
                  </Button>
                </form>
                <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
                  Powered by Gemini 3.1 Flash
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-50">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-indigo-50 text-indigo-700 text-sm font-bold flex items-center gap-2 mb-1"
              >
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                Ask PPM Agent
              </motion.div>
              <motion.button
                layoutId="chat-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatOpen(true)}
                className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.4)] flex items-center justify-center relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <MessageSquare size={28} className="relative z-10" />
                
                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 animate-[ping_2s_infinite] opacity-20" />
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, change, icon, trend }: { title: string, value: string, change: string, icon: React.ReactNode, trend?: 'up' | 'down' }) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden relative">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-50 rounded-lg">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend === 'up' ? '+12%' : '-4%'}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          <p className="text-xs text-slate-400 mt-1">{change}</p>
        </div>
      </CardContent>
    </Card>
  );
}

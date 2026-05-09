import { useState, useEffect, useMemo } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  NavLink, 
  useLocation,
  useNavigate,
  Navigate
} from "react-router-dom";
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from "./lib/firebase";
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  User
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { 
  Video, 
  LayoutDashboard, 
  FolderKanban, 
  CreditCard, 
  Settings, 
  Plus, 
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  Box,
  Layers,
  Activity,
  UserGroup,
  ShieldCheck,
  ChevronDown,
  Monitor,
  Cpu,
  History,
  Archive,
  Menu,
  X,
  Play,
  Download,
  Share2,
  MoreVertical,
  Volume2,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Project, TaskStatus } from "./types";

// --- Components ---

const Sidebar = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "控制面板", path: "/dashboard" },
    { icon: <Plus size={18} />, label: "创作空间", path: "/generator" },
    { icon: <CreditCard size={18} />, label: "算力中心", path: "/billing" },
    { icon: <Box size={18} />, label: "分镜管线", path: "/storyboard" },
    { icon: <FolderKanban size={18} />, label: "项目引擎", path: "/projects" },
    { icon: <Archive size={18} />, label: "资源归档", path: "/library" },
    { icon: <Activity size={18} />, label: "执行队列", path: "/jobs" },
  ];

  const adminItems = [
    { icon: <ShieldCheck size={18} />, label: "管理后台", path: "/admin" },
    { icon: <Settings size={18} />, label: "偏好设置", path: "/settings" },
  ];

  return (
    <aside className="w-64 forge-border bg-[#080808] flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="font-black text-lg tracking-tighter uppercase italic">VideoForge</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
        <div className="space-y-1">
          <p className="tech-label px-3 mb-2">核心引擎 / Core Engine</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="space-y-1">
          <p className="tech-label px-3 mb-2">系统管理 / System</p>
          {adminItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-white/10 text-white border border-white/10" 
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
          <img src={user.photoURL || ""} className="w-8 h-8 rounded-lg border border-white/10" alt="头像" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white/80">{user.displayName}</p>
            <p className="text-[10px] font-mono opacity-30 truncate">专业版会员 / PRO_PLUS</p>
          </div>
          <button onClick={onLogout} className="text-white/20 hover:text-rose-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3">
          <div className="flex justify-between text-[10px] font-mono text-indigo-400/60 mb-2 uppercase tracking-wider">
            <span>存储配额 / Quota</span>
            <span>72%</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[72%] shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
          </div>
        </div>
      </div>
    </aside>
  );
};

const Header = ({ title }: { title: string }) => {
  return (
    <header className="glass-header h-16 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-1 h-6 bg-indigo-500 rounded-full" />
        <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Zap size={14} className="text-amber-400 fill-amber-400" />
          <span className="text-[11px] font-mono font-bold tracking-tighter">1,250 算力点 / CREDITS</span>
        </div>
        <button className="forge-button-primary scale-90">
          <Plus size={16} /> 升级至企业版
        </button>
      </div>
    </header>
  );
};

// --- Pages ---

const Dashboard = ({ tasks }: { tasks: Task[] }) => {
  const stats = [
    { label: "活跃任务", value: tasks.filter(t => t.status === 'processing').length || "08", icon: <Activity size={18} />, color: "#4F46E5" },
    { label: "存储占用", value: "42.8GB", icon: <Archive size={18} />, color: "#10B981" },
    { label: "生成成功率", value: "99.4%", icon: <CheckCircle2 size={18} />, color: "#6366F1" },
    { label: "平均渲染时长", value: "114s", icon: <Clock size={18} />, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="forge-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="tech-label">{stat.label}</span>
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-white/40">
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-black font-mono tracking-tighter relative z-10">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Monitor size={14} className="text-indigo-400" /> 实时任务流 (Live Engine Stream)
            </h3>
            <button className="text-[10px] font-mono text-white/30 hover:text-white transition-colors">查看全部日志 / ALL_LOGS_→</button>
          </div>
          
          <div className="forge-panel rounded-2xl overflow-hidden border-2 border-white/5">
            <div className="grid grid-cols-[1fr_3fr_1.5fr_1fr] p-4 bg-white/5 text-[10px] font-mono font-black uppercase tracking-widest text-white/20 border-b border-white/5">
              <span>任务 ID</span>
              <span>提示词背景 / Prompt Context</span>
              <span>引擎状态</span>
              <span>时间戳</span>
            </div>
            <div className="divide-y divide-white/5">
              {tasks.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-20 italic">
                  <Cpu size={48} strokeWidth={1} className="mb-4" />
                  <p className="text-sm font-mono uppercase tracking-[0.3em]">未检测到活跃信号 / NO_SIGNAL</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="grid grid-cols-[1fr_3fr_1.5fr_1fr] p-4 items-center hover:bg-white/[0.02] transition-colors group">
                    <span className="text-[11px] font-mono font-bold text-white/40">#{task.id.slice(-6).toUpperCase()}</span>
                    <div className="pr-10">
                      <p className="text-xs font-medium truncate italic text-white/60 mb-1">“{task.prompt}”</p>
                      <div className="flex gap-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{task.providerId}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/5 uppercase">{task.taskType}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${task.status === "success" ? "bg-emerald-500" : task.status === "failed" ? "bg-rose-500" : "bg-amber-500 animate-pulse"}`} />
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider">{task.status === 'processing' ? '正在渲染' : task.status === 'success' ? '生成完成' : '等待分配'}</span>
                      </div>
                      <div className="w-24 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${task.progress}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-white/20">{task.createdAt?.toDate?.()?.toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest px-2">算力资源分配 (Compute Allocation)</h3>
          <div className="forge-panel rounded-2xl p-6 space-y-6">
            <AllocationItem label="VRAM 显存池 (H100/A100)" percentage={88} color="#FF4E00" />
            <AllocationItem label="分布式渲染集群" percentage={64} color="#4F46E5" />
            <AllocationItem label="并行推理节点" percentage={31} color="#10B981" />
            <div className="pt-4 border-t border-white/5">
              <p className="tech-label mb-4">模型服务商在线状态 / Provider Status</p>
              <div className="space-y-3">
                <ProviderStatus name="OpenAI Sora" status="busy" />
                <ProviderStatus name="Runway Gen-3" status="online" />
                <ProviderStatus name="Luma Dream Machine" status="online" />
                <ProviderStatus name="Kling AI 1.5" status="online" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const AllocationItem = ({ label, percentage, color }: { label: string, percentage: number, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-[11px] font-mono">
      <span className="text-white/40">{label}</span>
      <span className="text-white font-black">{percentage}%</span>
    </div>
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <div 
        className="h-full shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-1000" 
        style={{ width: `${percentage}%`, backgroundColor: color }} 
      />
    </div>
  </div>
);

const ProviderStatus = ({ name, status }: { name: string, status: "online" | "busy" | "offline" }) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
    <span className="text-[11px] font-medium text-white/60">{name}</span>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${status === "online" ? "bg-emerald-500" : status === "busy" ? "bg-amber-500" : "bg-rose-500"}`} />
      <span className="text-[10px] font-mono opacity-40 uppercase">{status}</span>
    </div>
  </div>
);

import { GeneratorWorkspace } from "./components/generator/Editor";

// --- Auxiliary Pages ---

const JobsCenter = ({ tasks }: { tasks: Task[] }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-end">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tighter italic">执行队列 / Execution Queue</h3>
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest">分布式显卡实时渲染状态监控</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.length === 0 ? (
        <div className="p-10 forge-panel rounded-2xl border-dashed opacity-20 flex flex-col items-center col-span-full">
           <Cpu size={48} className="mb-4" />
           <p className="font-mono text-[10px] uppercase tracking-widest">等待任务心跳信号 / Awaiting signal...</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} className="forge-panel p-5 rounded-2xl space-y-4 hover:border-indigo-500/30 transition-colors">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-mono font-bold text-indigo-400">#{task.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs font-black uppercase tracking-tighter truncate w-40">{task.modelName || 'Neural Engine'}</p>
               </div>
               <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${task.status === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'}`}>
                 {task.status.toUpperCase()}
               </span>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-mono opacity-30 uppercase">
                  <span>推理进度 / Inference</span>
                  <span>{task.progress}%</span>
               </div>
               <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${task.progress}%` }} />
               </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const BillingPortal = () => (
  <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
    <div className="flex flex-col items-center text-center space-y-4">
       <CreditCard size={40} className="text-indigo-400" />
       <h1 className="text-4xl font-black uppercase tracking-tighter italic">算力额度与订阅服务</h1>
       <p className="text-white/40 max-w-lg text-sm">算力是 VideoForge 的燃料。高性能模型（如 Sora）会比普通渲染引擎消耗更多“算力燃料”。</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PlanCard title="入门级 / Starter" price="¥0" features={["每月 50 算力点", "普通生成优先级", "仅基础模型访问", "最高 720p 分辨率"]} />
      <PlanCard title="专业工作室 / Pro" price="¥328" active features={["每月 1,000 算力点", "高优先级排队", "访问完整模型库", "支持 4K 专业渲染"]} />
      <PlanCard title="企业级 / Enterprise" price="定制化" features={["无限算力额度", "专用 GPU 集群独占", "API/SDK 集成权限", "团队协作与角色管控"]} />
    </div>
  </div>
);

const PlanCard = ({ title, price, features, active }: { title: string, price: string, features: string[], active?: boolean }) => (
  <div className={`forge-panel p-8 rounded-3xl space-y-8 flex flex-col relative ${active ? 'border-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.2)] scale-105 z-10' : 'opacity-60 hover:opacity-100 transition-all'}`}>
    <div className="space-y-2">
      <h3 className="tech-label">{title}</h3>
      <div className="flex items-end gap-1">
        <span className="text-4xl font-black">{price}</span>
        <span className="text-xs text-white/30 mb-1">/ 月</span>
      </div>
    </div>
    <div className="space-y-4 flex-1">
      {features.map(f => (
        <div key={f} className="flex items-center gap-3 text-xs font-medium text-white/70">
           <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
           {f}
        </div>
      ))}
    </div>
    <button className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] ${active ? 'bg-indigo-500 text-white' : 'bg-white/5 border border-white/10'}`}>
       {active ? '管理当前订阅' : '立即升级'}
    </button>
  </div>
);

const AssetsLibrary = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/library/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setItems(data.videos || []);
    } catch (e) {
      console.error("Fetch assets failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets("futuristic city");
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="搜索全球 4K 素材库..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAssets(search)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors font-mono"
          />
          <button 
            onClick={() => fetchAssets(search)}
            className="px-8 py-3 bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-[0_10px_20px_rgba(79,70,229,0.2)]"
          >
            搜索 / SEARCH
          </button>
       </div>

       {loading ? (
         <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">正在连接神经资源库...</p>
         </div>
       ) : (
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map(item => (
              <div key={item.id} className="aspect-[9/16] forge-panel rounded-2xl overflow-hidden group relative cursor-pointer">
                 <img src={item.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt="素材" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute bottom-3 left-3 right-3 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-black truncate mb-1">ID: PXL_{item.id}</p>
                    <div className="flex gap-2">
                       <span className="text-indigo-400 font-bold uppercase">4K_RAW</span>
                       <span className="text-white/40">SDR</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>
       )}
    </div>
  );
};

// --- Auth Boilerplate ---

const Login = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden scanline">
      {/* Background visual artifacts */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full forge-panel p-10 rounded-[2.5rem] relative z-10 border-2 border-white/5"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-indigo-500 rounded-[1.25rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] mb-6 transform -rotate-3">
            <Zap size={36} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white text-center">VideoForge AI</h1>
          <p className="text-white/40 font-mono text-[10px] tracking-[0.4em] uppercase mt-2">下一代 AIGC 生成引擎 / NEXT_GEN_PROD</p>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
            <p className="text-sm text-white/60 leading-relaxed">
              专为创作工作室打造的 <span className="text-indigo-400 font-bold">多模型自动编排</span> 视频生成平台。
            </p>
          </div>

          <button 
            onClick={onLogin}
            className="w-full bg-white text-black py-4 px-6 flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            使用 Google 账号登录
          </button>

          <div className="flex items-center justify-center gap-8 pt-8 border-t border-white/5">
            <div className="flex flex-col items-center gap-1 opacity-20">
               <ShieldCheck size={16} />
               <span className="text-[10px] font-mono">SOC2_安全认证</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-20">
               <Cpu size={16} />
               <span className="text-[10px] font-mono">CUDA_加速</span>
            </div>
            <div className="flex flex-col items-center gap-1 opacity-20">
               <Layers size={16} />
               <span className="text-[10px] font-mono">混合渲染</span>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="mt-12 text-center relative z-10">
        <p className="tech-label opacity-20 mb-2">系统集群状态 / Systems Status</p>
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-mono text-white/30 uppercase">生成节点 I / ONLINE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-mono text-white/30 uppercase">API 代理 II / ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "tasks");
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono gap-4">
        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-indigo-500 animate-loading-bar" />
        </div>
        <span className="tech-label opacity-40">Initializing Engine...</span>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-[#ECECEC] flex font-sans">
        <Sidebar user={user} onLogout={handleLogout} />
        
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <Routes>
            <Route path="/dashboard" element={
              <div className="flex flex-col h-full overflow-hidden">
                <Header title="控制面板 / DASHBOARD" />
                <main className="p-8 flex-1 overflow-y-auto"><Dashboard tasks={tasks} /></main>
              </div>
            } />
            <Route path="/generator" element={
              <div className="flex flex-col h-full overflow-hidden">
                <Header title="视频创意工作台 / GENERATOR" />
                <GeneratorWorkspace user={user} />
              </div>
            } />
            <Route path="/storyboard" element={
               <div className="flex flex-col h-full overflow-hidden">
                 <Header title="剧情管线 / STORYBOARD" />
                 <main className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center opacity-20 italic">
                       <Layers size={64} className="mx-auto mb-4" />
                       <p className="font-mono text-sm uppercase tracking-[0.5em]">模块校准中 / CALIBRATING</p>
                    </div>
                 </main>
               </div>
            } />
            <Route path="/projects" element={
               <div className="flex flex-col h-full overflow-hidden">
                 <Header title="项目浏览器 / EXPLORER" />
                 <main className="p-8 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="forge-panel p-12 rounded-3xl border-dashed opacity-20 border-white/20 flex flex-col items-center justify-center gap-4 hover:opacity-100 hover:border-indigo-500 transition-all cursor-pointer">
                          <Plus size={48} strokeWidth={1} />
                          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">初始化新项目</span>
                       </div>
                    </div>
                 </main>
               </div>
            } />
            <Route path="/library" element={
               <div className="flex flex-col h-full overflow-hidden">
                 <Header title="神经资源归档 / ASSETS" />
                 <main className="p-8 flex-1 overflow-y-auto"><AssetsLibrary /></main>
               </div>
            } />
            <Route path="/jobs" element={
               <div className="flex flex-col h-full overflow-hidden">
                 <Header title="分布式执行队列 / QUEUE" />
                 <main className="p-8 flex-1 overflow-y-auto"><JobsCenter tasks={tasks} /></main>
               </div>
            } />
            <Route path="/billing" element={
               <div className="flex flex-col h-full overflow-hidden">
                 <Header title="算力燃料与账户 / BILLING" />
                 <main className="p-8 flex-1 overflow-y-auto"><BillingPortal /></main>
               </div>
            } />
            <Route path="/admin" element={<Header title="主控中心 / ADMIN" />} />
            <Route path="/settings" element={<Header title="参数配置 / SETTINGS" />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}


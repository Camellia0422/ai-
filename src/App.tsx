import { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Project, TaskStatus } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center font-mono">
        <Loader2 className="animate-spin text-[#141414]" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFD1DC] flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-white/40 rotate-12"><Sparkles size={48} /></div>
        <div className="absolute bottom-20 right-10 text-white/40 -rotate-12"><Sparkles size={64} /></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#87CEEB]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#FFB7C5]/30 rounded-full blur-3xl"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border-2 border-[#1A1A1A] p-10 rounded-3xl anime-shadow-lg relative z-10"
        >
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="bg-[#FF69B4] p-4 text-white rounded-2xl anime-shadow rotate-3 shadow-lg">
              <Video size={40} />
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-tight uppercase italic text-[#1A1A1A] drop-shadow-sm">UniVideo AI</h1>
              <div className="h-1.5 w-full bg-[#87CEEB] mt-1 -skew-x-12"></div>
            </div>
          </div>
          <p className="text-[#1A1A1A] font-medium text-center mb-10 leading-relaxed text-sm">
            一站式专业级 <span className="text-[#FF69B4] font-bold italic">AI 视频生成</span> 编排平台。
            <br />
            开启你的二次创作新纪元 ✨
          </p>
          <button 
            onClick={handleLogin}
            className="w-full bg-[#1A1A1A] text-white py-4 px-6 flex items-center justify-center gap-3 hover:bg-[#333] transition-all font-black uppercase tracking-widest text-sm rounded-xl anime-shadow-hover"
          >
            使用 Google 账号登录
          </button>
          <div className="mt-10 pt-6 border-t-2 border-dashed border-[#1A1A1A]/10 flex justify-between items-center text-[10px] uppercase font-mono font-bold text-[#1A1A1A]/40">
            <span>VER. 1.0.0</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>API 系统在线</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#1A1A1A] font-sans flex relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 border-r-2 border-[#1A1A1A] flex flex-col hidden md:flex relative z-10 bg-white shadow-xl">
        <div className="p-8 border-b-2 border-[#1A1A1A] bg-[#FFD1DC]/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#1A1A1A] p-1.5 rounded-lg text-white">
              <Video size={20} />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">UniVideo</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono font-black text-[#FF69B4] bg-[#FF69B4]/10 px-2 py-0.5 rounded w-fit">
            <Sparkles size={8} /> 视频生成编排中枢
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          <NavButton 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")}
            icon={<LayoutDashboard size={20} />}
            label="控制面板"
          />
          <NavButton 
            active={activeTab === "projects"} 
            onClick={() => setActiveTab("projects")}
            icon={<FolderKanban size={20} />}
            label="项目管理"
          />
          <NavButton 
            active={activeTab === "billing"} 
            onClick={() => setActiveTab("billing")}
            icon={<CreditCard size={20} />}
            label="财务账单"
          />
          <NavButton 
            active={activeTab === "settings"} 
            onClick={() => setActiveTab("settings")}
            icon={<Settings size={20} />}
            label="系统设置"
          />
        </nav>

        <div className="p-6 border-t-2 border-[#1A1A1A] bg-[#87CEEB]/5">
          <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl border-2 border-[#1A1A1A] anime-shadow">
            <img src={user.photoURL || ""} className="w-10 h-10 border-2 border-[#1A1A1A] rounded-xl" alt="Avatar" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate uppercase tracking-tighter">{user.displayName}</p>
              <p className="text-[10px] font-mono font-bold opacity-40 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#1A1A1A] bg-white hover:bg-rose-50 transition-all text-xs font-black uppercase rounded-xl anime-shadow-hover"
          >
            <LogOut size={16} /> 退出系统
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-0">
        <header className="h-20 border-b-2 border-[#1A1A1A] bg-white flex items-center justify-between px-10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-[#FF69B4] -skew-x-12"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-black opacity-30 uppercase leading-none">CURRENT_LOCATION</span>
              <span className="text-sm font-black uppercase tracking-widest">{activeTab}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-[#FF69B4] text-white py-3 px-6 rounded-xl anime-shadow flex items-center gap-3 hover:bg-[#FF1493] transition-all text-xs font-black uppercase tracking-widest anime-shadow-hover"
          >
            <Plus size={20} /> 开启新生成任务
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#FFF9F5]/80 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <StatCard label="活动任务" value={tasks.filter(t => ["queued", "submitted", "processing"].includes(t.status)).length} icon={<Clock size={20} />} color="#FFD1DC" />
                  <StatCard label="生成成功率" value="98.2%" icon={<CheckCircle2 size={20} />} color="#C1F0D1" />
                  <StatCard label="平均排队时长" value="~45s" icon={<Sparkles size={20} />} color="#D1E9F0" />
                  <StatCard label="燃料额度" value="12.4k" icon={<CreditCard size={20} />} color="#F0E1C1" />
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-6 border-b-4 border-double border-[#1A1A1A] pb-4">
                    <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center">
                        <LayoutDashboard size={20} />
                      </div>
                      实时任务流 <span className="text-[#FF69B4] italic underline sm:no-underline">STREAM_V1</span>
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] font-mono font-black opacity-30 bg-[#1A1A1A]/5 px-3 py-1 rounded-full uppercase">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                      自动同步中
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#1A1A1A] rounded-2xl overflow-hidden anime-shadow-lg">
                    <div className="grid grid-cols-[1.2fr_2.5fr_1.2fr_1fr_0.8fr] p-5 border-b-2 border-[#1A1A1A] bg-[#F5F5F5] text-[10px] font-mono font-black uppercase tracking-wider text-[#1A1A1A]/40">
                      <span>任务 ID / 模型</span>
                      <span>提示词 (PROMPT)</span>
                      <span>状态</span>
                      <span>创建时间</span>
                      <span className="text-right">操作</span>
                    </div>
                    <div className="divide-y-2 divide-[#1A1A1A]/5">
                      {tasks.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                          <div className="flex justify-center opacity-10">
                            <Video size={64} />
                          </div>
                          <p className="opacity-40 italic font-medium text-sm">暂无任务记录。请点击右上角开启新生成 ✨</p>
                        </div>
                      ) : (
                        tasks.map((task) => (
                          <TaskRow key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "projects" && (
              <motion.div
                key="projects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                <ProjectCard name="商业广告项目 A" count={12} lastUpdate="2小时前" />
                <ProjectCard name="社媒素材批量生成" count={45} lastUpdate="5小时前" />
                <ProjectCard name="Veo 实验工作区" count={3} lastUpdate="1天前" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border-2 border-[#1A1A1A] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] rounded-3xl overflow-hidden"
            >
              <div className="p-8 border-b-2 border-[#1A1A1A] bg-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF69B4]/10 rounded-full -mr-16 -mt-16"></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic relative z-10">初始化生成序列</h3>
                <button onClick={() => setIsCreating(false)} className="hover:rotate-90 transition-transform p-1 relative z-10">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#1A1A1A] text-white rounded-full">✕</div>
                </button>
              </div>
              <CreateTaskForm user={user} onSuccess={() => setIsCreating(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-[#1A1A1A]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white border-4 border-[#1A1A1A] anime-shadow-lg rounded-[40px] overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 h-[600px]">
                <div className="bg-[#1A1A1A] flex items-center justify-center relative p-1">
                  {selectedTask.status === "success" && selectedTask.result_url ? (
                    <video 
                      src={selectedTask.result_url} 
                      controls 
                      autoPlay 
                      className="max-h-full w-full object-contain rounded-3xl"
                    />
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 border-4 border-[#FF69B4] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-[#FF69B4] font-black uppercase tracking-widest text-xs">渲染引擎计算中...</p>
                      <p className="text-white/40 font-mono text-[10px] uppercase">Status: {selectedTask.status}</p>
                    </div>
                  )}
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="bg-[#FF69B4] text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-[#1A1A1A]">#{selectedTask.id.slice(-6)}</span>
                    <span className="bg-white text-[#1A1A1A] text-[10px] font-black px-3 py-1 rounded-full border-2 border-[#1A1A1A] uppercase">{selectedTask.providerId}</span>
                  </div>
                </div>

                <div className="p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-[10px] font-mono font-black text-[#1A1A1A]/30 uppercase mb-1">PROMPT_METADATA</h4>
                        <p className="text-sm font-medium leading-relaxed italic">&ldquo;{selectedTask.prompt}&rdquo;</p>
                      </div>
                      <button onClick={() => setSelectedTask(null)} className="p-2 hover:rotate-90 transition-transform">
                        <div className="w-8 h-8 flex items-center justify-center border-2 border-[#1A1A1A] rounded-full font-black">✕</div>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 border-2 border-[#1A1A1A] rounded-2xl bg-[#F5F5F5]">
                        <span className="text-[9px] font-mono font-black opacity-30 block mb-1 uppercase">RESOLUTION</span>
                        <span className="text-sm font-black italic">1080P_HD</span>
                      </div>
                      <div className="p-4 border-2 border-[#1A1A1A] rounded-2xl bg-[#F5F5F5]">
                        <span className="text-[9px] font-mono font-black opacity-30 block mb-1 uppercase">RATIO</span>
                        <span className="text-sm font-black italic">16:9_WIDE</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between text-xs font-black uppercase">
                          <span>生成进度</span>
                          <span>{selectedTask.progress}%</span>
                       </div>
                       <div className="w-full h-4 bg-[#F5F5F5] border-2 border-[#1A1A1A] rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedTask.progress}%` }}
                            className="h-full bg-[#FF69B4]"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 bg-[#1A1A1A] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs anime-shadow-hover transition-all">
                      下载高清资源
                    </button>
                    <button className="px-6 border-2 border-[#1A1A1A] rounded-2xl font-black uppercase text-xs hover:bg-[#F5F5F5] transition-colors">
                      复制提示词
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-2 rounded-2xl ${
        active 
          ? "bg-[#1A1A1A] text-white border-[#1A1A1A] anime-shadow" 
          : "bg-transparent text-[#1A1A1A]/60 border-transparent hover:border-[#1A1A1A]/10 hover:text-[#1A1A1A] hover:bg-white/50"
      }`}
    >
      <span className={active ? "text-[#FF69B4]" : ""}>{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div 
      className="bg-white border-2 border-[#1A1A1A] p-6 rounded-2xl anime-shadow relative overflow-hidden group hover:-translate-y-1 transition-transform"
      style={{ backgroundColor: `${color}10` }}
    >
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 group-hover:scale-150 transition-transform" style={{ backgroundColor: color }}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-mono font-black uppercase tracking-tighter opacity-50">{label}</span>
        <div className="p-2 bg-white border-2 border-[#1A1A1A] rounded-lg anime-shadow">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black font-mono tracking-tighter relative z-10">{value}</div>
    </div>
  );
}

function TaskRow({ task, onClick }: { task: Task, onClick: () => void }) {
  const statusLabels: Record<TaskStatus, string> = {
    created: "已创建",
    queued: "排队中",
    validating: "校验中",
    submitted: "已提交",
    processing: "生成中",
    success: "成功",
    failed: "失败",
    refunded: "已退点",
    cancelled: "已取消",
  };

  const statusColors: Record<TaskStatus, string> = {
    created: "border-blue-400 bg-blue-50 text-blue-700",
    queued: "border-amber-400 bg-amber-50 text-amber-700",
    validating: "border-amber-400 bg-amber-50 text-amber-700",
    submitted: "border-indigo-400 bg-indigo-50 text-indigo-700",
    processing: "border-indigo-400 bg-indigo-50 text-indigo-700 animate-pulse",
    success: "border-emerald-400 bg-emerald-100 text-emerald-800",
    failed: "border-rose-400 bg-rose-50 text-rose-700",
    refunded: "border-gray-400 bg-gray-50 text-gray-700",
    cancelled: "border-gray-300 bg-gray-50 text-gray-400",
  };

  return (
    <div 
      onClick={onClick}
      className="grid grid-cols-[1.2fr_2.5fr_1.2fr_1fr_0.8fr] p-5 items-center hover:bg-[#87CEEB]/5 transition-colors cursor-pointer group"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-[#FF69B4] rounded-full"></div>
          <span className="text-[10px] font-mono font-black uppercase">#{task.id.slice(-6)}</span>
        </div>
        <span className="text-[10px] uppercase font-black opacity-30 pl-3">{task.modelName}</span>
      </div>
      <div className="text-xs truncate italic pr-6 font-medium text-[#1A1A1A]/70 italic group-hover:text-[#1A1A1A] transition-colors">
        &ldquo;{task.prompt}&rdquo;
      </div>
      <div>
        <span className={`text-[10px] uppercase font-black px-3 py-1 border-2 rounded-full inline-flex items-center gap-1.5 shadow-sm ${statusColors[task.status]}`}>
          {task.status === "processing" && <Loader2 size={10} className="animate-spin" />}
          {statusLabels[task.status]}
        </span>
      </div>
      <div className="text-[10px] font-mono font-black opacity-30 uppercase tracking-tighter">
        {task.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '等待中'}
      </div>
      <div className="flex justify-end">
        <button className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-white group-hover:bg-[#1A1A1A] group-hover:text-white transition-all transform hover:rotate-12 anime-shadow">
           <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ProjectCard({ name, count, lastUpdate }: { name: string, count: number, lastUpdate: string }) {
  return (
    <div className="bg-white border-2 border-[#1A1A1A] p-8 rounded-3xl anime-shadow-lg hover:-translate-y-2 transition-all cursor-pointer group hover:bg-[#87CEEB]/5">
      <div className="h-40 bg-[#F5F5F5] mb-6 rounded-2xl border-2 border-dashed border-[#1A1A1A]/10 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-all group-hover:border-[#FF69B4]/30 relative overflow-hidden">
         <div className="absolute inset-0 flex items-center justify-center">
            <FolderKanban size={64} strokeWidth={1} className="group-hover:scale-110 group-hover:text-[#FF69B4] transition-all" />
         </div>
         <div className="absolute top-2 right-2 flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#1A1A1A]/10"></div>
            <div className="w-2 h-2 rounded-full bg-[#1A1A1A]/10"></div>
         </div>
      </div>
      <h3 className="text-lg font-black uppercase tracking-tighter truncate mb-3">{name}</h3>
      <div className="flex justify-between items-center text-[10px] font-mono font-black opacity-30 uppercase tracking-widest border-t-2 border-[#1A1A1A]/5 pt-4">
        <span className="flex items-center gap-1.5"><Sparkles size={10} /> {count} 资源</span>
        <span>最近更新: {lastUpdate}</span>
      </div>
    </div>
  );
}

function CreateTaskForm({ user, onSuccess }: { user: User, onSuccess: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState("veo"); 
  const [ratio, setRatio] = useState("16:9");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const taskData = {
        userId: user.uid,
        taskNo: "TASK-" + Date.now().toString().slice(-6),
        taskType: "text_to_video",
        providerId: provider,
        modelName: provider === "veo" ? "VEO_STUDIO_V1" : provider === "kling" ? "KLING_1.5_TURBO" : "RUNWAY_GEN3_H",
        prompt,
        status: "created",
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "tasks"), taskData);

      await fetch("/api/v1/tasks/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: docRef.id,
          userId: user.uid,
          prompt,
          model_provider: provider
        })
      });

      onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "tasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
      <div className="space-y-3">
        <label className="text-[10px] font-mono uppercase font-black tracking-widest text-[#1A1A1A]/40 block pl-1">
          SCENE_PROMPT / 场景描述
        </label>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF69B4] to-[#87CEEB] rounded-2xl opacity-10 group-focus-within:opacity-30 transition-opacity blur"></div>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="例如：初音未来在数字深海中漫步，周围环绕着发光的彩色鲸鱼，风格极其华丽，4k精度..."
            className="relative w-full h-40 bg-white border-2 border-[#1A1A1A] rounded-2xl p-6 text-sm font-sans focus:outline-none focus:ring-0 anime-shadow resize-none placeholder:opacity-30 font-medium"
          />
          <div className="absolute bottom-4 right-4 text-[10px] font-mono font-black text-[#1A1A1A]/20">
            AI_ASSIST_READY
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase font-black tracking-widest text-[#1A1A1A]/40 block pl-1">
            CORE_MODEL / 核心模型
          </label>
          <div className="relative">
            <select 
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-white border-2 border-[#1A1A1A] rounded-xl p-4 text-xs font-black uppercase tracking-tighter anime-shadow appearance-none cursor-pointer hover:bg-[#F5F5F5] transition-colors"
            >
              <option value="veo">Google Veo (顶尖写实)</option>
              <option value="kling">可灵 Kling (日系动态)</option>
              <option value="runway">Runway Gen-3 (大厂标准)</option>
              <option value="wan">万 Wan (高性价比)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase font-black tracking-widest text-[#1A1A1A]/40 block pl-1">
            RATIO / 画面比例
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["16:9", "9:16", "1:1"].map(r => (
              <button 
                key={r}
                type="button"
                onClick={() => setRatio(r)}
                className={`py-3 text-[10px] font-black border-2 rounded-xl transition-all anime-shadow-hover ${ratio === r ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] anime-shadow' : 'bg-white border-[#1A1A1A] text-[#1A1A1A]'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 border-t-4 border-double border-[#1A1A1A]/10">
        <button 
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-white py-5 rounded-2xl anime-shadow flex items-center justify-center gap-4 disabled:opacity-50 transition-all hover:bg-[#333] hover:scale-[1.01] active:scale-[0.99] group shadow-2xl"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <span className="text-base font-black tracking-widest">启动生成引擎</span>
              <div className="p-1 bg-[#FF69B4] rounded group-hover:rotate-12 transition-transform shadow-lg">
                <Sparkles size={20} />
              </div>
            </>
          )}
        </button>
        <div className="flex justify-between items-center mt-5 text-[9px] font-mono font-black text-[#1A1A1A]/30 uppercase px-1">
          <div className="flex items-center gap-1">
            <CreditCard size={10} /> 消耗: 120 燃料
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} /> 预估: ~120秒
          </div>
        </div>
      </div>
    </form>
  );
}


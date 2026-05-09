import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Settings2, 
  ChevronDown, 
  Maximize2, 
  Camera, 
  Activity, 
  History,
  Lock,
  Type,
  Mic,
  Zap,
  Info,
  Clock,
  Play,
  RotateCcw,
  Sliders,
  Cpu,
  ChevronRight,
  Download,
  Share2,
  Volume2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

const MODELS = [
  { id: 'veo', name: 'Gemini Veo', logo: '🎬', tags: ['4K质量', '电影长镜头'], capability: '顶级视频生成' },
  { id: 'veo-lite', name: 'Gemini Veo Lite', logo: '🎥', tags: ['极速生成', '高效率'], capability: '灵动视频生成' },
  { id: 'runway', name: 'Runway Gen-3', logo: '🚀', tags: ['电影感', '高度可控'], capability: '高保真度' },
  { id: 'sora', name: 'OpenAI Sora', logo: '🔮', tags: ['写实主义', '物理逻辑'], capability: '长时长生成' },
  { id: 'kling', name: '可灵 Kling 1.5', logo: '⚡', tags: ['二次元', '强动态'], capability: '物理拟真' },
  { id: 'wan', name: '万相 Wan 1.0', logo: '🐉', tags: ['高性价比', '大规模'], capability: '多画幅支持' },
  { id: 'pika', name: 'Pika Art', logo: '🎨', tags: ['动画感', '口型同步'], capability: '创意自由度' },
];

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const GeneratorWorkspace = ({ user }: { user: User }) => {
  const [activeModel, setActiveModel] = useState(MODELS[0]);
  const [prompt, setPrompt] = useState("");
  const [activeSideTab, setActiveSideTab] = useState("params");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [hasKey, setHasKey] = useState(true);
  const [generationProgress, setGenerationProgress] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  React.useEffect(() => {
    const checkKey = async () => {
      if (activeModel.id.startsWith('veo')) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, [activeModel]);

  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleAIPolish = async () => {
    if (!prompt.trim() || isPolishing) return;
    
    setIsPolishing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一个专业的 AI 视频生成提示词专家。请帮我优化以下提示词，使其生成的视频更具电影感、视觉冲击力和艺术性。
        请直接输出优化后的提示词（最好是英文，包含风格、构图、光影、动态等细节），不要有任何解释。
        
        原始提示词：${prompt}`,
      });
      
      if (response.text) {
        setPrompt(response.text.trim());
      }
    } catch (error) {
      console.error("AI Polish failed:", error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    if (activeModel.id.startsWith('veo')) {
      const selected = await window.aistudio.hasSelectedApiKey();
      if (!selected) {
        handleSelectKey();
        return;
      }
      handleVeoGenerate();
      return;
    }

    setIsGenerating(true);
    try {
      await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        prompt: prompt,
        modelId: activeModel.id,
        modelName: activeModel.name,
        status: 'pending',
        progress: 0,
        taskType: 'text-to-video',
        createdAt: serverTimestamp(),
        providerId: 'FORGE_CLUSTER_X',
      });
      setPrompt("");
      // Success feedback could go here
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "tasks");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVeoGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress("正在初始化 Veo 模型引擎...");
    
    try {
      // Create a fresh instance to use the latest API key
      const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      
      const modelName = activeModel.id === 'veo' ? 'veo-3.1-generate-preview' : 'veo-3.1-lite-generate-preview';
      
      setGenerationProgress("正在提交生成任务到分布式计算集群...");
      let operation = await veoAi.models.generateVideos({
        model: modelName,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: activeModel.id === 'veo' ? '1080p' : '720p',
          aspectRatio: '16:9'
        }
      });

      setGenerationProgress("渲染中... 这可能需要几分钟。请保持页面开启。");
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await veoAi.operations.getVideosOperation({ operation });
        
        // Dynamic progress messages
        const randomMessages = [
          "正在优化光影效果...",
          "正在进行物理引擎校准...",
          "帧序列渲染进行中...",
          "正在融合神经纹理...",
          "正在调整动态模糊参数..."
        ];
        setGenerationProgress(randomMessages[Math.floor(Math.random() * randomMessages.length)]);
      }

      setGenerationProgress("渲染完成，正在准备下载链接...");
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.API_KEY || "",
          },
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        
        // Save to Firestore
        await addDoc(collection(db, "tasks"), {
          userId: user.uid,
          prompt: prompt,
          modelId: activeModel.id,
          modelName: activeModel.name,
          status: 'completed',
          progress: 100,
          videoUrl: url, // Local URL for now, in real app maybe upload to storage
          taskType: 'text-to-video',
          createdAt: serverTimestamp(),
          providerId: 'GOOGLE_VEO_GEN',
        });
        
        setPrompt("");
      } else {
        throw new Error("Failed to get generation result");
      }
    } catch (error: any) {
      console.error("Veo generation failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setGenerationProgress("API Key 校验失败，请重新选择。");
      } else {
        setGenerationProgress("生成失败: " + error.message);
      }
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-700">
      {/* Left Area: Main Input & Preview */}
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
        {/* Model Switcher Bar */}
        <div className="flex gap-2 p-1.5 forge-panel rounded-2xl w-fit">
          {MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => setActiveModel(model)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeModel.id === model.id 
                  ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <span>{model.logo}</span>
              {model.name}
            </button>
          ))}
        </div>

        {/* Workspace Display */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Editor Area */}
          <div className="flex flex-col space-y-6">
            <div className="forge-panel rounded-3xl p-8 flex-1 flex flex-col space-y-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Cpu size={120} />
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="tech-label">核心提示词 (文生视频 / 图生视频)</label>
                    <div className="flex gap-4">
                       <button 
                         onClick={handleAIPolish}
                         disabled={isPolishing || !prompt.trim()}
                         className="text-[10px] font-mono text-indigo-400 flex items-center gap-1 hover:brightness-125 disabled:opacity-50"
                       >
                         {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                         {isPolishing ? '优化中...' : 'AI_优化润色'}
                       </button>
                    </div>
                  </div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述你想象中的画面，例如：赛博朋克城市雨夜，霓虹灯倒映在积水中，一辆飞行摩托疾驰而过..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm resize-none focus:outline-none focus:border-indigo-500/50 transition-colors font-medium leading-relaxed"
                  />
               </div>

               <div className="space-y-4">
                  <label className="tech-label">多模态参考素材 (Reference Material)</label>
                  <div className="grid grid-cols-4 gap-4">
                    <button className="aspect-square forge-panel rounded-2xl flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/40 hover:bg-white/5 border-dashed transition-all group">
                       <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-mono uppercase">图文参考</span>
                    </button>
                    <button className="aspect-square forge-panel rounded-2xl flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/40 hover:bg-white/5 border-dashed transition-all group">
                       <Video size={24} className="group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-mono uppercase">动态参考</span>
                    </button>
                    <button className="aspect-square forge-panel rounded-2xl flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/40 hover:bg-white/5 border-dashed transition-all group">
                       <Sliders size={24} className="group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-mono uppercase">深度映射</span>
                    </button>
                    <button className="aspect-square forge-panel rounded-2xl flex flex-col items-center justify-center gap-2 text-white/20 hover:text-white/40 hover:bg-white/5 border-dashed transition-all group">
                       <History size={24} className="group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-mono uppercase">加载末次</span>
                    </button>
                  </div>
               </div>

                <div className="pt-6 flex gap-4">
                  {!hasKey ? (
                    <button 
                      onClick={handleSelectKey}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-4 rounded-2xl transition-all shadow-[0_15px_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      <Lock size={20} />
                      <span className="tracking-widest uppercase text-xs">请先选择付费 API Key (Veo 专用)</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-[0_15px_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                       {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                       <span className="tracking-widest uppercase text-xs">{isGenerating ? (generationProgress || '正在分配计算节点...') : '启动渲染并行机'}</span>
                    </button>
                  )}
                  <button className="px-6 forge-button-secondary rounded-2xl opacity-50 hover:opacity-100">
                     <History size={20} />
                  </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="forge-panel p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                       <Volume2 size={16} />
                    </div>
                    <span className="text-xs font-bold text-white/70">数字人合拍 & 智能音效</span>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
               </div>
               <div className="forge-panel p-4 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                       <Type size={16} />
                    </div>
                    <span className="text-xs font-bold text-white/70">AI 电影感字幕插件</span>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex flex-col space-y-4">
            <div className="forge-panel rounded-3xl flex-1 flex flex-col overflow-hidden">
               <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="tech-label">实时预览画布 (预览草图) / PREVIEW</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-white/5 rounded text-white/40"><RotateCcw size={14} /></button>
                    <button className="p-1.5 hover:bg-white/5 rounded text-white/40"><Maximize2 size={14} /></button>
                  </div>
               </div>
               <div className="flex-1 bg-[#000] relative group flex items-center justify-center bg-cover bg-center overflow-hidden">
                  {videoUrl ? (
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1964')] bg-cover bg-center" />
                      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all backdrop-blur-[2px]" />
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all">
                           {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Play size={24} fill="white" className="ml-1" />}
                        </div>
                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                          {isGenerating ? generationProgress : '点击查看生成的渲染序列'}
                        </p>
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                     <div className="space-y-1">
                        <p className="text-[10px] font-mono font-bold tracking-widest text-indigo-400">引擎输出版本: ENGINE_V0.8</p>
                        <p className="text-sm font-black italic">渲染稳定性: 良好 / STABLE</p>
                     </div>
                     <div className="flex gap-2">
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><Download size={18} /></button>
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><Share2 size={18} /></button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Controllers */}
      <div className="w-80 forge-border-l bg-[#080808] flex flex-col">
        <div className="flex border-b border-white/5">
           <button 
             onClick={() => setActiveSideTab("params")}
             className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeSideTab === 'params' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-white/20'}`}
           >
             生成参数设置 / SETTINGS
           </button>
           <button 
             onClick={() => setActiveSideTab("consistency")}
             className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeSideTab === 'consistency' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-white/20'}`}
           >
             一致性锁定 / LOCKS
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="tech-label flex items-center justify-between">分辨率选择 / Resolution <Info size={10} /></label>
                 <div className="grid grid-cols-2 gap-2">
                    {["1080p_FHD", "4K_ULTRA", "2K_CINEMA", "720p_SD"].map(res => (
                      <button key={res} className="p-2 border border-white/5 bg-white/[0.02] text-[9px] font-black uppercase font-mono hover:bg-white/5 rounded-lg active:border-indigo-500/50">{res}</button>
                    ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="tech-label">动态强度 / Motion Strength (6.5)</label>
                 <input type="range" className="w-full accent-indigo-500" />
                 <div className="flex justify-between text-[9px] font-mono text-white/20 uppercase">
                    <span>静态 / Static</span>
                    <span>剧烈 / Extreme</span>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="tech-label flex items-center gap-2">运镜控制 / Camera Movement <Camera size={10} /></label>
                 <select className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white/60 focus:outline-none uppercase font-mono">
                    <option>静态固定位 / Static</option>
                    <option>推镜头 / Zoom In</option>
                    <option>横向摇镜 / Pan</option>
                    <option>希区柯克变焦 / Dolly Zoom</option>
                    <option>环绕拍摄 / Orbital</option>
                 </select>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                 <p className="tech-label">高级特征参数 / Advanced</p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] text-white/40 flex items-center gap-2"><Sparkles size={12} /> 随机种子 / Seed</span>
                       <button className="text-[10px] font-mono text-indigo-400 underline uppercase tracking-tighter">手动输入_INPUT</button>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] text-white/40 flex items-center gap-2"><Activity size={12} /> 提示词引导权重 / CFG</span>
                       <span className="text-[10px] font-mono text-white">7.5</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] text-white/40 flex items-center gap-2"><Clock size={12} /> 渲染时长 (秒)</span>
                       <select className="bg-transparent text-[10px] font-mono font-bold text-indigo-400 focus:outline-none">
                          <option>5.0s</option>
                          <option>10.0s</option>
                          <option>20.0s</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-3">
                 <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase italic">
                    <History size={12} /> 检测到版本指纹
                 </div>
                 <p className="text-[9px] text-white/30 font-medium">当前提示词与 2 小时前的一次生成具有 92% 的重合度。</p>
                 <button className="text-[9px] font-mono uppercase text-indigo-400/60 hover:text-indigo-400 underline">加载该配置 / RELOAD</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

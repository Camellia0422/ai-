import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import * as admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Firebase Admin (using internal credentials if available, or just mocking for local dev)
  // In AI Studio, we can check if firebase-applet-config exists or if we should use default
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "ai-code-ex"
      });
    }
  } catch (err) {
    console.error("Firebase Admin init failed:", err);
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), localized: "zh-CN" });
  });

  // 视频生成任务处理逻辑
  app.post("/api/v1/tasks/video", async (req, res) => {
    const { prompt, model_provider, userId, taskId } = req.body;
    
    const veoKey = process.env.VEO_API_KEY;
    if (model_provider === "veo" && !veoKey) {
      console.warn("警告: VEO_API_KEY 未在系统密钥中配置。");
    }

    console.log(`[UniVideo 后端] 接收到生成请求: 用户=${userId}, 模型=${model_provider}, 提示词=${prompt}`);
    
    // 定时模拟任务状态转换 (仅用于 MVP 演示)
    const db = admin.firestore();
    const taskRef = db.collection("tasks").doc(taskId);

    try {
      // 1. 模拟进入队列
      await taskRef.update({ status: "queued", updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      
      // 2. 模拟正在处理 (3秒后)
      setTimeout(async () => {
        await taskRef.update({ status: "processing", progress: 35, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        
        // 3. 模拟完成 (8秒后)
        setTimeout(async () => {
          await taskRef.update({ 
            status: "success", 
            progress: 100, 
            finalCost: 120,
            result_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", // 模拟生成的视频地址
            updatedAt: admin.firestore.FieldValue.serverTimestamp() 
          });
          console.log(`[UniVideo 后端] 任务 ${taskId} 已通过 ${model_provider} 生成成功`);
        }, 8000);
      }, 3000);

      res.status(202).json({ 
        message: "任务已提交至多模型编排引擎",
        task_id: taskId,
        status: "queued"
      });
    } catch (error) {
      console.error("提交任务失败:", error);
      res.status(500).json({ error: "内部调度引擎错误" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UniVideo Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Server failed to start:", err);
});

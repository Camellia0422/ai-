export type TaskStatus = 
  | "created" 
  | "queued" 
  | "validating" 
  | "submitted" 
  | "processing" 
  | "success" 
  | "failed" 
  | "refunded" 
  | "cancelled";

export type TaskType = "text_to_video" | "image_to_video" | "reference_video";

export interface Task {
  id: string;
  taskNo: string;
  userId: string;
  teamId?: string;
  projectId?: string;
  taskType: TaskType;
  providerId: string;
  modelName: string;
  prompt: string;
  negativePrompt?: string;
  status: TaskStatus;
  progress: number;
  estimatedCost?: number;
  finalCost?: number;
  result_url?: string;
  errorMessage?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  teamId?: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: "user" | "admin";
  createdAt: any;
}

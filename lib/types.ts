export type Gender = "male" | "female";
export type Sender = "other" | "me";
export type MessageSource = "manual" | "screenshot";
export type ReplyStyle = "温暖真诚型" | "幽默轻松型" | "高段位型";

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ReplySuggestion {
  style: ReplyStyle;
  emoji: string;
  text: string;
  strategy: string;
}

export interface Analysis {
  intent: {
    surface: string;
    real: string;
    emotion: string;
    subtext: string;
  };
  risks: {
    misunderstand: string;
    minefield: string;
    atmosphere: string;
  };
  replies: ReplySuggestion[];
  advanced?: string;
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  time?: string | null;
  source: MessageSource;
  analysis: Analysis | null;
  selectedReplyIndex: number | null;
}

export interface Workspace {
  id: string;
  name: string;
  gender: Gender;
  relationship: string;
  goal: string;
  messages: Message[];
}

export interface AppData {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  apiConfig: ApiConfig;
}

export interface ExtractedMessage {
  id: string;
  sender: Sender;
  content: string;
  time?: string | null;
}

export interface AnalyzeRequest {
  workspace: Pick<Workspace, "gender" | "relationship" | "goal">;
  history: Array<{ role: "user" | "assistant" | "user_selected_reply"; content: string }>;
  newMessage: string;
  apiConfig: ApiConfig;
}

export interface AnalyzeResponse {
  analysis: Analysis;
}

export interface RegenerateRepliesRequest {
  workspace: Pick<Workspace, "gender" | "relationship" | "goal">;
  message: string;
  existingAnalysis: Pick<Analysis, "intent" | "risks">;
  previousReplies: string[];
  history: AnalyzeRequest["history"];
  apiConfig: ApiConfig;
}

export interface RegenerateRepliesResponse {
  replies: ReplySuggestion[];
}

export interface ExtractFromScreenshotRequest {
  images: string[];
  apiConfig: ApiConfig;
}

export interface ExtractFromScreenshotResponse {
  messages: Array<Omit<ExtractedMessage, "id">>;
}

export type PlaygroundLibrary = {
  name: string;
  type: "js" | "css";
  url: string;
};

export type PlaygroundLogEntry = {
  method: "log" | "error" | "warn" | "info" | "debug" | "table" | string;
  args: string[];
  timestamp: string;
};

export type PlaygroundProject = {
  id: string | null;
  title?: string;
  html?: string;
  css?: string;
  javascript?: string;
  cdn_libraries?: PlaygroundLibrary[] | string;
  updated_at?: string;
  view_count?: number;
  is_public?: boolean;
};

export type PlaygroundTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  html?: string;
  css?: string;
  javascript?: string;
  cdn_libraries?: PlaygroundLibrary[] | string;
};

export type PlaygroundUser = {
  email: string;
  name: string;
  role: string;
  token?: string;
};


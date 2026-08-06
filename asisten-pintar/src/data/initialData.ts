import { DocumentItem, ChatSession, AISettings, PromptTemplate } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_CHATS: ChatSession[] = [];

export const INITIAL_SETTINGS: AISettings = {
  serverUrl: 'http://43.159.43.50:20128/v1',
  modelName: 'cbcn/glm-5.0-turbo',
  apiKey: 'sk-c60b5b633b8ba408-ekg39z-70bf55ae',
  googleDriveConnected: false
};


export const PROMPT_TEMPLATES: PromptTemplate[] = [];


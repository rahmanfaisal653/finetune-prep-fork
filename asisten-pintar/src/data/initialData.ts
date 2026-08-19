import { DocumentItem, ChatSession, AISettings, PromptTemplate } from '../types';

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_CHATS: ChatSession[] = [];

export const INITIAL_SETTINGS: AISettings = {
  serverUrl: 'http://localhost:8000/v1',
  modelName: 'cbcn/glm-5.0-turbo',
  apiKey: '',
  googleDriveConnected: false
};


export const PROMPT_TEMPLATES: PromptTemplate[] = [];

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  bigint,
  index,
  integer,
  customType,
} from 'drizzle-orm/pg-core';

export const tsvector = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'tsvector';
  },
});

// pgvector 类型
export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)';
  },
});

import { createHash, randomBytes } from 'crypto';

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  usernameIdx: index('users_username_idx').on(table.username),
}));

// 登录会话表
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  tokenIdx: index('sessions_token_idx').on(table.token),
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
}));

// 文件夹表（树形结构）
export const folders = pgTable('folders', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: uuid('parent_id').references((): any => folders.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  parentIdIdx: index('folders_parent_id_idx').on(table.parentId),
}));

// 文件表
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
  blobUrl: text('blob_url').notNull(),
  blobPath: text('blob_path').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }),
  mimeType: varchar('mime_type', { length: 100 }),
  contentPreview: text('content_preview'),
  fullContent: text('full_content'),
  contentHash: varchar('content_hash', { length: 64 }),
  searchVector: tsvector('search_vector'),
  // 向量嵌入相关字段
  embedding: vector('embedding'),
  embeddingUpdatedAt: timestamp('embedding_updated_at'),
  chunkCount: integer('chunk_count').default(0),
  processedForEmbedding: boolean('processed_for_embedding').default(false),
  parsedAt: timestamp('parsed_at'),
  parseStatus: varchar('parse_status', { length: 20 }).default('pending'),
  parseError: text('parse_error'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  folderIdIdx: index('files_folder_id_idx').on(table.folderId),
  contentHashIdx: index('files_content_hash_idx').on(table.contentHash),
  parseStatusIdx: index('files_parse_status_idx').on(table.parseStatus),
  uploadedAtIdx: index('files_uploaded_at_idx').on(table.uploadedAt),
  searchVectorIdx: index('files_search_vector_idx').using('gin', table.searchVector),
  // 向量索引（需要先在数据库中创建）
  // embeddingIdx: index('files_embedding_idx').using('ivfflat', table.embedding).using('vector_cosine_ops'),
}));

// 标签表
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  color: varchar('color', { length: 7 }).default('#3B82F6'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  nameIdx: index('tags_name_idx').on(table.name),
}));

// 文件-标签关联表（多对多）
export const fileTags = pgTable('file_tags', {
  fileId: uuid('file_id').references(() => files.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
  taggedAt: timestamp('tagged_at').defaultNow(),
}, (table) => ({
  fileIdIdx: index('file_tags_file_id_idx').on(table.fileId),
  tagIdIdx: index('file_tags_tag_id_idx').on(table.tagId),
}));

// PDF解析任务表
export const parseTasks = pgTable('parse_tasks', {
  id: varchar('id', { length: 100 }).primaryKey(),
  fileId: uuid('file_id').references(() => files.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // pending, downloading, parsing, saving, completed, failed
  message: text('message'),
  markdownLength: integer('markdown_length'),
  parseResult: text('parse_result'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
}, (table) => ({
  fileIdIdx: index('parse_tasks_file_id_idx').on(table.fileId),
  statusIdx: index('parse_tasks_status_idx').on(table.status),
  expiresAtIdx: index('parse_tasks_expires_at_idx').on(table.expiresAt),
}));

// PDF 解析队列表（串行处理）
export const parseQueue = pgTable('parse_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileId: uuid('file_id').references(() => files.id, { onDelete: 'cascade' }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending/processing/completed/failed
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  fileIdIdx: index('parse_queue_file_id_idx').on(table.fileId),
  statusIdx: index('parse_queue_status_idx').on(table.status, table.createdAt),
}));

// AI配置表
export const aiConfigs = pgTable('ai_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: varchar('provider', { length: 50 }).notNull(),
  apiKeyEncrypted: text('api_key_encrypted').notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  providerIdx: index('ai_configs_provider_idx').on(table.provider),
  isDefaultIdx: index('ai_configs_is_default_idx').on(table.isDefault),
}));

// 聊天会话表
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileId: uuid('file_id').references(() => files.id, { onDelete: 'cascade' }),
  aiConfigId: uuid('ai_config_id').references(() => aiConfigs.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  fileIdIdx: index('chat_sessions_file_id_idx').on(table.fileId),
  createdAtIdx: index('chat_sessions_created_at_idx').on(table.createdAt),
}));

// 聊天消息表
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => chatSessions.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  sessionIdIdx: index('chat_messages_session_id_idx').on(table.sessionId),
  createdAtIdx: index('chat_messages_created_at_idx').on(table.createdAt),
}));

// 文档内容块表（用于RAG检索）
export const documentChunks = pgTable('document_chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileId: uuid('file_id').references(() => files.id, { onDelete: 'cascade' }).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  // 向量嵌入
  embedding: vector('embedding'),
  // 全文搜索向量
  searchVector: tsvector('search_vector'),
  // 位置信息
  startPosition: integer('start_position').notNull(),
  endPosition: integer('end_position').notNull(),
  pageIndex: integer('page_index'),
  // 元数据（JSON格式，可存储标题、章节等信息）
  metadata: text('metadata').$type<any>(), // 使用 text 存储 JSON
  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  fileIdIdx: index('document_chunks_file_id_idx').on(table.fileId),
  fileIdChunkIdx: index('document_chunks_file_id_chunk_idx').on(table.fileId, table.chunkIndex),
  searchVectorIdx: index('document_chunks_search_vector_idx').using('gin', table.searchVector),
  // 向量索引（需要先在数据库中创建）
  // embeddingIdx: index('document_chunks_embedding_idx').using('ivfflat', table.embedding).using('vector_cosine_ops'),
}));

// ============================================
// 新增：智能对话相关表
// ============================================

// 对话会话表（支持多文档对话）
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  // 关联的文档（支持多文档对话，存储为 JSON 字符串）
  fileIds: text('file_ids'),
  // 会话配置（存储为 JSON 字符串）
  config: text('config'),
  // 统计信息
  messageCount: integer('message_count').default(0),
  totalTokensUsed: integer('total_tokens_used').default(0),
  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('conversations_user_idx').on(table.userId),
  updatedAtIdx: index('conversations_updated_at_idx').on(table.updatedAt),
}));

// 消息表（支持源引用和上下文）
export const conversationMessages = pgTable('conversation_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'assistant' | 'system'
  content: text('content').notNull(),
  // AI 使用的上下文（用于追溯，存储为 JSON 字符串）
  contextChunks: text('context_chunks'),
  contextFiles: text('context_files'),
  // 引用的来源文档片段（存储为 JSON 字符串）
  sources: text('sources'),
  // Token 使用统计
  tokensUsed: integer('tokens_used'),
  // 时间戳
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  conversationIdIdx: index('conversation_messages_conversation_id_idx').on(table.conversationId),
  createdAtIdx: index('conversation_messages_created_at_idx').on(table.createdAt),
}));

// 类型导出
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type FileTag = typeof fileTags.$inferSelect;
export type NewFileTag = typeof fileTags.$inferInsert;

export type AIConfig = typeof aiConfigs.$inferSelect;
export type NewAIConfig = typeof aiConfigs.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;

// PDF 解析队列类型
export type ParseQueue = typeof parseQueue.$inferSelect;
export type NewParseQueue = typeof parseQueue.$inferInsert;

// 新增：智能对话相关类型
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;

export type ConversationMessage = typeof conversationMessages.$inferSelect;
export type NewConversationMessage = typeof conversationMessages.$inferInsert;

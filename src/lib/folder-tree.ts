import { Folder } from '../db/schema';

export interface FolderNode extends Omit<Folder, 'createdAt' | 'updatedAt'> {
  children: FolderNode[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function buildTree(folders: Folder[], parentId: string | null = null): FolderNode[] {
  return folders
    .filter(f => f.parentId === parentId)
    .map(folder => ({
      ...folder,
      id: String(folder.id),
      parentId: folder.parentId ? String(folder.parentId) : null,
      createdAt: folder.createdAt || new Date(),
      updatedAt: folder.updatedAt || new Date(),
      children: buildTree(folders, String(folder.id)),
    }));
}

export function flattenTree(nodes: FolderNode[]): Folder[] {
  const result: Folder[] = [];
  const traverse = (node: FolderNode) => {
    result.push({
      id: node.id,
      name: node.name,
      parentId: node.parentId,
      createdAt: typeof node.createdAt === 'string' ? new Date(node.createdAt) : node.createdAt,
      updatedAt: typeof node.updatedAt === 'string' ? new Date(node.updatedAt) : node.updatedAt,
    });
    node.children.forEach(traverse);
  };
  nodes.forEach(traverse);
  return result;
}

export function findPath(folders: Folder[], folderId: string): Folder[] {
  const path: Folder[] = [];
  let current: Folder | undefined = folders.find(f => f.id === folderId);

  while (current) {
    path.unshift(current);
    const parentId = current.parentId;
    current = parentId ? folders.find(f => f.id === parentId) : undefined;
  }

  return path;
}

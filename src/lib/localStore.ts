// IndexedDB wrapper for local-first blog post storage
// No external dependencies — raw IndexedDB API wrapped in promises

export interface LocalPost {
  slug: string;
  title: string;
  description: string;
  blocks: {
    id: string;
    type: "text" | "image";
    content: string;
    caption?: string;
  }[];
  headerImage: string;
  date: string;
  isDraft: boolean;
  sha: string;
  lastModified: number;
  syncStatus: "synced" | "pending" | "conflict";
}

const DB_NAME = "write-posts";
const STORE_NAME = "posts";
const DB_VERSION = 1;

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "slug" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePost(post: LocalPost): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ ...post, syncStatus: "pending", lastModified: Date.now() });
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getPost(slug: string): Promise<LocalPost | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(slug);
    request.onsuccess = () => {
      db.close();
      resolve(request.result as LocalPost | undefined);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function getAllPosts(): Promise<LocalPost[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      db.close();
      const posts = request.result as LocalPost[];
      posts.sort((a, b) => b.lastModified - a.lastModified);
      resolve(posts);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function deletePost(slug: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(slug);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function markSynced(slug: string, sha: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(slug);
    request.onsuccess = () => {
      const post = request.result as LocalPost | undefined;
      if (post) {
        store.put({ ...post, syncStatus: "synced" as const, sha });
      }
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getPendingPosts(): Promise<LocalPost[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.syncStatus === "pending");
}

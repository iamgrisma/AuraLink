// AuraLink — Media Routes
import { Hono } from 'hono';
import { authMiddleware, ownershipCheck } from '../middleware/auth.js';
import { validateUploadedFile } from '../utils/validators.js';

const media = new Hono();

// We do NOT protect the GET /media/:userId/:filename route so images load publicly.
media.get('/:userId/:filename', async (c) => {
  const userId = c.req.param('userId');
  const filename = c.req.param('filename');
  const path = `${userId}/${filename}`;
  
  try {
    const object = await c.env.BUCKET.get(path);
    if (!object) return c.json({ error: 'Image not found' }, 404);

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(object.body, { headers });
  } catch (err) {
    console.error('R2 get error:', err);
    return c.json({ error: 'Failed to retrieve image' }, 500);
  }
});

// Protect all write/list operations
media.use('/*', authMiddleware);

// --- Upload File ---
media.post('/', async (c) => {
  const user = c.get('user');
  const { username, id: userId } = user;
  
  try {
    const formData = await c.req.parseBody();
    const file = formData.file;
    const isPublic = formData.isPublic !== 'false';
    const type = formData.type || 'image';

    const validation = validateUploadedFile(file);
    if (!validation.valid) {
      return c.json({ error: validation.error }, 400);
    }

    const { results } = await c.env.DB.prepare('SELECT SUM(size) as totalSize FROM media_files WHERE username = ?')
      .bind(username).all();
    
    const userRecord = await c.env.DB.prepare('SELECT pro_status FROM users WHERE username = ?').bind(username).first();
    const isPro = userRecord?.pro_status === 'approved';
    const maxStorage = isPro ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if ((results[0].totalSize || 0) + file.size > maxStorage) {
      return c.json({ error: 'Storage limit exceeded' }, 403);
    }

    const uniqueId = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `${uniqueId}.${fileExtension}`;
    const objectKey = `${userId}/${fileName}`;

    await c.env.BUCKET.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    });

    const fileUrl = `/api/media/${objectKey}`;

    await c.env.DB.prepare('INSERT INTO media_files (id, username, filename, url, type, size, is_public) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(uniqueId, username, fileName, fileUrl, type, file.size, isPublic ? 1 : 0).run();

    return c.json({ message: 'Upload successful', url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

// --- List Files ---
media.get('/list/:username', ownershipCheck(), async (c) => {
  const username = c.req.param('username').trim().toLowerCase();
  try {
    const { results } = await c.env.DB.prepare('SELECT id, filename, url, size, created_at FROM media_files WHERE username = ? ORDER BY created_at DESC')
      .bind(username).all();
    return c.json(results);
  } catch {
    return c.json({ error: 'Failed to fetch media' }, 500);
  }
});

// --- Delete File ---
media.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  
  try {
    const fileRecord = await c.env.DB.prepare('SELECT username, url FROM media_files WHERE id = ?').bind(id).first();
    if (!fileRecord) return c.json({ error: 'File not found' }, 404);
    
    if (fileRecord.username !== user.username && user.role !== 'admin') {
      return c.json({ error: 'Forbidden: you can only delete your own files' }, 403);
    }
    
    // Extract R2 path from url. URL is /api/media/username/filename
    const r2Path = fileRecord.url.replace('/api/media/', '');
    
    await c.env.BUCKET.delete(r2Path);
    await c.env.DB.prepare('DELETE FROM media_files WHERE id = ?').bind(id).run();
    return c.json({ message: 'File deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

export default media;

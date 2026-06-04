import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
    cloneRepo,
    getFiles,
    getFileContent,
    explainFile,
    searchRepo,
    chatWithRepo,
    generateReadme,
    getRepoStatus,
    getArchitecture
} from '../controllers/repoController.js';

const router = express.Router();
router.use(requireAuth);

// Repo lifecycle
router.post('/clone', cloneRepo);
router.get('/:repoId/status', getRepoStatus);

// File browsing
router.get('/:repoId/files', getFiles);
router.get('/:repoId/files/:fileId', getFileContent);

// AI features
router.post('/:repoId/explain', explainFile); // POST { fileId } or { filePath }
router.post('/:repoId/search', searchRepo); // POST { query, topK? }
router.post('/:repoId/chat', chatWithRepo); // POST { message }
router.post('/:repoId/readme', generateReadme); // POST {}
router.get('/:repoId/architecture', getArchitecture);

export default router;
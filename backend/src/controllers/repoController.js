import pool from '../config/db.js';
import { cloneRepository, readRepositoryFiles, detectTechStack } from '../services/githubService.js';
import { embedRepoFiles, semanticSearch } from '../services/embeddingService.js';
import {
    explainFileWithAI,
    chatWithRepoAI,
    generateReadmeWithAI,
    generateArchitectureWithAI,
    generateRepoSummaryWithAI
} from '../services/aiService.js';

// ── POST /api/repos/clone ──────────────────────────────────────────────────
export const cloneRepo = async(req, res) => {
    const { githubUrl } = req.body;

    if (!githubUrl) {
        return res.status(400).json({ error: 'githubUrl is required' });
    }

    // Validate GitHub URL
    if (!githubUrl.startsWith('https://github.com/')) {
        return res.status(400).json({ error: 'Only GitHub URLs are supported (https://github.com/...)' });
    }

    try {
        const repoName = githubUrl.replace('https://github.com/', '').replace(/\.git$/, '');

        const result = await pool.query(
            `INSERT INTO repos (github_url, name, status) VALUES ($1, $2, 'cloning') RETURNING *`, [githubUrl, repoName]
        );

        const repo = result.rows[0];

        // Respond immediately — processing is async
        res.json({
            message: 'Repository cloning started',
            repoId: repo.id,
            name: repo.name,
            status: 'cloning'
        });

        // Fire-and-forget background processing
        processRepo(repo.id, githubUrl).catch(err =>
            console.error(`processRepo fatal error for ${repo.id}:`, err)
        );

    } catch (err) {
        console.error('cloneRepo error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ── Background Processing Pipeline ────────────────────────────────────────
const setStatus = (repoId, status) =>
    pool.query(`UPDATE repos SET status = $1 WHERE id = $2`, [status, repoId]);

const processRepo = async(repoId, githubUrl) => {
    try {
        // STEP 1 — Clone
        console.log(`[${repoId}] Cloning ${githubUrl}...`);
        const repoPath = await cloneRepository(githubUrl, repoId);

        // STEP 2 — Read files
        await setStatus(repoId, 'reading');
        console.log(`[${repoId}] Reading files...`);
        const files = readRepositoryFiles(repoPath);
        const techStack = detectTechStack(files);

        // STEP 3 — Save files to DB
        for (const file of files) {
            await pool.query(
                `INSERT INTO files (repo_id, path, content, language) VALUES ($1, $2, $3, $4)`, [repoId, file.path, file.content, file.language]
            );
        }

        // STEP 4 — Generate architecture + summary with AI
        await setStatus(repoId, 'analyzing');
        console.log(`[${repoId}] Generating architecture...`);

        const repoName = githubUrl.replace('https://github.com/', '').replace(/\.git$/, '');
        const [architecture, summary] = await Promise.all([
            generateArchitectureWithAI(repoName, techStack, files).catch(() => null),
            generateRepoSummaryWithAI(repoName, techStack, files.length, files).catch(() => null)
        ]);

        const architectureText = architecture ?
            (architecture.overview + '\n\n' + architecture.diagram) :
            null;

        await pool.query(
            `UPDATE repos SET tech_stack = $1, summary = $2, architecture = $3 WHERE id = $4`, [JSON.stringify(techStack), summary, architectureText, repoId]
        );

        // STEP 5 — Generate embeddings
        await setStatus(repoId, 'embedding');
        console.log(`[${repoId}] Generating embeddings for ${files.length} files...`);
        await embedRepoFiles(repoId, files);

        // STEP 6 — Done!
        await setStatus(repoId, 'ready');
        console.log(`[${repoId}] ✅ Ready! Tech: ${techStack.join(', ')}`);

    } catch (err) {
        console.error(`[${repoId}] processRepo error:`, err);
        await setStatus(repoId, 'error');
    }
};

// ── GET /api/repos/:repoId/status ──────────────────────────────────────────
export const getRepoStatus = async(req, res) => {
    const { repoId } = req.params;
    try {
        const result = await pool.query(
            `SELECT id, name, status, tech_stack, summary, architecture, created_at
             FROM repos WHERE id = $1`, [repoId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Repo not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── GET /api/repos/:repoId/files ───────────────────────────────────────────
export const getFiles = async(req, res) => {
    const { repoId } = req.params;
    try {
        const result = await pool.query(
            `SELECT id, path, language FROM files WHERE repo_id = $1 ORDER BY path`, [repoId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── GET /api/repos/:repoId/files/:fileId ──────────────────────────────────
export const getFileContent = async(req, res) => {
    const { repoId, fileId } = req.params;
    try {
        const result = await pool.query(
            `SELECT id, path, content, language, summary FROM files
             WHERE id = $1 AND repo_id = $2`, [fileId, repoId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ── POST /api/repos/:repoId/explain ───────────────────────────────────────
// Body: { fileId } OR { filePath }
export const explainFile = async(req, res) => {
    const { repoId } = req.params;
    const { fileId, filePath } = req.body;

    if (!fileId && !filePath) {
        return res.status(400).json({ error: 'fileId or filePath is required' });
    }

    try {
        // Fetch file from DB
        const query = fileId ?
            `SELECT * FROM files WHERE id = $1 AND repo_id = $2` :
            `SELECT * FROM files WHERE path = $1 AND repo_id = $2`;
        const param = fileId ? fileId : filePath;

        const result = await pool.query(query, [param, repoId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'File not found' });
        }

        const file = result.rows[0];

        if (!file.content || file.content.trim().length < 10) {
            return res.status(400).json({ error: 'File is empty or too short to explain' });
        }

        // If we already have a cached summary, return fast
        if (file.summary) {
            try {
                const cached = JSON.parse(file.summary);
                return res.json({...cached, cached: true });
            } catch {
                // summary is plain text, not JSON — continue to regenerate
            }
        }

        // Generate AI explanation
        const explanation = await explainFileWithAI(file.path, file.content, file.language);

        // Cache explanation in DB
        await pool.query(
            `UPDATE files SET summary = $1 WHERE id = $2`, [JSON.stringify(explanation), file.id]
        );

        res.json(explanation);

    } catch (err) {
        console.error('explainFile error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ── POST /api/repos/:repoId/search ────────────────────────────────────────
// Body: { query, topK? }
export const searchRepo = async(req, res) => {
    const { repoId } = req.params;
    const { query, topK = 6 } = req.body;

    if (!query || query.trim().length < 3) {
        return res.status(400).json({ error: 'query must be at least 3 characters' });
    }

    try {
        // Check repo is ready
        const repoResult = await pool.query(
            `SELECT status FROM repos WHERE id = $1`, [repoId]
        );
        if (repoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Repo not found' });
        }
        if (repoResult.rows[0].status !== 'ready') {
            return res.status(400).json({
                error: 'Repo is not ready yet',
                status: repoResult.rows[0].status
            });
        }

        const results = await semanticSearch(repoId, query, Math.min(topK, 10));

        // Group results by file
        const byFile = {};
        for (const r of results) {
            if (!byFile[r.filePath]) {
                byFile[r.filePath] = {
                    filePath: r.filePath,
                    language: r.language,
                    similarity: r.similarity,
                    chunks: []
                };
            }
            byFile[r.filePath].chunks.push({
                text: r.chunkText,
                similarity: r.similarity
            });
        }

        res.json({
            query,
            results: Object.values(byFile),
            totalChunks: results.length
        });

    } catch (err) {
        console.error('searchRepo error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ── POST /api/repos/:repoId/chat ──────────────────────────────────────────
// Body: { message, history? }
export const chatWithRepo = async(req, res) => {
    const { repoId } = req.params;
    const { message, history = [] } = req.body;

    if (!message || message.trim().length < 2) {
        return res.status(400).json({ error: 'message is required' });
    }

    try {
        // Get repo info
        const repoResult = await pool.query(
            `SELECT name, status, tech_stack FROM repos WHERE id = $1`, [repoId]
        );
        if (repoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Repo not found' });
        }

        const repo = repoResult.rows[0];
        if (repo.status !== 'ready') {
            return res.status(400).json({
                error: 'Repo is not ready yet',
                status: repo.status
            });
        }

        const techStack = repo.tech_stack || [];

        // Semantic search to find relevant code context
        const contextChunks = await semanticSearch(repoId, message, 6);

        if (contextChunks.length === 0) {
            return res.json({
                answer: "I couldn't find relevant code in this repository to answer your question. Try rephrasing or asking about a specific file or function.",
                sources: []
            });
        }

        // Generate AI answer
        const answer = await chatWithRepoAI(message, contextChunks, repo.name, techStack);

        // Return answer + source files used
        const sources = [...new Set(contextChunks.map(c => c.filePath))];

        res.json({ answer, sources, contextChunks });

    } catch (err) {
        console.error('chatWithRepo error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ── POST /api/repos/:repoId/readme ────────────────────────────────────────
export const generateReadme = async(req, res) => {
    const { repoId } = req.params;

    try {
        const repoResult = await pool.query(
            `SELECT name, status, tech_stack, architecture FROM repos WHERE id = $1`, [repoId]
        );
        if (repoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Repo not found' });
        }

        const repo = repoResult.rows[0];
        if (repo.status !== 'ready') {
            return res.status(400).json({
                error: 'Repo is not ready yet',
                status: repo.status
            });
        }

        // Get all files (paths + content snippets)
        const filesResult = await pool.query(
            `SELECT path, language, content FROM files WHERE repo_id = $1 ORDER BY path`, [repoId]
        );

        const techStack = repo.tech_stack || [];
        const readme = await generateReadmeWithAI(
            repo.name,
            techStack,
            filesResult.rows,
            repo.architecture
        );

        res.json({ readme, repoName: repo.name });

    } catch (err) {
        console.error('generateReadme error:', err);
        res.status(500).json({ error: err.message });
    }
};

// ── GET /api/repos/:repoId/architecture ───────────────────────────────────
export const getArchitecture = async(req, res) => {
    const { repoId } = req.params;
    try {
        const result = await pool.query(
            `SELECT r.name, r.tech_stack, r.architecture, r.summary,
                    COUNT(f.id) AS file_count
             FROM repos r
             LEFT JOIN files f ON r.id = f.repo_id
             WHERE r.id = $1
             GROUP BY r.id`, [repoId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Repo not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
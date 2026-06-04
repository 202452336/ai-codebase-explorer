import { pipeline } from '@xenova/transformers';
import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

let _extractor = null;
const getExtractor = async() => {
    if (!_extractor) {
        console.log('Loading embedding model (first time only)...');
        _extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-large');
    }
    return _extractor;
};

const chunkText = (text, chunkSize = 800, overlap = 100) => {
    const lines = text.split('\n');
    const chunks = [];
    let current = [];
    let count = 0;
    for (const line of lines) {
        current.push(line);
        count += line.length;
        if (count >= chunkSize) {
            chunks.push(current.join('\n'));
            const overlapLines = [];
            let ob = 0;
            for (let i = current.length - 1; i >= 0 && ob < overlap; i--) {
                overlapLines.unshift(current[i]);
                ob += current[i].length;
            }
            current = overlapLines;
            count = ob;
        }
    }
    if (current.length > 0) chunks.push(current.join('\n'));
    return chunks.filter(c => c.trim().length > 20);
};

const generateEmbeddings = async(texts) => {
    const extractor = await getExtractor();
    const results = await extractor(texts, { pooling: 'mean', normalize: true });
    // Convert tensor to proper array format
    if (results.tolist) {
        return results.tolist();
    } else if (results.data) {
        // Handle typed array
        const arrays = [];
        const itemSize = results.length > 0 ? results[0].length : 0;
        for (let i = 0; i < results.length; i++) {
            arrays.push(Array.from(results[i]));
        }
        return arrays;
    }
    return Array.isArray(results) ? results : [Array.from(results)];
};

export const embedRepoFiles = async(repoId, files) => {
    console.log(`Starting embedding for ${files.length} files in repo ${repoId}...`);
    let processed = 0;
    for (const file of files) {
        try {
            if (!file.content || file.content.trim().length < 30) continue;
            const fileResult = await pool.query(
                `SELECT id FROM files WHERE repo_id = $1 AND path = $2`, [repoId, file.path]
            );
            if (fileResult.rows.length === 0) continue;
            const fileId = fileResult.rows[0].id;
            const chunks = chunkText(file.content);
            if (chunks.length === 0) continue;
            const chunkTexts = chunks.map(c => `File: ${file.path}\n\n${c}`);
            const batchSize = 90;
            for (let b = 0; b < chunkTexts.length; b += batchSize) {
                const batch = chunkTexts.slice(b, b + batchSize);
                const embeddings = await generateEmbeddings(batch);
                for (let i = 0; i < batch.length; i++) {
                    await pool.query(
                        `INSERT INTO embeddings (repo_id, file_id, chunk_text, chunk_index, embedding)
                         VALUES ($1, $2, $3, $4, $5)`, [repoId, fileId, batch[i], b + i, JSON.stringify(embeddings[i])]
                    );
                }
                await new Promise(r => setTimeout(r, 100));
            }
            processed++;
            if (processed % 10 === 0) console.log(`  Embedded ${processed}/${files.length} files...`);
        } catch (err) {
            console.error(`  Failed to embed ${file.path}:`, err.message);
        }
    }
    console.log(`Embedding complete. Processed: ${processed}`);
    return { processed };
};

export const semanticSearch = async(repoId, query, topK = 6) => {
    try {
        const qEmbeddings = await generateEmbeddings([query]);
        const queryEmbedding = qEmbeddings[0];

        if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
            console.error('Query embedding is invalid:', queryEmbedding);
            return [];
        }

        // Get all embeddings for this repo
        const result = await pool.query(
            `SELECT e.id, e.chunk_text, e.chunk_index, e.embedding, f.path AS file_path, f.language
             FROM embeddings e
             JOIN files f ON e.file_id = f.id
             WHERE e.repo_id = $1
             LIMIT 500`, [repoId]
        );

        if (result.rows.length === 0) {
            console.log('No embeddings found in database for repo:', repoId);
            return [];
        }

        // Calculate cosine similarity
        const cosineSimilarity = (a, b) => {
            let dotProduct = 0;
            let normA = 0;
            let normB = 0;
            for (let i = 0; i < a.length; i++) {
                dotProduct += a[i] * b[i];
                normA += a[i] * a[i];
                normB += b[i] * b[i];
            }
            return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        };

        // Calculate similarities
        const scored = result.rows
            .map(row => {
                try {
                    const embedding = typeof row.embedding === 'string' ?
                        JSON.parse(row.embedding) :
                        row.embedding;

                    if (!Array.isArray(embedding)) {
                        console.warn('Invalid embedding format:', row.id);
                        return null;
                    }

                    const similarity = cosineSimilarity(queryEmbedding, embedding);
                    return {
                        ...row,
                        similarity: Math.max(0, similarity) // Clamp to 0-1 range
                    };
                } catch (err) {
                    console.error('Error processing embedding:', err.message);
                    return null;
                }
            })
            .filter(r => r !== null)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK)
            .map(row => ({
                filePath: row.file_path,
                language: row.language,
                chunkText: row.chunk_text,
                chunkIndex: row.chunk_index,
                similarity: row.similarity.toFixed(3)
            }));

        return scored;
    } catch (err) {
        console.error('semanticSearch error:', err.message);
        throw err;
    }
};
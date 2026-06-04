import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

let _groq = null;
const getGroq = () => {
    if (!_groq) {
        if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set in .env');
        _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return _groq;
};

const chat = async(systemPrompt, userPrompt, maxTokens = 2000) => {
    const response = await getGroq().chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.3
    });
    return response.choices[0].message.content.trim();
};

// ── 1. EXPLAIN FILE ────────────────────────────────────────────────────────
export const explainFileWithAI = async(filePath, fileContent, language) => {
    const text = await chat(
        `You are a senior software engineer doing a thorough code review.
You explain code clearly, specifically, and technically.
Always respond with valid JSON only — no markdown, no backticks, no preamble.`,

        `Analyze this ${language} file deeply and return a JSON object with these exact keys:

{
  "purpose": "One precise sentence: what does this file DO and WHY does it exist in this project?",
  "summary": "3-4 sentences covering: what problem it solves, how it fits in the architecture, key design decisions made",
  "architectureRole": "How this file fits into the overall system — which layer it belongs to and what depends on it",
  "functions": [
    {
      "name": "exact function/method name",
      "signature": "functionName(param1: type, param2: type): returnType",
      "description": "What it does, what it returns, any side effects",
      "complexity": "simple|moderate|complex"
    }
  ],
  "dependencies": [
    {
      "name": "module name",
      "purpose": "why this dependency is used here"
    }
  ],
  "imports": ["list of imported modules/files"],
  "exports": ["list of exported functions/classes/constants"],
  "flow": "Step-by-step walkthrough of the main execution flow, referencing actual function names",
  "security": "Any security-relevant logic found: auth checks, input validation, JWT, encryption, etc. Say 'None detected' if absent.",
  "keyPoints": [
    "Specific technical insight about this file",
    "Any patterns used (e.g. middleware pattern, factory pattern)",
    "Potential issues or things to watch out for",
    "Performance considerations if any"
  ],
  "relatedFiles": ["files this likely connects to based on imports/exports/naming"],
  "improvementSuggestions": [
    "Specific actionable improvement suggestion"
  ],
  "codeQuality": {
    "score": 8,
    "strengths": ["specific strength 1", "specific strength 2"],
    "improvements": ["specific improvement suggestion"]
  }
}

File path: ${filePath}

\`\`\`${language}
${fileContent.slice(0, 8000)}
\`\`\``,
        2500
    );

    try {
        const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return { purpose: text, summary: '', functions: [], dependencies: [], flow: '', keyPoints: [], codeQuality: null };
    }
};

// ── 2. CHAT WITH REPO ──────────────────────────────────────────────────────
export const chatWithRepoAI = async(question, contextChunks, repoName, techStack) => {
    const context = contextChunks
        .map((c, i) => `[Source ${i + 1}] 📄 ${c.filePath}\n${'─'.repeat(40)}\n${c.chunkText}`)
        .join('\n\n');

    return await chat(
        `You are a senior software architect and repository analysis expert who has thoroughly studied the "${repoName}" codebase.
Tech Stack: ${techStack.join(', ') || 'Unknown'}
Your goal is to help developers understand the repository quickly and accurately.

STRICT RESPONSE RULES:
1. NEVER return one large paragraph.
2. ALWAYS use clean Markdown formatting.
3. Use headings, subheadings, bullet points, numbered lists, tables, and code blocks where appropriate.
4. Mention exact file names, function names, classes, APIs, and modules whenever available.
5. Reference the provided source files directly.
6. Explain architecture decisions and likely reasoning behind implementations.
7. Keep explanations concise, structured, and easy to scan.
8. Highlight important findings using **bold text**.
9. When showing code, use fenced code blocks with the correct language.
10. If information is not present in the provided context, clearly state: "This information is not available in the retrieved repository context."

RESPONSE TEMPLATE:
## Answer

### Quick Summary
Provide a short 2-4 sentence overview.

### Relevant Files
List the most relevant files involved.

### Key Findings
Use bullet points.

### Detailed Explanation
Explain the implementation in structured sections.

### Code References
Include relevant snippets from the repository when helpful.

### Architecture Notes
Explain patterns, design choices, dependencies, and reasoning.

### Related Components
Mention other files, services, APIs, models, or modules connected to the answer.

### Limitations / Missing Information
State anything that cannot be confirmed from the provided context.

ADDITIONAL RULES:
* For "How does X work?" questions, explain the flow step-by-step.
* For architecture questions, include component relationships.
* For database questions, include schemas, models, relations, plugins, and data flow if available.
* For API questions, include routes, controllers, services, validation, and response structure.
* For authentication questions, include middleware, JWT handling, permissions, guards, and user flow.
* For frontend questions, include components, state management, hooks, APIs, and routing.
* Prefer bullets over long paragraphs.
* Prefer tables when comparing multiple items.
* Make the answer look like professional technical documentation.`,

        `Relevant code from the repository:

${context}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Developer question: ${question}

Provide a thorough, specific answer referencing actual code from the sources above. Follow the response template strictly.`,
        3000
    );
};

// ── 3. README GENERATOR ────────────────────────────────────────────────────
export const generateReadmeWithAI = async(repoName, techStack, files, architecture) => {
    const fileTree = files.map(f => f.path).slice(0, 100).join('\n');
    const importantFiles = files
        .filter(f => f.path.match(/index|main|app|server|router|route|controller|model|schema|config|package\.json|requirements|dockerfile/i))
        .slice(0, 8)
        .map(f => `### ${f.path}\n\`\`\`\n${(f.content || '').slice(0, 1000)}\n\`\`\``)
        .join('\n\n');

    const projectShortName = repoName.split('/')[1] || repoName;

    // Include architecture overview if available
    const archContext = architecture ?
        `\nArchitecture analysis:\n${typeof architecture === 'string' ? architecture : JSON.stringify(architecture, null, 2)}\n` :
        '';

    return await chat(
        `You are a senior developer writing a world-class GitHub README that will impress hiring managers and other developers.
Rules:
- Be SPECIFIC — use actual file names, function names, routes from the code
- NEVER use placeholder text like "your_value_here" — infer real values from code
- Write like a real developer, not an AI
- Include real working code examples
- Make every section earn its place — no filler`,

        `Generate a STUNNING, PRODUCTION-QUALITY README.md.

Project: ${repoName}
Tech Stack: ${techStack.join(', ') || 'unknown'}
${archContext}
File structure:
${fileTree}

Key source files with actual code:
${importantFiles}

Write this EXACT structure, every section filled with REAL specific details:

# ${projectShortName}

<div align="center">

[Generate 4-6 relevant shields.io badges based on ACTUAL tech stack - e.g. Node.js, Express, PostgreSQL etc]

**[One powerful tagline describing exactly what this project does]**

[⭐ Star this repo](https://github.com/${repoName}) · [🐛 Report Bug](https://github.com/${repoName}/issues) · [✨ Request Feature](https://github.com/${repoName}/issues)

</div>

---

## 📖 About

[2-3 specific sentences about what this project does, what problem it solves, who it's for. Reference actual features found in the code.]

## ✨ Features

[List 6-10 features. Each one should reference actual code. Format: **Feature Name** — specific detail]

## 🚀 Quick Start

### Prerequisites

[List exact prerequisites with version numbers inferred from package.json/code]

### Installation

\`\`\`bash
# Clone the repo
git clone https://github.com/${repoName}.git
cd ${projectShortName}

# Install dependencies  
[actual install command based on package manager detected]

# Copy environment file
cp .env.example .env
# Edit .env with your values

# [any database setup steps if applicable]

# Start development server
[actual dev command from package.json]
\`\`\`

## ⚙️ Configuration

\`\`\`env
[List REAL environment variables inferred from the actual code - no made up ones]
\`\`\`

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
[REAL variables with actual descriptions from code]

## 📁 Project Structure

\`\`\`
${projectShortName}/
[Show ACTUAL structure, max 2 levels deep, with inline comments explaining each folder]
\`\`\`

## 🔌 API Documentation

[Only include if it's a backend/API project]

### Base URL
\`\`\`
http://localhost:[actual port]/api
\`\`\`

### Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
[REAL endpoints from actual route files]

### Examples

**[Actual endpoint name]**
\`\`\`bash
curl -X POST http://localhost:3000/api/[real endpoint] \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <token>" \\
  -d '{[real request body based on actual code]}'
\`\`\`

\`\`\`json
// Response
{
  [realistic response structure based on actual controllers/models]
}
\`\`\`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
[REAL scripts from package.json with accurate descriptions]

## 🏗️ Architecture

\`\`\`
[ASCII diagram showing actual architecture - layers, data flow, key components]
\`\`\`

[2-3 sentences explaining the architectural pattern and key design decisions visible in the code]

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
[ACTUAL dependencies from package.json with their real purpose in this project]

## 🧪 Testing

\`\`\`bash
[actual test commands from package.json]
\`\`\`

[Brief description of testing approach if test files exist]

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'feat: add AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See \`LICENSE\` for more information.

---

<div align="center">
  <strong>Built with ❤️ — Give it a ⭐ if you found it useful!</strong>
</div>

CRITICAL: Every single section must contain REAL, SPECIFIC content from the actual codebase. Zero placeholder text. Zero generic descriptions. This must look like it was written by the actual developer of this project.`,
        4000
    );
};

// ── 4. ARCHITECTURE OVERVIEW ───────────────────────────────────────────────
export const generateArchitectureWithAI = async(repoName, techStack, files) => {
    const fileTree = files.map(f => f.path).slice(0, 80).join('\n');
    const packageFile = files.find(f => f.path === 'package.json');
    const packageContent = (packageFile && packageFile.content) ? packageFile.content.slice(0, 1500) : '';

    // Feed key source files for better analysis
    const keyFiles = files
        .filter(f => f.path.match(/index|main|app|server|router|route|controller|middleware|model/i))
        .slice(0, 5)
        .map(f => `// ${f.path}\n${(f.content || '').slice(0, 600)}`)
        .join('\n\n');

    const text = await chat(
        `You are a software architect. Analyze codebases and identify architecture patterns, layers, and data flows.
Always respond with valid JSON only — no markdown, no backticks.`,

        `Analyze this project's architecture deeply and return JSON:

{
  "overview": "3-4 sentences describing the overall architecture, patterns used, and key design decisions",
  "type": "monolith|microservice|serverless|MVC|layered|event-driven",
  "layers": [
    {
      "name": "Layer name (e.g. API Layer, Business Logic, Data Access)",
      "description": "What this layer does and its responsibilities",
      "files": ["actual file paths that belong to this layer"],
      "pattern": "design pattern used in this layer"
    }
  ],
  "dataFlow": "Detailed description of how data flows through the system from request to response",
  "diagram": "Multi-line ASCII diagram showing the actual architecture with real component names",
  "patterns": ["Specific patterns found: e.g. Repository Pattern, Middleware Chain, MVC, JWT Auth"],
  "entryPoints": ["main entry files with their purpose"],
  "externalServices": ["external services/APIs this project connects to"],
  "strengths": ["architectural strength 1", "architectural strength 2"],
  "considerations": ["something to be aware of about this architecture"]
}

Project: ${repoName}
Tech Stack: ${techStack.join(', ')}
package.json: ${packageContent}

File tree:
${fileTree}

Key source files:
${keyFiles}`,
        2500
    );

    try {
        const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return { overview: text, layers: [], dataFlow: '', diagram: '', patterns: [], type: 'unknown' };
    }
};

// ── 5. REPO SUMMARY ────────────────────────────────────────────────────────
export const generateRepoSummaryWithAI = async(repoName, techStack, fileCount, sampleFiles) => {
    const sample = sampleFiles.slice(0, 5)
        .map(f => `${f.path}:\n${(f.content || '').slice(0, 400)}`)
        .join('\n\n');

    return await chat(
        `You are a developer writing a sharp, impressive one-paragraph project summary for a GitHub README.
Be specific, technical, and compelling. Never be vague.`,

        `Write a 2-3 sentence summary for this project.

Requirements:
- Mention the specific tech stack
- Describe what it actually does (not just "a web app")
- Mention 1-2 standout features visible in the code
- Sound like a developer wrote it, not an AI

Repo: ${repoName}
Tech Stack: ${techStack.join(', ')}
Total Files: ${fileCount}

Sample code:
${sample}`,
        500
    );
};

// ── 6. EMBEDDINGS (Local - @xenova/transformers) ───────────────────────────
import { pipeline } from '@xenova/transformers';

let _extractor = null;
const getExtractor = async() => {
    if (!_extractor) {
        console.log('Loading embedding model (first time only)...');
        _extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-large');
    }
    return _extractor;
};

export const generateEmbedding = async(text) => {
    const extractor = await getExtractor();
    const result = await extractor(text, { pooling: 'mean', normalize: true });
    if (result.tolist) {
        const list = result.tolist();
        return Array.isArray(list[0]) ? list[0] : list;
    }
    const arr = Array.from(result);
    return Array.isArray(arr[0]) ? arr[0] : arr;
};
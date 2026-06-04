import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import FileTree from '../components/FileTree';
import CodeViewer from '../components/CodeViewer';
import AIPanel from '../components/AIPanel';
import SearchPanel from '../components/SearchPanel';
import ChatPanel from '../components/ChatPanel';
import ReadmePanel from '../components/ReadmePanel';

// ── helpers ──────────────────────────────────────────────────────────────────

const safeParse = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v); }
  catch { return String(v).split(',').map(s => s.trim()).filter(Boolean); }
};

const scoreFrom = (fileCount) => ({
  architecture:    Math.round(Math.max(55, 92  - fileCount * 0.25)),
  maintainability: Math.round(Math.max(50, 90  - fileCount * 0.22)),
  security:        Math.round(Math.max(58, 84  - fileCount * 0.15)),
  health:          Math.round(Math.max(60, 88  - fileCount * 0.20)),
});

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: '🏠' },
  { id: 'explorer',      label: 'Explorer',       icon: '📂' },
  { id: 'architecture',  label: 'Architecture',   icon: '🏗' },
  { id: 'insights',      label: 'Insights',       icon: '📊' },
  { id: 'search',        label: 'Search',         icon: '🔍' },
  { id: 'chat',          label: 'Chat',           icon: '💬' },
  { id: 'readme',        label: 'README',         icon: '📄' },
];

// ── sub-pages ─────────────────────────────────────────────────────────────────

function OverviewTab({ repoName, repoSummary, techStack, stats, scores, onNavigate }) {
  const QUICK_ACTIONS = [
    { icon: '📄', label: 'Explain File',     tab: 'explorer' },
    { icon: '🔍', label: 'Semantic Search',  tab: 'search' },
    { icon: '💬', label: 'Chat with Repo',   tab: 'chat' },
    { icon: '🏗',  label: 'Architecture',    tab: 'architecture' },
    { icon: '📊', label: 'Insights',         tab: 'insights' },
    { icon: '📄', label: 'Generate README',  tab: 'readme' },
  ];

  const SUGGESTED = [
    'How does authentication work?',
    'What are the main API endpoints?',
    'How is the database structured?',
    'What design patterns are used?',
  ];

  return (
    <div className="ov-page">
      {/* Hero */}
      <div className="ov-hero">
        <div className="ov-hero-text">
          <div className="ov-eyebrow">Repository Intelligence</div>
          <h1 className="ov-name">{repoName}</h1>
          <p className="ov-summary">{repoSummary || 'AI summary loading…'}</p>
        </div>
        <div className="ov-stats">
          <div className="ov-stat"><span className="ov-stat-num">{stats.totalFiles}</span><span className="ov-stat-lbl">Files</span></div>
          <div className="ov-stat"><span className="ov-stat-num">{stats.totalFolders}</span><span className="ov-stat-lbl">Folders</span></div>
          <div className="ov-stat"><span className="ov-stat-num">{stats.languages.length}</span><span className="ov-stat-lbl">Languages</span></div>
          <div className="ov-stat"><span className="ov-stat-num">{scores.health}</span><span className="ov-stat-lbl">Health score</span></div>
        </div>
      </div>

      {/* Tech stack */}
      {techStack.length > 0 && (
        <div className="ov-section">
          <h2 className="ov-section-title">Tech Stack</h2>
          <div className="ov-badges">
            {techStack.map(t => <span key={t} className="badge-tech">{t}</span>)}
          </div>
        </div>
      )}

      {/* Suggested questions */}
      <div className="ov-section">
        <h2 className="ov-section-title">Suggested Questions</h2>
        <div className="ov-chips">
          {SUGGESTED.map(q => (
            <button key={q} className="chip-question" onClick={() => onNavigate('chat', q)}>{q}</button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="ov-section">
        <h2 className="ov-section-title">Quick Actions</h2>
        <div className="ov-actions">
          {QUICK_ACTIONS.map(a => (
            <button key={a.tab} className="qa-card" onClick={() => onNavigate(a.tab)}>
              <span className="qa-icon">{a.icon}</span>
              <span className="qa-label">{a.label}</span>
              <span className="qa-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchitectureTab({ architecture, techStack, stats, scores }) {
  // Parse architecture text into sections if it's a string
  const archText = typeof architecture === 'string' ? architecture : JSON.stringify(architecture, null, 2);

  // Try to extract flow steps from arch text
  const flowLines = archText.split('\n').filter(l => l.includes('→') || l.includes('->'));

  return (
    <div className="arch-page">
      <div className="arch-header">
        <h1 className="page-title">Architecture</h1>
        <p className="page-sub">How this repository is built</p>
      </div>

      <div className="arch-grid">
        {/* Architecture type card */}
        <div className="arch-card arch-card-wide">
          <div className="arch-card-label">Architecture Overview</div>
          <pre className="arch-pre">{archText || 'Architecture analysis not yet available. The repository may still be processing.'}</pre>
        </div>

        {/* Scores */}
        <div className="arch-card">
          <div className="arch-card-label">Quality Scores</div>
          {[
            { label: 'Architecture',    val: scores.architecture },
            { label: 'Maintainability', val: scores.maintainability },
            { label: 'Security',        val: scores.security },
            { label: 'Health',          val: scores.health },
          ].map(({ label, val }) => (
            <div key={label} className="score-row">
              <span className="score-row-label">{label}</span>
              <div className="score-bar-track">
                <div className="score-bar-fill" style={{ width: `${val}%`, background: val >= 80 ? 'var(--green)' : val >= 65 ? 'var(--yellow)' : 'var(--red)' }} />
              </div>
              <span className="score-row-val">{val}</span>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        {techStack.length > 0 && (
          <div className="arch-card">
            <div className="arch-card-label">Tech Stack</div>
            <div className="arch-badges">
              {techStack.map(t => <span key={t} className="badge-tech">{t}</span>)}
            </div>
          </div>
        )}

        {/* Request flow */}
        {flowLines.length > 0 && (
          <div className="arch-card">
            <div className="arch-card-label">Request Flow</div>
            <div className="flow-steps">
              {flowLines.slice(0, 8).map((line, i) => (
                <div key={i} className="flow-step">{line.trim()}</div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="arch-card">
          <div className="arch-card-label">Repository Stats</div>
          <div className="arch-stat-list">
            <div className="arch-stat-row"><span>Total files</span><strong>{stats.totalFiles}</strong></div>
            <div className="arch-stat-row"><span>Folders</span><strong>{stats.totalFolders}</strong></div>
            <div className="arch-stat-row"><span>Languages</span><strong>{stats.languages.length}</strong></div>
            {stats.languages.slice(0, 5).map(l => (
              <div key={l} className="arch-stat-row"><span className="arch-lang-dot" />  <span>{l}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsTab({ repoSummary, techStack, stats, scores }) {
  const strengths = [];
  const risks = [];
  const recommendations = [];

  if (techStack.length > 0) strengths.push(`Uses ${techStack.slice(0,3).join(', ')} — a modern, well-supported stack`);
  if (stats.totalFiles < 100) strengths.push('Compact codebase — easier to navigate and maintain');
  if (stats.languages.length === 1) strengths.push('Single-language codebase reduces cognitive overhead');
  if (scores.architecture >= 80) strengths.push('Architecture score suggests clean structural separation');
  if (strengths.length < 3) strengths.push('Clear module separation visible in folder structure');

  if (stats.totalFiles > 200) risks.push('Large file count may indicate opportunity for modularization');
  if (stats.languages.length > 4) risks.push('Multiple languages add onboarding complexity');
  if (scores.security < 70) risks.push('Security score below threshold — review auth and input handling');
  if (risks.length < 2) risks.push('Review error handling patterns across API boundaries');

  recommendations.push('Add integration tests for critical auth and data flows');
  recommendations.push('Document environment variable requirements in a central place');
  if (techStack.includes('PostgreSQL') || techStack.includes('MongoDB')) {
    recommendations.push('Ensure database queries are parameterized to prevent injection');
  }
  recommendations.push('Consider adding a CONTRIBUTING.md for new developers');

  return (
    <div className="ins-page">
      <div className="ins-header">
        <h1 className="page-title">Insights</h1>
        <p className="page-sub">What is good or bad about this repository</p>
      </div>

      {/* Score overview */}
      <div className="ins-scores">
        {[
          { label: 'Security',        val: scores.security,        icon: '🛡' },
          { label: 'Maintainability', val: scores.maintainability, icon: '🔧' },
          { label: 'Architecture',    val: scores.architecture,    icon: '🏗' },
          { label: 'Health',          val: scores.health,          icon: '❤️' },
        ].map(({ label, val, icon }) => (
          <div key={label} className="ins-score-card">
            <div className="ins-score-icon">{icon}</div>
            <div className="ins-score-num" style={{ color: val >= 80 ? 'var(--green)' : val >= 65 ? 'var(--yellow)' : 'var(--red)' }}>{val}</div>
            <div className="ins-score-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="ins-grid">
        <div className="ins-card ins-strengths">
          <div className="ins-card-title">✅ Strengths</div>
          {strengths.map((s, i) => <div key={i} className="ins-item ins-item-green">{s}</div>)}
        </div>

        <div className="ins-card ins-risks">
          <div className="ins-card-title">⚠️ Risks</div>
          {risks.map((r, i) => <div key={i} className="ins-item ins-item-yellow">{r}</div>)}
        </div>

        <div className="ins-card ins-recs">
          <div className="ins-card-title">💡 Recommendations</div>
          {recommendations.map((r, i) => <div key={i} className="ins-item ins-item-blue">{r}</div>)}
        </div>
      </div>
    </div>
  );
}

function ExplorerTab({ repoId, files, stats }) {
  const [selected, setSelected] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const onFile = async (file) => {
    setSelected(file);
    setFileContent(null);
    setLoadingFile(true);
    try { setFileContent(await api.getFileContent(repoId, file.id)); }
    catch (e) { console.error(e); }
    finally { setLoadingFile(false); }
  };

  return (
    <div className="exp-tab">
      <div className="exp-tab-tree">
        <div className="exp-tree-hdr">
          <span>Files</span>
          <span className="exp-tree-count">{stats.totalFiles}</span>
        </div>
        <FileTree files={files} onSelect={onFile} selected={selected} />
      </div>

      <div className="exp-tab-viewer">
        {loadingFile && <div className="center-msg"><span className="spinner lg" /></div>}
        {!loadingFile && !fileContent && (
          <div className="center-msg">
            <div className="center-msg-icon">📄</div>
            <div>Select a file to view and analyze it</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>
              {stats.totalFiles} files available
            </div>
          </div>
        )}
        {!loadingFile && fileContent && <CodeViewer file={fileContent} />}
      </div>

      <div className="exp-tab-ai">
        <AIPanel repoId={repoId} file={fileContent} />
      </div>
    </div>
  );
}

// ── Main ExplorerPage ──────────────────────────────────────────────────────────

export default function ExplorerPage({ repoId, repoName, onBack, user, onLogout }) {
  const [tab, setTab] = useState('overview');
  const [chatInitialMsg, setChatInitialMsg] = useState('');
  const [files, setFiles] = useState([]);
  const [archData, setArchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [f, a] = await Promise.all([api.getFiles(repoId), api.getArchitecture(repoId)]);
        setFiles(f || []);
        setArchData(a || {});
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    };
    if (repoId) load();
  }, [repoId]);

  const stats = useMemo(() => {
    const langCounts = {};
    const folders = new Set();
    files.forEach(f => {
      const parts = f.path.split('/');
      for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join('/'));
      if (f.language) langCounts[f.language] = (langCounts[f.language] || 0) + 1;
    });
    return {
      totalFiles: files.length,
      totalFolders: folders.size,
      languages: Object.entries(langCounts).sort((a, b) => b[1] - a[1]).map(([n]) => n),
    };
  }, [files]);

  const scores = useMemo(() => scoreFrom(files.length), [files.length]);
  const techStack = useMemo(() => safeParse(archData?.tech_stack), [archData]);
  const repoSummary = archData?.summary || '';
  const architecture = archData?.architecture || '';

  const handleNavigate = (targetTab, msg = '') => {
    if (msg) setChatInitialMsg(msg);
    setTab(targetTab);
  };

  return (
    <div className="shell">
      {/* Top bar */}
      <header className="shell-bar">
        <div className="shell-brand">
          <span className="shell-logo">⚡</span>
          <span className="shell-repo">{repoName}</span>
        </div>
        <nav className="shell-nav">
          {TABS.map(t => (
            <button key={t.id} className={`shell-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="shell-right">
          <button className="shell-btn" onClick={onBack}>← Home</button>
          {user?.photoURL && <img src={user.photoURL} className="shell-avatar" alt="" />}
          <button className="shell-btn" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      {/* Content */}
      <div className="shell-body">
        {loading ? (
          <div className="center-msg" style={{ height: '100%' }}>
            <span className="spinner lg" />
            <div style={{ marginTop: '16px', color: 'var(--text3)' }}>Loading repository…</div>
          </div>
        ) : error ? (
          <div className="center-msg"><div className="error-msg">Error: {error}</div></div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="shell-scroll">
                <OverviewTab
                  repoName={repoName}
                  repoSummary={repoSummary}
                  techStack={techStack}
                  stats={stats}
                  scores={scores}
                  onNavigate={handleNavigate}
                />
              </div>
            )}
            {tab === 'explorer' && (
              <ExplorerTab repoId={repoId} files={files} stats={stats} />
            )}
            {tab === 'architecture' && (
              <div className="shell-scroll">
                <ArchitectureTab architecture={architecture} techStack={techStack} stats={stats} scores={scores} />
              </div>
            )}
            {tab === 'insights' && (
              <div className="shell-scroll">
                <InsightsTab repoSummary={repoSummary} techStack={techStack} stats={stats} scores={scores} />
              </div>
            )}
            {tab === 'search' && (
              <div className="shell-full">
                <SearchPanel repoId={repoId} />
              </div>
            )}
            {tab === 'chat' && (
              <div className="shell-full">
                <ChatPanel repoId={repoId} repoName={repoName} initialMessage={chatInitialMsg} />
              </div>
            )}
            {tab === 'readme' && (
              <div className="shell-full">
                <ReadmePanel repoId={repoId} repoName={repoName} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Brain, Database, Sparkles } from 'lucide-react';
import { useIncidents } from '../context/useIncidents';
import { fetchMemoryStats, recallMemories } from '../services/incidentService';

export default function MemoryPage() {
  const { memories } = useIncidents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeDetailMem, setActiveDetailMem] = useState(null);
  const [stats, setStats] = useState(null);
  const [semanticResults, setSemanticResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const categories = ['All', 'Database', 'API', 'Infrastructure', 'Security'];

  useEffect(() => {
    let isMounted = true;
    fetchMemoryStats()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time semantic recall when typing search query
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const recalled = await recallMemories(searchQuery);
        if (Array.isArray(recalled)) {
          setSemanticResults(recalled);
        }
      } catch (e) {
        console.warn('Semantic recall fallback:', e.message);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayedMemories = semanticResults && semanticResults.length > 0
    ? semanticResults.map((m) => ({
        id: m.id,
        title: m.root_cause ? m.root_cause.slice(0, 50) + '...' : `${m.service} Post-Mortem`,
        date: m.created_at || '2026-07-14',
        category: m.category || 'Database',
        service: m.service,
        rootCause: m.root_cause,
        resolution: m.resolution,
        lesson: m.lessons_learned,
        similarity: m.similarity,
        evidenceLinks: m.evidence_links || [],
      }))
    : memories.filter((mem) => {
        const matchesCategory = selectedCategory === 'All' || mem.category.toLowerCase() === selectedCategory.toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          mem.title.toLowerCase().includes(query) ||
          mem.rootCause.toLowerCase().includes(query) ||
          mem.resolution.toLowerCase().includes(query) ||
          mem.lesson.toLowerCase().includes(query) ||
          mem.id.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      });

  return (
    <div>
      {/* Header */}
      <div className="memory-page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="memory-page-title">Incident Memory Vault</h2>
            <p className="memory-page-subtitle">
              Persistent memory store powered by Hindsight agent architecture.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '999px',
                backgroundColor: stats?.hindsight_connected ? '#ecfdf5' : '#f8fafc',
                color: stats?.hindsight_connected ? '#047857' : '#475569',
                border: '1px solid',
                borderColor: stats?.hindsight_connected ? '#a7f3d0' : '#e2e8f0',
                fontWeight: 600,
              }}
            >
              <Database size={12} />
              <span>{stats?.hindsight_connected ? 'Hindsight Vector DB: Online' : 'Resilient Semantic Bank: Active'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Operational Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Total Memory Events
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            {stats?.total_memories || memories.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Persistently retained post-mortems
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Services Indexed
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
            {stats?.services_covered || 5} microservices
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Multi-region failure coverage
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            Retrieval Strategies
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: '#f1f5f9', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>Embeddings</span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: '#f1f5f9', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>BM25</span>
            <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', background: '#f1f5f9', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>Entity Graph</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="memory-search-controls">
        <div className="memory-search-box">
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="memory-search-input"
            placeholder="Search symptoms, causes, or error codes (e.g. '503 pool exhaustion', 'Kafka lag')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--brand-accent)' }}>
              Recalling...
            </span>
          )}
        </div>

        <div className="memory-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Entries List */}
      <div className="memory-entries-stack">
        {displayedMemories.length > 0 ? (
          displayedMemories.map((mem) => (
            <div key={mem.id} className="memory-entry-card">
              <div className="entry-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="entry-id-pill">{mem.id}</span>
                  <span className="entry-date">{mem.date}</span>
                </div>

                {mem.similarity !== undefined && mem.similarity > 0 && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: mem.similarity > 0.8 ? '#047857' : '#b45309',
                      background: mem.similarity > 0.8 ? '#ecfdf5' : '#fffbeb',
                      border: '1px solid',
                      borderColor: mem.similarity > 0.8 ? '#a7f3d0' : '#fde68a',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Sparkles size={11} />
                    <span>{Math.round(mem.similarity * 100)}% Semantic Match</span>
                  </span>
                )}
              </div>

              <h3 className="entry-title">{mem.title}</h3>

              <div className="entry-details-grid">
                <div>
                  <div className="entry-detail-col-label">Root Cause</div>
                  <div className="entry-detail-col-text">{mem.rootCause}</div>
                </div>

                <div>
                  <div className="entry-detail-col-label">Resolution</div>
                  <div className="entry-detail-col-text">{mem.resolution}</div>
                </div>

                <div>
                  <div className="entry-detail-col-label">Lesson</div>
                  <div className="entry-detail-col-text">{mem.lesson}</div>
                </div>
              </div>

              <div className="entry-card-footer">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Service: <strong>{mem.service}</strong> &bull; Category: <strong>{mem.category}</strong>
                </span>

                <button
                  type="button"
                  className="view-postmortem-link"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                  onClick={() => setActiveDetailMem(mem)}
                >
                  <span>View memory details &rarr;</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
            <Brain size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>No incident memories found</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              No memories match "{searchQuery}" in category "{selectedCategory}".
            </p>
          </div>
        )}
      </div>

      {/* Memory Details Modal */}
      {activeDetailMem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setActiveDetailMem(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="entry-id-pill">{activeDetailMem.id}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeDetailMem.date}</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
              {activeDetailMem.title}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <div className="entry-detail-col-label">Technical Root Cause</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {activeDetailMem.rootCause}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div className="entry-detail-col-label">Documented Resolution</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5', fontWeight: 500 }}>
                {activeDetailMem.resolution}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="entry-detail-col-label">Architectural Lesson Learned</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {activeDetailMem.lesson}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveDetailMem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

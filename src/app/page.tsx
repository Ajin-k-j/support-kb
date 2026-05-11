'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Loader from '@/components/Loader';

export default function Home() {
  const { loading } = useAuth();

  if (loading) return <div className="text-center py-5"><Loader /></div>;


  return (
    <>
      <style>{`
        @keyframes heroRise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          40%       { transform: translate(50px,-40px) scale(1.07); }
          70%       { transform: translate(-30px, 45px) scale(0.95); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79,70,229,0.25); }
          50%       { box-shadow: 0 0 0 6px rgba(79,70,229,0); }
        }
        @keyframes featureIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ---- Reset for landing only ---- */
        .lp-root * { box-sizing: border-box; }
        .lp-root { font-family: 'Inter', sans-serif; background: #ffffff; color: #111827; overflow-x: hidden; }

        /* ---- Background blobs ---- */
        .lp-blob {
          position: absolute; border-radius: 50%;
          filter: blur(100px); pointer-events: none;
          animation: blobFloat 22s ease-in-out infinite;
        }
        .lp-blob-1 { width: 600px; height: 600px; background: rgba(79,70,229,0.10); top: -180px; left: -200px; animation-delay: 0s; }
        .lp-blob-2 { width: 500px; height: 500px; background: rgba(139,92,246,0.09); top: -100px; right: -180px; animation-delay: -9s; }
        .lp-blob-3 { width: 350px; height: 350px; background: rgba(99,102,241,0.07); top: 60%; left: 60%; animation-delay: -5s; }

        /* ---- Hero ---- */
        .lp-hero {
          position: relative; overflow: hidden;
          background: linear-gradient(160deg, #f0f4ff 0%, #fafaff 60%, #fff 100%);
          padding: 6rem 1.5rem 5rem;
          text-align: center;
        }
        .lp-hero-inner {
          position: relative; z-index: 1;
          max-width: 760px; margin: 0 auto;
          animation: heroRise 0.6s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lp-mcp-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(79,70,229,0.07); border: 1px solid rgba(79,70,229,0.18);
          border-radius: 99px; padding: 5px 14px 5px 10px;
          font-size: 0.72rem; font-weight: 700; color: #4f46e5;
          letter-spacing: 0.05em; text-transform: uppercase;
          margin-bottom: 1.75rem; animation: badgePulse 3s ease-in-out infinite;
        }
        .lp-mcp-badge-dot { width: 8px; height: 8px; background: #4f46e5; border-radius: 50%; }
        .lp-hero-title {
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 900; letter-spacing: -0.04em;
          color: #0f0a2e; line-height: 1.1; margin-bottom: 1.25rem;
        }
        .lp-hero-title span {
          background: linear-gradient(135deg, #4f46e5, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .lp-hero-sub {
          font-size: 1.1rem; color: #4b5563; line-height: 1.7;
          max-width: 560px; margin: 0 auto 2.5rem; font-weight: 400;
        }
        .lp-cta-row { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: #fff; font-weight: 700; font-size: 0.95rem;
          padding: 14px 28px; border-radius: 12px; border: none;
          text-decoration: none; cursor: pointer;
          box-shadow: 0 4px 20px rgba(79,70,229,0.35);
          transition: all 0.2s;
        }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(79,70,229,0.40); color: #fff; text-decoration: none; }
        .lp-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #4f46e5; font-weight: 700; font-size: 0.95rem;
          padding: 14px 28px; border-radius: 12px;
          border: 2px solid rgba(79,70,229,0.25);
          text-decoration: none; cursor: pointer; transition: all 0.2s;
        }
        .lp-btn-outline:hover { border-color: #4f46e5; background: rgba(79,70,229,0.04); color: #4f46e5; text-decoration: none; transform: translateY(-2px); }

        /* ---- Stats bar ---- */
        .lp-stats {
          background: #fff; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;
          padding: 2.5rem 1.5rem;
        }
        .lp-stats-inner {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 2rem; text-align: center;
        }
        .lp-stat-num { font-size: 2rem; font-weight: 900; color: #4f46e5; letter-spacing: -0.03em; }
        .lp-stat-label { font-size: 0.82rem; color: #6b7280; font-weight: 500; margin-top: 4px; }

        /* ---- Section base ---- */
        .lp-section { padding: 5rem 1.5rem; }
        .lp-section-inner { max-width: 1100px; margin: 0 auto; }
        .lp-section-eyebrow {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          color: #4f46e5; margin-bottom: 0.75rem;
        }
        .lp-section-title {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 900; color: #0f0a2e; letter-spacing: -0.03em;
          margin-bottom: 0.75rem; line-height: 1.15;
        }
        .lp-section-sub { font-size: 1rem; color: #4b5563; max-width: 520px; line-height: 1.65; }

        /* ---- Features grid ---- */
        .lp-features-bg { background: #f8faff; }
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.25rem; margin-top: 3rem;
        }
        .lp-feature-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #e5e7eb;
          padding: 1.75rem; position: relative; overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          animation: featureIn 0.5s ease both;
        }
        .lp-feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(79,70,229,0.12); border-color: rgba(79,70,229,0.25); }
        .lp-feature-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.1rem; flex-shrink: 0;
        }
        .lp-feature-title { font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; }
        .lp-feature-desc { font-size: 0.875rem; color: #6b7280; line-height: 1.6; }
        .lp-feature-tag {
          display: inline-block; margin-top: 0.75rem;
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; color: #4f46e5;
          background: rgba(79,70,229,0.07); border-radius: 99px;
          padding: 3px 8px;
        }

        /* ---- AI Code Section ---- */
        .lp-code-bg { background: #fff; }
        .lp-code-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem; margin-top: 3rem;
        }
        .lp-code-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.72rem; font-weight: 700; padding: 3px 10px;
          border-radius: 99px; margin-top: 0.75rem;
        }

        /* ---- Docs Teaser ---- */
        .lp-docs-bg { background: #f0f4ff; }
        .lp-docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem; margin-top: 2.5rem;
        }
        .lp-docs-link-card {
          display: flex; align-items: flex-start; gap: 14px;
          background: #fff; border-radius: 14px;
          border: 1px solid #e5e7eb; padding: 1.25rem;
          text-decoration: none; color: inherit;
          transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
        }
        .lp-docs-link-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(79,70,229,0.10); border-color: rgba(79,70,229,0.25); text-decoration: none; color: inherit; }
        .lp-docs-link-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .lp-docs-link-title { font-size: 0.9rem; font-weight: 700; color: #111827; margin-bottom: 3px; }
        .lp-docs-link-desc { font-size: 0.78rem; color: #6b7280; line-height: 1.5; }
        .lp-docs-link-arr { margin-left: auto; color: #4f46e5; opacity: 0.6; flex-shrink: 0; align-self: center; }

        /* ---- MCP Section ---- */
        .lp-mcp { background: linear-gradient(160deg, #0f0a2e 0%, #1e1b4b 100%); color: #fff; }
        .lp-mcp .lp-section-title { color: #fff; }
        .lp-mcp .lp-section-sub { color: rgba(255,255,255,0.65); }
        .lp-mcp .lp-section-eyebrow { color: #818cf8; }
        .lp-mcp-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem; margin-top: 3rem;
        }
        .lp-mcp-card {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.10);
          border-radius: 14px; padding: 1.5rem;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .lp-mcp-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(129,140,248,0.35); transform: translateY(-3px); }
        .lp-mcp-card-num {
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.06em;
          color: #818cf8; text-transform: uppercase; margin-bottom: 0.6rem;
        }
        .lp-mcp-card-title { font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem; }
        .lp-mcp-card-desc { font-size: 0.82rem; color: rgba(255,255,255,0.60); line-height: 1.55; }

        /* ---- Final CTA ---- */
        .lp-cta { background: #f0f4ff; text-align: center; }
        .lp-cta .lp-section-title { color: #0f0a2e; }
        .lp-cta .lp-section-sub { margin: 0 auto 2rem; }
        .lp-cta-card {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border-radius: 24px; padding: 4rem 2rem;
          box-shadow: 0 20px 60px rgba(79,70,229,0.30);
          max-width: 700px; margin: 0 auto;
        }
        .lp-cta-card .lp-section-title { color: #fff; }
        .lp-cta-card p { color: rgba(255,255,255,0.80); font-size: 1rem; max-width: 460px; margin: 0 auto 2rem; line-height: 1.65; }
        .lp-btn-white {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #4f46e5;
          font-weight: 700; font-size: 0.95rem;
          padding: 14px 28px; border-radius: 12px; border: none;
          text-decoration: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        .lp-btn-white:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.20); color: #4338ca; text-decoration: none; }
        .lp-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: rgba(255,255,255,0.85);
          font-weight: 600; font-size: 0.95rem;
          padding: 14px 28px; border-radius: 12px;
          border: 2px solid rgba(255,255,255,0.30);
          text-decoration: none; cursor: pointer; transition: all 0.2s;
        }
        .lp-btn-ghost:hover { border-color: rgba(255,255,255,0.70); color: #fff; text-decoration: none; }

        /* ---- Footer ---- */
        .lp-footer {
          background: #0f0a2e; color: rgba(255,255,255,0.45);
          padding: 2rem 1.5rem; text-align: center; font-size: 0.8rem;
        }
        .lp-footer a { color: rgba(255,255,255,0.55); text-decoration: none; }
        .lp-footer a:hover { color: #fff; }
      `}</style>

      <div className="lp-root">

        {/* ===== HERO ===== */}
        <section className="lp-hero">
          <div className="lp-blob lp-blob-1" />
          <div className="lp-blob lp-blob-2" />
          <div className="lp-blob lp-blob-3" />
          <div className="lp-hero-inner">
            <div className="lp-mcp-badge">
              <span className="lp-mcp-badge-dot" />
              Now with MCP AI Agent Integration
            </div>
            <h1 className="lp-hero-title">
              The smarter way to<br />
              <span>manage support tickets</span>
            </h1>
            <p className="lp-hero-sub">
              Support KB unifies your team&apos;s knowledge base, ticket workflow, and AI assistance — all in one place. Powered by the Model Context Protocol for real-time AI agent access.
            </p>
            <div className="lp-cta-row">
              <Link href="/signup" className="lp-btn-primary">
                Get started free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/login" className="lp-btn-outline">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        {/* ===== STATS BAR ===== */}
        <section className="lp-stats">
          <div className="lp-stats-inner">
            <div>
              <div className="lp-stat-num">10+</div>
              <div className="lp-stat-label">MCP Tool Integrations</div>
            </div>
            <div>
              <div className="lp-stat-num">Real-time</div>
              <div className="lp-stat-label">AI-Powered Summaries</div>
            </div>
            <div>
              <div className="lp-stat-num">RBAC</div>
              <div className="lp-stat-label">Role-Based Access Control</div>
            </div>
            <div>
              <div className="lp-stat-num">Firebase</div>
              <div className="lp-stat-label">Secure Cloud Backend</div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES GRID ===== */}
        <section className="lp-section lp-features-bg">
          <div className="lp-section-inner">
            <div className="lp-section-eyebrow">Core Features</div>
            <h2 className="lp-section-title">Everything your support team needs</h2>
            <p className="lp-section-sub">From ticket creation to AI-assisted resolution, Support KB covers every step of your support workflow.</p>

            <div className="lp-features-grid">

              <div className="lp-feature-card" style={{ animationDelay: '0.05s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(79,70,229,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div className="lp-feature-title">Ticket Management</div>
                <div className="lp-feature-desc">Create, assign, track and resolve support tickets with full lifecycle management including status, priority, and business impact scoring.</div>
                <span className="lp-feature-tag">Core</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.10s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(16,185,129,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <div className="lp-feature-title">Knowledge Base</div>
                <div className="lp-feature-desc">Build and maintain a rich searchable knowledge base with a full rich-text editor, code blocks, and structured documentation.</div>
                <span className="lp-feature-tag">Knowledge</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.15s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(245,158,11,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div className="lp-feature-title">AI-Powered Summaries</div>
                <div className="lp-feature-desc">Automatically generate concise AI summaries of complex tickets, helping your team quickly understand context and history.</div>
                <span className="lp-feature-tag">AI</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.20s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(99,102,241,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div className="lp-feature-title">MCP Agent Access</div>
                <div className="lp-feature-desc">AI agents connect via the Model Context Protocol to search, create, and update tickets programmatically — no manual handoffs required.</div>
                <span className="lp-feature-tag">MCP</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.25s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(239,68,68,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="lp-feature-title">Role-Based Access</div>
                <div className="lp-feature-desc">Granular RBAC with admin and user roles. Admins manage user approvals, permissions, and team configuration from a dedicated panel.</div>
                <span className="lp-feature-tag">Security</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.30s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(6,182,212,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div className="lp-feature-title">Investigation Logs</div>
                <div className="lp-feature-desc">Track every hypothesis, action, observation, and communication in structured investigation logs with full user attribution and timestamps.</div>
                <span className="lp-feature-tag">Collaboration</span>
              </div>

            </div>
          </div>
        </section>

        {/* ===== AI CODE INTELLIGENCE ===== */}
        <section className="lp-section lp-code-bg">
          <div className="lp-section-inner">
            <div className="lp-section-eyebrow">AI Code Intelligence</div>
            <h2 className="lp-section-title">Your codebase, fully understood</h2>
            <p className="lp-section-sub">Support KB&apos;s knowledge base doubles as a code intelligence hub — store, search, and generate scripts across your entire tech stack.</p>

            <div className="lp-code-grid">

              <div className="lp-feature-card" style={{ animationDelay: '0.05s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(234,88,12,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>
                </div>
                <div className="lp-feature-title">Hybris SQL & FlexibleSearch</div>
                <div className="lp-feature-desc">Store and retrieve generated Hybris FlexibleSearch and SQL queries. AI agents can help craft complex product, order, and catalog queries against your SAP Commerce data model.</div>
                <span className="lp-feature-tag" style={{ background: 'rgba(234,88,12,0.08)', color: '#ea580c' }}>Hybris</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.10s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(22,163,74,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                </div>
                <div className="lp-feature-title">Groovy Scripts</div>
                <div className="lp-feature-desc">Generate, document, and version Groovy scripts for Hybris ImpEx processing, data migration, backoffice automation, and HAC console operations — with full syntax context.</div>
                <span className="lp-feature-tag" style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a' }}>Groovy</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.15s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(2,132,199,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M6 9h2M10 9h8M6 13h4M14 13h4"/></svg>
                </div>
                <div className="lp-feature-title">Azure KQL Queries</div>
                <div className="lp-feature-desc">Build and share Kusto Query Language queries for Azure Monitor, Log Analytics, and Application Insights — perfect for diagnosing production incidents and correlating telemetry.</div>
                <span className="lp-feature-tag" style={{ background: 'rgba(2,132,199,0.08)', color: '#0284c7' }}>Azure KQL</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.20s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(124,58,237,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div className="lp-feature-title">Codebase Documentation</div>
                <div className="lp-feature-desc">Attach architecture decisions, API references, runbooks, and module-level documentation directly to tickets — keeping institutional knowledge alive and searchable.</div>
                <span className="lp-feature-tag" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}>Docs</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.25s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(245,158,11,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <div className="lp-feature-title">Global Code Search</div>
                <div className="lp-feature-desc">Full-text search across all stored queries, scripts, and code snippets. Find the right Groovy script or KQL query instantly without digging through wikis or chat history.</div>
                <span className="lp-feature-tag" style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>Search</span>
              </div>

              <div className="lp-feature-card" style={{ animationDelay: '0.30s' }}>
                <div className="lp-feature-icon" style={{ background: 'rgba(6,182,212,0.10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div className="lp-feature-title">AI-Assisted Generation</div>
                <div className="lp-feature-desc">Ask the MCP AI agent to generate Hybris FlexibleSearch, Groovy scripts, or Azure KQL queries from plain English — and attach the output directly to a support ticket.</div>
                <span className="lp-feature-tag" style={{ background: 'rgba(6,182,212,0.08)', color: '#06b6d4' }}>MCP AI</span>
              </div>

            </div>
          </div>
        </section>

        {/* ===== DOCS TEASER ===== */}
        <section className="lp-section lp-docs-bg">
          <div className="lp-section-inner">
            <div className="lp-section-eyebrow">Documentation</div>
            <h2 className="lp-section-title">Everything you need to get started</h2>
            <p className="lp-section-sub">In-depth guides covering ticket workflows, collaboration, MCP connection setup, and platform operations.</p>

            <div className="lp-docs-grid">
              {[
                { href: '/docs#tickets', icon: '🎫', iconBg: 'rgba(79,70,229,0.10)', title: 'Ticket Management', desc: 'Create, assign, escalate and resolve tickets end-to-end.' },
                { href: '/docs#collaboration', icon: '🤝', iconBg: 'rgba(16,185,129,0.10)', title: 'Collaboration', desc: 'Investigation logs, user assignments and real-time updates.' },
                { href: '/docs#mcp', icon: '⚡', iconBg: 'rgba(245,158,11,0.10)', title: 'MCP Connection', desc: 'Connect Claude or any MCP client to your Support KB instance.' },
                { href: '/docs#code', icon: '💻', iconBg: 'rgba(124,58,237,0.10)', title: 'Code & Query Help', desc: 'Hybris SQL, Groovy scripts, and Azure KQL query guides.' },
                { href: '/docs#rbac', icon: '🔐', iconBg: 'rgba(239,68,68,0.10)', title: 'Roles & Access', desc: 'Admin approval flow, role assignment and permissions.' },
                { href: '/docs', icon: '📖', iconBg: 'rgba(6,182,212,0.10)', title: 'Full Documentation →', desc: 'Browse all guides, API references, and platform docs.' },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="lp-docs-link-card">
                  <div className="lp-docs-link-icon" style={{ background: item.iconBg }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="lp-docs-link-title">{item.title}</div>
                    <div className="lp-docs-link-desc">{item.desc}</div>
                  </div>
                  <svg className="lp-docs-link-arr" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== MCP CAPABILITIES ===== */}
        <section className="lp-section lp-mcp">
          <div className="lp-section-inner">
            <div className="lp-section-eyebrow">Model Context Protocol</div>
            <h2 className="lp-section-title">AI agents that actually work</h2>
            <p className="lp-section-sub">Support KB exposes a production-grade MCP server on Cloudflare Workers, giving AI assistants like Claude real-time, authenticated access to your support data.</p>

            <div className="lp-mcp-grid">
              {[
                { n: '01', title: 'Search Tickets', desc: 'AI agents search the full ticket database by keyword, status, priority, or assignee in real time.' },
                { n: '02', title: 'Create & Update', desc: 'Agents create new tickets and update existing ones — fields, status, and investigation logs included.' },
                { n: '03', title: 'Knowledge Retrieval', desc: 'Instantly pull relevant KB articles to surface answers without leaving the conversation.' },
                { n: '04', title: 'Ticket Lookup', desc: 'Fetch detailed ticket information by human-readable ticket number for fast context loading.' },
                { n: '05', title: 'User-Aware Context', desc: 'MCP sessions are authenticated per-user so agents act with the right identity and permissions.' },
                { n: '06', title: 'Stateless Transport', desc: 'Deployed on Cloudflare Workers with stateless HTTP — zero cold-start latency, global edge delivery.' },
              ].map((item) => (
                <div className="lp-mcp-card" key={item.n}>
                  <div className="lp-mcp-card-num">Tool {item.n}</div>
                  <div className="lp-mcp-card-title">{item.title}</div>
                  <div className="lp-mcp-card-desc">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="lp-section lp-cta">
          <div className="lp-section-inner">
            <div className="lp-cta-card">
              <h2 className="lp-section-title">Ready to transform your support workflow?</h2>
              <p>Join your team on Support KB — the only platform that brings ticket management, knowledge base, and MCP AI integration together.</p>
              <div className="lp-cta-row">
                <Link href="/signup" className="lp-btn-white">
                  Create free account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/login" className="lp-btn-ghost">Sign in</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="lp-footer">
          <p>© {new Date().getFullYear()} Support KB · Intelligent Ticket Management · Powered by MCP &amp; Firebase</p>
        </footer>

      </div>
    </>
  );
}
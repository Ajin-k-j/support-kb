'use client';
import Link from 'next/link';

const S = `
  .doc * { box-sizing: border-box; }
  .doc { font-family: 'Inter', sans-serif; background: #fff; color: #111827; }
  .doc-hero { background: linear-gradient(160deg,#f0f4ff 0%,#fafaff 70%,#fff 100%); padding: 5rem 1.5rem 4rem; text-align: center; }
  .doc-hero-eye { font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4f46e5;margin-bottom:.75rem; }
  .doc-hero-title { font-size:clamp(2rem,4vw,3rem);font-weight:900;letter-spacing:-.03em;color:#0f0a2e;margin-bottom:1rem;line-height:1.1; }
  .doc-hero-sub { font-size:1rem;color:#4b5563;max-width:540px;margin:0 auto 2rem;line-height:1.7; }
  .doc-hero-links { display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap; }
  .doc-pill { display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:99px;font-size:.82rem;font-weight:600;text-decoration:none;transition:all .2s; }
  .doc-pill-primary { background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;box-shadow:0 4px 14px rgba(79,70,229,.3); }
  .doc-pill-primary:hover { filter:brightness(1.08);transform:translateY(-1px);color:#fff;text-decoration:none; }
  .doc-pill-outline { background:#fff;color:#4f46e5;border:1.5px solid rgba(79,70,229,.25); }
  .doc-pill-outline:hover { border-color:#4f46e5;transform:translateY(-1px);text-decoration:none;color:#4f46e5; }

  .doc-toc { background:#f8faff;border-bottom:1px solid #e5e7eb;padding:1rem 1.5rem;position:sticky;top:64px;z-index:10; }
  .doc-toc-inner { max-width:1100px;margin:0 auto;display:flex;gap:.5rem;flex-wrap:wrap; }
  .doc-toc-link { padding:5px 14px;border-radius:99px;font-size:.78rem;font-weight:600;color:#4b5563;text-decoration:none;transition:all .18s;border:1px solid transparent; }
  .doc-toc-link:hover { background:#fff;color:#4f46e5;border-color:rgba(79,70,229,.2);text-decoration:none; }

  .doc-body { max-width:1100px;margin:0 auto;padding:3rem 1.5rem 5rem; }
  .doc-section { margin-bottom:4rem;scroll-margin-top:120px; }
  .doc-section-eye { font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4f46e5;margin-bottom:.5rem; }
  .doc-section-title { font-size:clamp(1.4rem,2.5vw,2rem);font-weight:900;color:#0f0a2e;letter-spacing:-.025em;margin-bottom:.6rem; }
  .doc-section-sub { font-size:.95rem;color:#4b5563;line-height:1.7;max-width:680px;margin-bottom:2rem; }
  .doc-divider { border:none;border-top:1px solid #e5e7eb;margin:3.5rem 0; }

  .doc-grid2 { display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem; }
  .doc-grid3 { display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem; }

  .doc-card { background:#f8faff;border:1px solid #e5e7eb;border-radius:14px;padding:1.5rem;transition:transform .18s,box-shadow .18s; }
  .doc-card:hover { transform:translateY(-3px);box-shadow:0 8px 28px rgba(79,70,229,.09); }
  .doc-card-icon { font-size:1.5rem;margin-bottom:.75rem; }
  .doc-card-title { font-size:.95rem;font-weight:700;color:#111827;margin-bottom:.4rem; }
  .doc-card-desc { font-size:.82rem;color:#6b7280;line-height:1.6; }

  .doc-steps { display:flex;flex-direction:column;gap:1rem;margin-top:1rem; }
  .doc-step { display:flex;gap:1rem;align-items:flex-start; }
  .doc-step-num { width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;font-size:.78rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px; }
  .doc-step-body {}
  .doc-step-title { font-size:.9rem;font-weight:700;color:#111827;margin-bottom:.25rem; }
  .doc-step-desc { font-size:.82rem;color:#6b7280;line-height:1.6; }

  .doc-code-block { background:#0f0a2e;color:#e2e8f0;border-radius:12px;padding:1.25rem 1.5rem;font-family:'SFMono-Regular',Consolas,monospace;font-size:.82rem;line-height:1.7;overflow-x:auto;margin:1rem 0; }
  .doc-code-block .kw { color:#818cf8; }
  .doc-code-block .cm { color:#64748b; }
  .doc-code-block .str { color:#86efac; }

  .doc-tag { display:inline-block;padding:2px 8px;border-radius:99px;font-size:.68rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-right:4px; }
  .doc-tag-blue { background:rgba(79,70,229,.08);color:#4f46e5; }
  .doc-tag-green { background:rgba(22,163,74,.08);color:#16a34a; }
  .doc-tag-amber { background:rgba(245,158,11,.08);color:#d97706; }
  .doc-tag-red { background:rgba(239,68,68,.08);color:#dc2626; }
  .doc-tag-cyan { background:rgba(6,182,212,.08);color:#0891b2; }
  .doc-tag-orange { background:rgba(234,88,12,.08);color:#ea580c; }

  .doc-alert { display:flex;gap:10px;padding:1rem 1.25rem;border-radius:10px;font-size:.85rem;line-height:1.6;margin:1.25rem 0; }
  .doc-alert-info { background:rgba(79,70,229,.06);border:1px solid rgba(79,70,229,.18);color:#1e1b4b; }
  .doc-alert-tip  { background:rgba(22,163,74,.06);border:1px solid rgba(22,163,74,.18);color:#14532d; }
`;

export default function Docs() {
  return (
    <>
      <style>{S}</style>
      <div className="doc">

        {/* HERO */}
        <section className="doc-hero">
          <div className="doc-hero-eye">Documentation</div>
          <h1 className="doc-hero-title">Support KB — Complete Guide</h1>
          <p className="doc-hero-sub">Everything you need to set up, operate, and connect your team to the Support Knowledge Base platform.</p>
          <div className="doc-hero-links">
            <Link href="/signup" className="doc-pill doc-pill-primary">Get started free</Link>
            <Link href="/login" className="doc-pill doc-pill-outline">Sign in</Link>
            <Link href="/" className="doc-pill doc-pill-outline">← Back to home</Link>
          </div>
        </section>

        {/* STICKY TOC */}
        <nav className="doc-toc">
          <div className="doc-toc-inner">
            {[
              ['#tickets','🎫 Tickets'],['#collaboration','🤝 Collaboration'],
              ['#troubleshooting','🔍 Troubleshooting'],['#code','💻 Code & Queries'],
              ['#rbac','🔐 Roles & Access'],['#mcp','⚡ MCP Connection'],
            ].map(([href,label])=>(
              <a key={href as string} href={href as string} className="doc-toc-link">{label as string}</a>
            ))}
          </div>
        </nav>

        <div className="doc-body">

          {/* ── TICKETS ── */}
          <section id="tickets" className="doc-section">
            <div className="doc-section-eye">Core Feature</div>
            <h2 className="doc-section-title">Ticket Management</h2>
            <p className="doc-section-sub">Create, assign, prioritize, and resolve support tickets through a structured lifecycle. Each ticket captures full context from customer description to internal investigation.</p>

            <div className="doc-grid2">
              {[
                {icon:'➕',title:'Creating a Ticket',desc:'Navigate to Dashboard → New Ticket. Fill in the title, customer description, business impact (Low/Medium/High/Critical), category, and optional supporting links. The ticket is auto-assigned a sequential ticket number.',tags:[{cls:'doc-tag-blue',l:'Core'}]},
                {icon:'📋',title:'Ticket Fields',desc:'Each ticket stores: title, support description, customer description, AI summary, status, business impact, category, assignedTo (owner), assignedUsers (collaborators), supportingLinks, and investigationLog.',tags:[{cls:'doc-tag-blue',l:'Schema'}]},
                {icon:'🔄',title:'Ticket Lifecycle',desc:'Tickets move through: Open → InProgress → Pending → Resolved → Closed. Status can be updated at any time by any assigned user. Closed tickets are archived but remain searchable.',tags:[{cls:'doc-tag-amber',l:'Workflow'}]},
                {icon:'✏️',title:'Editing Tickets',desc:'Open any ticket and click Edit. All fields including investigation log entries are editable. Every save updates the lastModified timestamp. Rich text is supported in descriptions.',tags:[{cls:'doc-tag-green',l:'Edit'}]},
                {icon:'👥',title:'Assigning Users',desc:'A ticket has one owner (assignedTo) and multiple collaborators (assignedUsers). Collaborators receive the ticket in their dashboard view and can add investigation log entries.',tags:[{cls:'doc-tag-blue',l:'Assignment'}]},
                {icon:'🔗',title:'Supporting Links',desc:'Attach multiple URLs to a ticket (one per line when creating). Useful for linking to Azure DevOps work items, Confluence pages, monitoring dashboards, or external bug reports.',tags:[{cls:'doc-tag-cyan',l:'Links'}]},
              ].map(c=>(
                <div className="doc-card" key={c.title}>
                  <div className="doc-card-icon">{c.icon}</div>
                  <div className="doc-card-title">{c.title}</div>
                  <div className="doc-card-desc">{c.desc}</div>
                  <div style={{marginTop:8}}>{c.tags.map(t=><span key={t.l} className={`doc-tag ${t.cls}`}>{t.l}</span>)}</div>
                </div>
              ))}
            </div>
          </section>
          <hr className="doc-divider"/>

          {/* ── COLLABORATION ── */}
          <section id="collaboration" className="doc-section">
            <div className="doc-section-eye">Teamwork</div>
            <h2 className="doc-section-title">Collaboration Features</h2>
            <p className="doc-section-sub">Support KB is built for teams. Investigation logs, user assignments, and the global search surface make cross-team collaboration seamless.</p>

            <div className="doc-grid2">
              {[
                {icon:'📝',title:'Investigation Log',desc:'Each ticket has a structured log with four entry types: Hypothesis (what you think is causing the issue), Action (what you did), Observation (what you found), and Communication (external or internal messages).',tags:[{cls:'doc-tag-blue',l:'Logs'}]},
                {icon:'🕐',title:'Log Attribution',desc:'Every log entry records the author name, email, userId, and an ISO timestamp. This creates an auditable trail of who did what and when during an investigation.',tags:[{cls:'doc-tag-amber',l:'Audit'}]},
                {icon:'🔍',title:'Global Search',desc:'Search across all tickets and KB articles simultaneously. Results highlight matching fields. Use the search bar in the top nav to find tickets by title, description, ticket number, or log content.',tags:[{cls:'doc-tag-green',l:'Search'}]},
                {icon:'📚',title:'Knowledge Base Articles',desc:'Create KB articles using the rich-text editor. Articles support headings, tables, code blocks, and links. Articles are separate from tickets but both appear in global search results.',tags:[{cls:'doc-tag-blue',l:'KB'}]},
                {icon:'📋',title:'Copy Investigation Log',desc:'On any ticket detail page, click the copy button next to the investigation log to copy the full log as formatted text — useful for pasting into emails, Slack, or incident reports.',tags:[{cls:'doc-tag-cyan',l:'UX'}]},
                {icon:'🏷️',title:'Business Impact Tags',desc:'Use Critical for P1 incidents, High for service degradation, Medium for workaround-available issues, and Low for cosmetic or non-urgent items. Impact drives dashboard sort order.',tags:[{cls:'doc-tag-red',l:'Priority'}]},
              ].map(c=>(
                <div className="doc-card" key={c.title}>
                  <div className="doc-card-icon">{c.icon}</div>
                  <div className="doc-card-title">{c.title}</div>
                  <div className="doc-card-desc">{c.desc}</div>
                  <div style={{marginTop:8}}>{c.tags.map(t=><span key={t.l} className={`doc-tag ${t.cls}`}>{t.l}</span>)}</div>
                </div>
              ))}
            </div>
          </section>
          <hr className="doc-divider"/>

          {/* ── TROUBLESHOOTING ── */}
          <section id="troubleshooting" className="doc-section">
            <div className="doc-section-eye">Operations</div>
            <h2 className="doc-section-title">Troubleshooting & Incident Response</h2>
            <p className="doc-section-sub">Use Support KB as your incident command center — from first alert to post-mortem, the platform captures everything.</p>

            <div className="doc-steps">
              {[
                {title:'1. Create a Critical Ticket',desc:'Set Business Impact to Critical. Assign yourself as owner and add all responders as collaborators. Paste the initial Azure alert or error message into the Customer Description field.'},
                {title:'2. Log Your First Hypothesis',desc:'In the Investigation Log, add a Hypothesis entry describing what you think is happening. This creates an anchor for the investigation and helps latecomers ramp up instantly.'},
                {title:'3. Record Actions as You Take Them',desc:'Each HAC console command, Groovy script run, or ImpEx import gets an Action entry. Paste the script or query you ran — the KB stores it for reuse later.'},
                {title:'4. Log Observations',desc:'Record what you found after each action: error messages, query result counts, Azure KQL output. Observations build the evidence trail for root-cause analysis.'},
                {title:'5. Log Communications',desc:'When you send a customer update or escalate to another team, add a Communication log entry. This keeps the ticket self-contained without needing to cross-reference emails.'},
                {title:'6. Resolve and Document',desc:'Once resolved, update status to Resolved, write an AI Summary capturing the root cause and fix, and optionally save any scripts used as a KB article for future reference.'},
              ].map(s=>(
                <div className="doc-step" key={s.title}>
                  <div className="doc-step-num">{s.title.split('.')[0]}</div>
                  <div className="doc-step-body">
                    <div className="doc-step-title">{s.title.replace(/^\d+\.\s/,'')}</div>
                    <div className="doc-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <hr className="doc-divider"/>

          {/* ── CODE & QUERIES ── */}
          <section id="code" className="doc-section">
            <div className="doc-section-eye">AI Code Intelligence</div>
            <h2 className="doc-section-title">Code, Queries & Script Help</h2>
            <p className="doc-section-sub">Support KB is purpose-built for SAP Commerce (Hybris) and Azure environments. Store, search, and generate queries directly from the platform.</p>

            <div className="doc-grid3">
              {[
                {icon:'🗄️',title:'Hybris FlexibleSearch',desc:'Store FlexibleSearch queries in KB articles. Tag them with the data model area (Product, Order, Catalog). The MCP agent can generate new queries from natural language.',tag:{cls:'doc-tag-orange',l:'Hybris'}},
                {icon:'⚙️',title:'Groovy Scripts',desc:'Document Groovy scripts for HAC console, ImpEx triggers, and backoffice hooks. Include the script, expected output, and any caveats. Version via ticket investigation log.',tag:{cls:'doc-tag-green',l:'Groovy'}},
                {icon:'📊',title:'Azure KQL',desc:'Save Log Analytics and Application Insights queries. Categorize by resource type (AppExceptions, Requests, Custom Events). Attach to incident tickets for future reference.',tag:{cls:'doc-tag-blue',l:'Azure KQL'}},
                {icon:'📦',title:'ImpEx Templates',desc:'Store ImpEx header + data templates for common operations: user creation, product import, catalog sync. Link directly from tickets where they were first used.',tag:{cls:'doc-tag-amber',l:'ImpEx'}},
                {icon:'🔌',title:'API References',desc:'Document REST and OCC API endpoints, headers, and example payloads. Useful for front-end integration guides and third-party connector documentation.',tag:{cls:'doc-tag-cyan',l:'API'}},
                {icon:'🤖',title:'AI Generation via MCP',desc:'Ask Claude (connected via MCP) to write a FlexibleSearch query or KQL expression in plain English. The agent returns the query and can attach it to an open ticket automatically.',tag:{cls:'doc-tag-blue',l:'MCP AI'}},
              ].map(c=>(
                <div className="doc-card" key={c.title}>
                  <div className="doc-card-icon">{c.icon}</div>
                  <div className="doc-card-title">{c.title}</div>
                  <div className="doc-card-desc">{c.desc}</div>
                  <div style={{marginTop:8}}><span className={`doc-tag ${c.tag.cls}`}>{c.tag.l}</span></div>
                </div>
              ))}
            </div>

            <div className="doc-alert doc-alert-tip" style={{marginTop:'2rem'}}>
              <span>💡</span>
              <span><strong>Tip:</strong> Connect Claude Desktop to your MCP server and ask: <em>&quot;Generate a Hybris FlexibleSearch query to find all orders placed in the last 7 days with status COMPLETED&quot;</em> — the agent will write it and optionally attach it to the relevant ticket.</span>
            </div>
          </section>
          <hr className="doc-divider"/>

          {/* ── RBAC ── */}
          <section id="rbac" className="doc-section">
            <div className="doc-section-eye">Security</div>
            <h2 className="doc-section-title">Roles & Access Control</h2>
            <p className="doc-section-sub">Support KB uses Firebase Authentication with a Firestore-backed RBAC system. New users must be approved by an admin before gaining access.</p>

            <div className="doc-grid2">
              {[
                {icon:'🔑',title:'User Roles',desc:'Two roles: hduser (standard support user) and admin. A third state is null — new users start here and cannot access the dashboard until an admin assigns a role.',tags:[{cls:'doc-tag-blue',l:'Roles'}]},
                {icon:'✅',title:'Admin Approval Flow',desc:'When a new user signs up (email or Google), their Firestore record is created with role: null. Admins see a pending badge in the nav and approve/reject from the Admin Panel.',tags:[{cls:'doc-tag-amber',l:'Approval'}]},
                {icon:'🛡️',title:'Admin Panel',desc:'Accessible at /admin for admin-role users only. Lists all users with their role status. Admins can promote users to hduser or admin, or revoke access by setting role to null.',tags:[{cls:'doc-tag-red',l:'Admin'}]},
                {icon:'🔒',title:'Route Protection',desc:'All dashboard, ticket, and admin routes check auth state. Unauthenticated users are redirected to /login. Users with role null see a pending-approval message instead of the dashboard.',tags:[{cls:'doc-tag-blue',l:'Guards'}]},
                {icon:'🌐',title:'Google Sign-In',desc:'Users can sign in or sign up with Google. Google sign-in creates a Firestore profile automatically with role: null — the approval flow still applies before dashboard access is granted.',tags:[{cls:'doc-tag-cyan',l:'OAuth'}]},
                {icon:'📧',title:'Password Reset',desc:'Email/password users can request a password reset from the login page. Firebase sends a reset email directly. Google-auth users manage passwords through their Google account.',tags:[{cls:'doc-tag-green',l:'Auth'}]},
              ].map(c=>(
                <div className="doc-card" key={c.title}>
                  <div className="doc-card-icon">{c.icon}</div>
                  <div className="doc-card-title">{c.title}</div>
                  <div className="doc-card-desc">{c.desc}</div>
                  <div style={{marginTop:8}}>{c.tags.map(t=><span key={t.l} className={`doc-tag ${t.cls}`}>{t.l}</span>)}</div>
                </div>
              ))}
            </div>
          </section>
          <hr className="doc-divider"/>

          {/* ── MCP ── */}
          <section id="mcp" className="doc-section">
            <div className="doc-section-eye">AI Integration</div>
            <h2 className="doc-section-title">Connecting an MCP Client</h2>
            <p className="doc-section-sub">The Support KB MCP server runs on Cloudflare Workers and exposes authenticated tools to any MCP-compatible AI client (Claude Desktop, Claude.ai, Cursor, etc.).</p>

            <div className="doc-alert doc-alert-info">
              <span>ℹ️</span>
              <span><strong>Prerequisites:</strong> You need your Support KB account credentials and the MCP server URL from your administrator. The MCP server uses Firebase Auth — your login credentials are the same.</span>
            </div>

            <div className="doc-steps" style={{marginTop:'1.5rem'}}>
              {[
                {title:'Get the MCP Server URL',desc:'Contact your admin for the Cloudflare Worker URL — it looks like https://support-kb-mcp.<account>.workers.dev. This is the SSE endpoint for MCP connections.'},
                {title:'Open Claude Desktop Settings',desc:'Go to Claude Desktop → Settings → Developer → Edit Config. This opens the claude_desktop_config.json file in your editor.'},
                {title:'Add the MCP Server Entry',desc:'Paste the MCP server config block below into the mcpServers section of the config file.'},
                {title:'Restart Claude Desktop',desc:'Save the config file and fully quit and reopen Claude Desktop. The Support KB tools should appear in the tool picker within a few seconds.'},
                {title:'Authenticate When Prompted',desc:'On first use, the MCP server will redirect you to a login page. Sign in with your Support KB credentials (email/password or Google). Your token is cached for subsequent sessions.'},
                {title:'Start Using the Agent',desc:'Try: "Show me all Critical tickets open this week" or "Create a ticket for the checkout 500 error we saw this morning". The agent has full read/write access to your ticket data.'},
              ].map((s,i)=>(
                <div className="doc-step" key={s.title}>
                  <div className="doc-step-num">{i+1}</div>
                  <div className="doc-step-body">
                    <div className="doc-step-title">{s.title}</div>
                    <div className="doc-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="doc-code-block" style={{marginTop:'1.75rem'}}>
              <span className="cm">{'// claude_desktop_config.json'}</span>{'\n'}
              {'{'}{'\n'}
              {'  '}<span className="str">&quot;mcpServers&quot;</span>{': {'}{'\n'}
              {'    '}<span className="str">&quot;support-kb&quot;</span>{': {'}{'\n'}
              {'      '}<span className="str">&quot;url&quot;</span>{': '}<span className="str">&quot;https://support-kb-mcp.YOUR_ACCOUNT.workers.dev/sse&quot;</span>{','}{'\n'}
              {'      '}<span className="str">&quot;type&quot;</span>{': '}<span className="str">&quot;sse&quot;</span>{'\n'}
              {'    }'}{'\n'}
              {'  }'}{'\n'}
              {'}'}
            </div>

            <h3 style={{fontSize:'1.05rem',fontWeight:700,color:'#111827',margin:'2rem 0 1rem'}}>Available MCP Tools</h3>
            <div className="doc-grid3">
              {[
                {icon:'🔍',title:'search_tickets',desc:'Search tickets by keyword, status, priority, or assignee. Returns matching ticket summaries.',tag:{cls:'doc-tag-blue',l:'Read'}},
                {icon:'🎫',title:'get_ticket',desc:'Fetch full ticket detail by human-readable ticket number (e.g. TKT-0042).',tag:{cls:'doc-tag-blue',l:'Read'}},
                {icon:'➕',title:'create_ticket',desc:'Create a new ticket with title, description, category, impact, and optional assignment.',tag:{cls:'doc-tag-green',l:'Write'}},
                {icon:'✏️',title:'update_ticket',desc:'Update ticket status, description, AI summary, or any editable field by ticket number.',tag:{cls:'doc-tag-green',l:'Write'}},
                {icon:'📚',title:'search_kb',desc:'Full-text search across Knowledge Base articles. Returns article titles and excerpts.',tag:{cls:'doc-tag-blue',l:'Read'}},
                {icon:'📝',title:'add_log_entry',desc:'Append a typed investigation log entry (Hypothesis / Action / Observation / Communication) to a ticket.',tag:{cls:'doc-tag-amber',l:'Write'}},
              ].map(c=>(
                <div className="doc-card" key={c.title}>
                  <div className="doc-card-icon">{c.icon}</div>
                  <div className="doc-card-title" style={{fontFamily:'monospace',fontSize:'.82rem'}}>{c.title}</div>
                  <div className="doc-card-desc">{c.desc}</div>
                  <div style={{marginTop:8}}><span className={`doc-tag ${c.tag.cls}`}>{c.tag.l}</span></div>
                </div>
              ))}
            </div>
          </section>

          {/* BACK LINK */}
          <div style={{textAlign:'center',paddingTop:'1rem'}}>
            <Link href="/" className="doc-pill doc-pill-outline">← Back to home</Link>
          </div>

        </div>

        {/* FOOTER */}
        <footer style={{background:'#0f0a2e',color:'rgba(255,255,255,.4)',padding:'1.5rem',textAlign:'center',fontSize:'.78rem'}}>
          © {new Date().getFullYear()} Support KB · <Link href="/" style={{color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Home</Link> · <Link href="/login" style={{color:'rgba(255,255,255,.5)',textDecoration:'none'}}>Sign In</Link>
        </footer>
      </div>
    </>
  );
}

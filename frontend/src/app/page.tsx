import React from 'react';
import { 
  Server, Database, Cpu, ShieldCheck, Layers, 
  MessageSquare, Zap, Terminal, Box, ChevronRight,
  Code2, Share2, Activity, HardDrive, Network
} from 'lucide-react';

// --- Sub-components for better organization ---

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <div className="flex items-center gap-3 mb-6 group">
    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
      <Icon className="h-6 w-6" />
    </div>
    <h2 className="text-2xl font-bold tracking-tight">{children}</h2>
  </div>
);

const TechCard = ({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) => (
  <div className="p-5 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all hover:shadow-lg group">
    <Icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
    <h3 className="font-bold text-lg mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

const CodeBlock = ({ code, language }: { code: string, language: string }) => (
  <div className="relative my-6 rounded-xl overflow-hidden border border-border/50 bg-slate-950 shadow-2xl">
    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{language}</span>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
      </div>
    </div>
    <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

// --- Main Page Component ---

export default function DocumentationPage() {
  return (
    <div className="max-h-screen bg-background py-20 text-foreground selection:bg-primary/30">
      {/* Hero Section */}
      <div className="relative border-b border-border/40 bg-muted/20 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 border border-primary/20">
              <Activity className="h-3 w-3" />
              SYSTEM ARCHITECTURE v1.0
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Scalable Chat Application
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A microservice-friendly, event-driven architecture designed for high-throughput 
              real-time messaging. Built to scale from 1-to-1 chats to massive group interactions 
              using Kafka and Cassandra.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <main className="lg:col-span-9 space-y-20">
            
            {/* Overview */}
            <section id="overview">
              <SectionTitle icon={Layers}>System Overview</SectionTitle>
              <p className="text-muted-foreground mb-6">
                The system runs locally behind <strong>NGINX on port 5000</strong>. It utilizes modern 
                production-grade technologies to handle authentication, message persistence, fanout, 
                delivery, caching, and rate limiting.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TechCard icon={Cpu} title="Frontend" desc="Next.js with Socket.IO for seamless real-time UI updates." />
                <TechCard icon={Server} title="Backend" desc="Node.js/Express handling REST APIs and Kafka producers." />
                <TechCard icon={Share2} title="Event Streaming" desc="Kafka managing message pipelines and fanout logic." />
                <TechCard icon={HardDrive} title="Persistence" desc="Cassandra for high-write chat logs and Postgres for users." />
              </div>
            </section>

            {/* Visual Architecture */}
            <section id="architecture">
              <SectionTitle icon={Network}>High-Level Architecture</SectionTitle>
              <div className="p-8 rounded-3xl border border-border/50 bg-muted/30 flex flex-col items-center gap-4 text-center">
                <div className="px-6 py-3 rounded-xl bg-background border border-border shadow-sm font-bold">Client (Next.js)</div>
                <ChevronRight className="rotate-90 text-muted-foreground" />
                <div className="px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold">NGINX (Reverse Proxy)</div>
                <ChevronRight className="rotate-90 text-muted-foreground" />
                <div className="px-6 py-3 rounded-xl bg-background border border-border shadow-sm font-bold uppercase tracking-wider text-xs">Backend (Socket.IO Server)</div>
                <div className="w-px h-8 bg-border" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  <div className="p-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5">
                    <p className="text-xs font-bold mb-3 uppercase opacity-60 italic">Topic: chat_messages</p>
                    <div className="space-y-2">
                      <div className="p-2 bg-background rounded-lg border text-sm">Persistence Consumer → Cassandra</div>
                      <div className="p-2 bg-background rounded-lg border text-sm">Fanout Consumer → chat_delivery</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-dashed border-blue-400/40 bg-blue-400/5">
                    <p className="text-xs font-bold mb-3 uppercase opacity-60 italic">Topic: chat_delivery</p>
                    <div className="p-2 bg-background rounded-lg border text-sm">Delivery Consumer → Socket.IO</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Database Design */}
            <section id="database">
              <SectionTitle icon={Database}>Database Design</SectionTitle>
              
              <h3 className="text-xl font-bold mb-4 mt-8 flex items-center gap-2">
                <span className="w-8 h-px bg-primary/40" /> PostgreSQL: User Management
              </h3>
              <CodeBlock 
                language="sql" 
                code={`CREATE TABLE users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  username VARCHAR(50) UNIQUE NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  password_hash TEXT NOT NULL,\n  avatar_url TEXT DEFAULT NULL\n);`} 
              />

              <h3 className="text-xl font-bold mb-4 mt-8 flex items-center gap-2">
                <span className="w-8 h-px bg-primary/40" /> Cassandra: Chat Time-Series
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Optimized for partition-key based queries and high-write throughput.</p>
              <CodeBlock 
                language="sql" 
                code={`CREATE TABLE chat.messages (\n  conversation_id UUID,\n  message_ts TIMESTAMP,\n  message_id UUID,\n  sender_id UUID,\n  content TEXT,\n  PRIMARY KEY ((conversation_id), message_ts, message_id)\n) WITH CLUSTERING ORDER BY (message_ts DESC, message_id DESC);`} 
              />
            </section>

            {/* Security */}
            <section id="security">
              <SectionTitle icon={ShieldCheck}>Security & Resilience</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                  <Zap className="h-6 w-6 text-yellow-500 shrink-0" />
                  <div>
                    <h4 className="font-bold">Rate Limiting</h4>
                    <p className="text-sm text-muted-foreground">Redis-backed windowing to prevent brute-force on auth endpoints.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border/40">
                  <Box className="h-6 w-6 text-blue-500 shrink-0" />
                  <div>
                    <h4 className="font-bold">JWT Stateless Auth</h4>
                    <p className="text-sm text-muted-foreground">HTTP-only cookies for tokens with refresh rotation logic.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Setup */}
            <section id="setup">
              <SectionTitle icon={Terminal}>Deployment</SectionTitle>
              <p className="text-muted-foreground mb-4">Spin up the entire infrastructure with a single command:</p>
              <CodeBlock 
                language="bash" 
                code={`# Start all microservices and infrastructure\ndocker-compose up --build\n\n# Application now accessible at:\nhttp://localhost:5000`} 
              />
            </section>

          </main>

          {/* Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-8">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">On this page</h4>
                <nav className="flex flex-col gap-3 border-l border-border/60 ml-1">
                  {['Overview', 'Architecture', 'Database', 'Security', 'Setup'].map((item) => (
                    <a 
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="pl-4 text-sm text-muted-foreground hover:text-primary hover:border-l hover:border-primary -ml-px transition-all"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="text-xs font-bold text-primary uppercase mb-2">Pro Tip</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The Fanout Consumer is group-ready. Simply modify the participant lookup logic to scale from 1v1 to many-to-many.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
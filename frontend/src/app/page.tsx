"use client"

import React, { useState } from 'react';
import { 
  Server, Database, Cpu, ShieldCheck, Layers, 
  MessageSquare, Zap, Terminal, Box, ChevronRight,
  Code2, Share2, Activity, HardDrive, Network,
  Copy, Check, ArrowRight, ShieldAlert, Globe
} from 'lucide-react';

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <div className="flex items-center gap-3 mb-8 group">
    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm border border-indigo-500/20">
      <Icon className="h-6 w-6" />
    </div>
    <h2 className="text-3xl font-bold tracking-tight text-slate-100">{children}</h2>
  </div>
);

const TechCard = ({ title, desc, icon: Icon, colorClass }: { title: string, desc: string, icon: any, colorClass: string }) => (
  <div className={`p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md hover:border-${colorClass}-500/50 transition-all hover:-translate-y-1 group shadow-xl`}>
    <Icon className={`h-8 w-8 text-${colorClass}-400 mb-4 group-hover:scale-110 transition-transform`} />
    <h3 className="font-bold text-lg mb-2 text-slate-100">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
  </div>
);

const CodeBlock = ({ code, language }: { code: string, language: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-8 rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-2xl group">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
           <Code2 className="h-4 w-4 text-indigo-400" />
           <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{language}</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-indigo-400"
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const FlowNode = ({ label, sub, color }: { label: string, sub?: string, color: string }) => (
  <div className={`flex flex-col items-center p-3 rounded-lg border bg-slate-900 min-w-[120px] shadow-lg border-${color}-500/30`}>
    <span className={`text-[10px] font-bold uppercase tracking-tighter text-${color}-400 mb-1`}>{sub}</span>
    <span className="text-xs font-bold text-slate-100">{label}</span>
  </div>
);

export default function DocumentationPage() {
  return (
    <div className="max-h-screen bg-[#020617] text-slate-300 selection:bg-indigo-500/30 font-sans">
      <div className="relative overflow-hidden border-b border-slate-800 bg-slate-900/20 py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mb-8 border border-indigo-500/20">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            SYSTEM ARCHITECTURE v1.0.4
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white">
            Distributed <span className="text-indigo-500">Messaging</span> <br />Core Infrastructure
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-3xl">
            An enterprise-grade, event-driven architecture utilizing <strong>Kafka</strong> for ingestion, 
            <strong>Redis</strong> for stateful rate-limiting, and <strong>Cassandra</strong> for linear write-scaling.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <main className="lg:col-span-9 space-y-32">
            
            <section id="overview">
              <SectionTitle icon={Layers}>System Overview</SectionTitle>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                The architecture implements a <strong>Message-Oriented Middleware (MOM)</strong> pattern. 
                Incoming traffic is load-balanced by Nginx, processed by a stateless Node.js cluster, 
                and distributed via an event bus for persistence and delivery.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TechCard icon={Globe} colorClass="blue" title="Nginx Ingress" desc="Standard Reverse Proxy on Port 5000 handling SSL termination and sticky sessions." />
                <TechCard icon={Zap} colorClass="amber" title="Redis Cache" desc="Distributed rate limiting and session management for auth routes." />
                <TechCard icon={Share2} colorClass="indigo" title="Kafka Bus" desc="High-throughput messaging pipeline with specialized persistence consumers." />
                <TechCard icon={HardDrive} colorClass="emerald" title="Hybrid DB" desc="ACID compliant PostgreSQL for users; NoSQL Cassandra for chat history." />
              </div>
            </section>

            <section id="architecture">
              <SectionTitle icon={Network}>Dynamic Data Flow</SectionTitle>
              <div className="p-10 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-x-auto shadow-inner">
                <div className="min-w-[800px] flex flex-col gap-12">
                  
                  <div className="flex items-center gap-4">
                    <div className="w-32 py-4 px-2 bg-indigo-500 text-white rounded-lg font-bold text-center text-sm shadow-lg shadow-indigo-500/20">Client</div>
                    <ArrowRight className="text-slate-600" />
                    <FlowNode label="Nginx LB" sub="Port 5000" color="slate" />
                    <ArrowRight className="text-slate-600" />
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <FlowNode label="Register" sub="Auth" color="blue" />
                          <ArrowRight className="text-slate-600 w-4" />
                          <FlowNode label="Postgres" sub="DB" color="emerald" />
                       </div>
                       <div className="flex items-center gap-2">
                          <FlowNode label="Login" sub="Auth" color="blue" />
                          <ArrowRight className="text-slate-600 w-4" />
                          <FlowNode label="Redis" sub="Rate Limit" color="amber" />
                          <ArrowRight className="text-slate-600 w-4" />
                          <FlowNode label="Postgres" sub="DB" color="emerald" />
                       </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-800 w-full" />

                  <div className="flex items-center gap-4">
                    <div className="w-32 py-4 px-2 bg-indigo-500 text-white rounded-lg font-bold text-center text-sm">Client</div>
                    <ArrowRight className="text-slate-600" />
                    <FlowNode label="Node Server" sub="Socket.io" color="slate" />
                    <ArrowRight className="text-slate-600" />
                    <div className="p-4 border border-indigo-500/40 rounded-xl bg-indigo-500/5 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                         <div className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded italic">MsgPack Serialization</div>
                         <ArrowRight className="text-slate-600 w-4" />
                         <FlowNode label="Kafka" sub="Event Bus" color="indigo" />
                         <ArrowRight className="text-slate-600 w-4" />
                         <div className="grid grid-cols-1 gap-2">
                            <FlowNode label="Delivery Worker" sub="Fanout" color="blue" />
                            <FlowNode label="Persist Worker" sub="Cassandra" color="emerald" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="database">
              <SectionTitle icon={Database}>Data Schemas</SectionTitle>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">PostgreSQL User Table</h3>
                  </div>
                  <CodeBlock 
                    language="sql" 
                    code={`CREATE TABLE users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  username VARCHAR(50) UNIQUE NOT NULL,\n  email VARCHAR(255) UNIQUE NOT NULL,\n  password_hash TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);`} 
                  />
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Cassandra Time-Series</h3>
                  </div>
                  <CodeBlock 
                    language="sql" 
                    code={`CREATE TABLE chat.messages (\n  conversation_id UUID,\n  message_ts TIMESTAMP,\n  message_id TIMEUUID,\n  sender_id UUID,\n  content TEXT,\n  PRIMARY KEY ((conversation_id), message_ts, message_id)\n) WITH CLUSTERING ORDER BY (message_ts DESC);`} 
                  />
                </div>
              </div>
            </section>

            <section id="security">
              <SectionTitle icon={ShieldCheck}>Security Architecture</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
                  <ShieldAlert className="h-10 w-10 text-red-400 mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Rate Limiting</h4>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    We utilize a <strong>Fixed Window Counter</strong> algorithm stored in Redis.
                  </p>
                  <ul className="space-y-2 text-xs font-mono text-slate-500 uppercase">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-red-400 rounded-full"/> Login: 5 attempts / 1m</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-red-400 rounded-full"/> Messages: 20 / 1m</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 bg-red-400 rounded-full"/> API Req: 100 / 1m</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
                  <Box className="h-10 w-10 text-blue-400 mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Payload Optimization</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Messages are serialized using <strong>MsgPack</strong> before hitting Kafka, reducing bandwidth consumption by up to 40% compared to standard JSON.
                  </p>
                </div>
              </div>
            </section>

          </main>

          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-10">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Navigation</h4>
                <nav className="flex flex-col gap-1 border-l border-slate-800">
                  {['Overview', 'Architecture', 'Database', 'Security'].map((item) => (
                    <a 
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="pl-6 py-2 text-sm font-medium text-slate-400 hover:text-indigo-400 hover:border-l-2 hover:border-indigo-500 -ml-[1px] transition-all"
                    >
                      {item}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                  <Zap className="h-12 w-12 text-indigo-400" />
                </div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Performance Note</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  The Cassandra schema uses <code>message_ts</code> as a clustering key to ensure O(1) retrieval for the most recent 50 messages in any conversation.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
      
      <footer className="border-t border-slate-800 bg-slate-950 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <SectionTitle icon={Terminal}>Quick Start</SectionTitle>
          <CodeBlock 
            language="bash" 
            code={`\ndocker-compose up -d --build\n\n# Health Check\ncurl http://localhost:5000/api/v1/health`} 
          />
        </div>
      </footer>
    </div>
  );
}
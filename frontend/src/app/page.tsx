"use client"

import React, { useState, useEffect } from 'react';
import {
  Server, Database, Layers, Terminal, ChevronRight, Share2,
  Activity, HardDrive, Check, Globe, Maximize2, X, Minus, Zap
} from 'lucide-react';

const TerminalWindow = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background p-4 md:p-4 font-mono selection:bg-primary/30">
    <div className="max-w-6xl max-h-[80vh] mx-auto rounded-lg border border-border bg-card shadow-2xl overflow-hidden">
      <div className="bg-muted/50 border-b border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-chart-4/80" />
            <div className="w-3 h-3 rounded-full bg-chart-2/80" />
          </div>
          <div className="ml-4 flex items-center gap-2 text-muted-foreground text-xs font-bold tracking-widest uppercase">
            <Terminal className="h-3 w-3" />
            <span>debian — alacritty: Tokyo_Night_Storm_Theme</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground/50">
          <Minus className="h-4 w-4" />
          <Maximize2 className="h-3 w-3" />
          <X className="h-4 w-4" />
        </div>
      </div>
      <div className="p-6 md:p-10 space-y-12 max-h-[85vh] overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

const Prompt = ({ command }: { command: string }) => (
  <div className="flex items-center gap-2 mb-6 text-sm md:text-base">
    <span className="text-chart-2 font-bold">tanmoy@debian</span>
    <span className="text-muted-foreground">:</span>
    <span className="text-chart-3 font-bold">~/Scalable_Chat_App</span>
    <span className="text-foreground">$ {command}</span>
    <span className="w-2 h-5 bg-primary animate-pulse ml-1" />
  </div>
);

const SectionHeader = ({ title, id }: { title: string, id: string }) => (
  <div className="relative flex items-center gap-4 mb-8 group" id={id}>
    <div className="text-primary font-bold text-xl md:text-2xl">
      <span className="text-muted-foreground mr-2">#</span>
      {title.toUpperCase()}
    </div>
    <div className="flex-1 h-px bg-border group-hover:bg-primary/50 transition-colors" />
  </div>
);

const AsciiCard = ({ title, desc, icon: Icon, color }: { title: string, desc: string, icon: any, color: string }) => (
  <div className="p-5 border border-border hover:border-primary/50 bg-secondary/30 transition-all group relative">
    <div className={`absolute top-0 right-0 p-2 text-muted-foreground/20 group-hover:text-primary/40`}>
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="text-primary font-bold mb-2 flex items-center gap-2">
      <ChevronRight className="h-4 w-4" /> {title}
    </h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

export default function AlacrittyDocs() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <TerminalWindow>
      <header className="space-y-4">
        <Prompt command="cat Readme.md" />
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground italic uppercase">
            Distributed <span className="text-primary not-italic">Messaging</span>
          </h1>
          <div className="flex items-center gap-4 text-chart-2 text-sm font-bold">
            <span className="bg-chart-2/10 px-2 py-0.5 border border-chart-2/30">STATUS: EXPERIMENTAL</span>
            <span className="bg-chart-3/10 px-2 py-0.5 border border-chart-3/30 text-chart-3">BUILD: 0.5.1-DEV</span>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed border-l-4 border-muted pl-6 italic">
          High-performance event ingestion via Kafka, Redis-backed rate limiting,
          and Cassandra time-series persistence.
        </p>
      </header>

      <section>
        <SectionHeader title="System Architecture" id="overview" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AsciiCard icon={Globe} title="Nginx Ingress" desc="L7 Load balancing & SSL termination at Port 5000." color="chart-1" />
          <AsciiCard icon={Zap} title="Redis Layer" desc="Session state & sliding window rate limiting." color="chart-4" />
          <AsciiCard icon={Share2} title="Kafka Pipeline" desc="The central nervous system for event bus distribution." color="chart-1" />
          <AsciiCard icon={HardDrive} title="Storage Hybrid" desc="PostgreSQL (Auth) + Cassandra (Event Persistence)." color="chart-2" />
        </div>
      </section>

      <section>
        <SectionHeader title="Flow Diagram" id="architecture" />
        <div className="p-6 border border-border bg-black/20 overflow-x-auto font-mono text-xs md:text-sm leading-tight text-chart-2">
          <pre>
            {`[CLIENT] ----(HTTPS)----> [NGINX_LB]
                             |
         +-------------------+-------------------+
         |                                       |
    [AUTH_SERVICE]                          [WS_SERVICE]
         |                                       |
    (Redis/PG)                              (MsgPack)
         |                                       |
         |                                  [KAFKA_BUS]
         |                                       |
         |                   +-------------------+-------------------+
         |                   |                                       |
         +-------------> [PERSIST_WORKER]                      [FANOUT_WORKER]
                             |                                       |
                        [CASSANDRA]                             [PUSH_NOTIF]`}
          </pre>
        </div>
      </section>

      {/* Code Section */}
      <section>
        <SectionHeader title="Data Schemas" id="database" />
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold ml-1">
              <Layers className="h-3 w-3" /> KEYSPACE.JS
            </div>
            <pre className="p-4 bg-muted/30 border border-border text-foreground overflow-x-auto text-sm">
              <code>{`CREATE KEYSPACE chat
WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'dc1': 2
};`}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold ml-1">
              <Database className="h-3 w-3" /> USERS_TABLE.SQL
            </div>
            <pre className="p-4 bg-muted/30 border border-border text-foreground overflow-x-auto text-sm">
              <code>{`CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT DEFAULT NULL
);`
              }</code>
            </pre>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold ml-1">
              <Activity className="h-3 w-3" /> MESSAGES_CS.CQL
            </div>
            <pre className="p-4 bg-muted/30 border border-border text-foreground overflow-x-auto text-sm">
              <code>{`CREATE TABLE chat.messages (
  conversation_id UUID,
  message_ts TIMESTAMP,
  message_id UUID,
  sender_id UUID,
  content TEXT,
  PRIMARY KEY ((conversation_id), message_ts, message_id)
)
WITH CLUSTERING ORDER BY (message_ts DESC, message_id DESC);`}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold ml-1">
              <Server className="h-3 w-3" /> CONVERSATIONS_CS.CQL
            </div>
            <pre className="p-4 bg-muted/30 border border-border text-foreground overflow-x-auto text-sm">
              <code>{`CREATE TABLE chat.conversations (
  participant_id UUID,
  peer_id UUID,
  last_message_at TIMESTAMP,
  conversation_id UUID,
  last_message TEXT,
  PRIMARY KEY ((participant_id), last_message_at, conversation_id)
)
WITH CLUSTERING ORDER BY (last_message_at DESC, conversation_id DESC);`}</code>
            </pre>
          </div>

        </div>
      </section>

      <footer className="mt-20 pt-10 pb-20 border-t border-border">
        <Prompt command="docker-compose up -d" />
        <div className="bg-primary/10 border border-primary/20 p-4 text-primary text-sm">
          <div className="flex items-center gap-2 mb-2 font-bold">
            <Check className="h-4 w-4" />
            DEPLOYMENT SUCCESSFUL
          </div>
          <p className="text-muted-foreground">
            Architecture validated. Nodes active: 12. Latency: 42ms.
          </p>
        </div>
      </footer>
    </TerminalWindow>
  );
}
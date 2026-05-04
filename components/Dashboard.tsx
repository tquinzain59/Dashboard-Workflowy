"use client";

import React, { useState } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import Tile from './Tile';
import TreeView from './TreeView';

const TARGET_NODES = [
  { id: "weather", name: "☁️ Météo Lille", color: "var(--metro-blue)", type: "weather" },
  { id: "calendar", name: "📅 Mon Agenda", color: "var(--metro-yellow)", type: "calendar" },
  { id: "gmail", name: "📧 Gmail Urgents", color: "var(--metro-red)", type: "gmail" },
  { id: "08a049b5-462c-40c0-99f3-1e804e59a346", name: "🤖 Jarvis", color: "var(--metro-teal)", type: "jarvis" },
  { id: "4d8fe5ba-e7ff-ab16-6f56-f0e27065ec4f", name: "👦 Léonard", color: "var(--metro-green)", type: "lecture" },
  { id: "9ae75ce1-172b-613b-1924-66e2e8013ace", name: "🦱 Eliott", color: "var(--metro-orange)", type: "lecture" },
  { id: "dd614930-5f64-80b3-359f-5c0596ab3f7e", name: "📝 Utiles", color: "var(--metro-purple)", type: "lecture" },
  { id: "85126189-645a-0ca0-42ef-89c1e40fe990", name: "📥 Inbox", color: "var(--metro-grey)", type: "lecture" },
  { id: "891e76c6-24d4-86a1-0616-78a487ec8c2d", name: "🐠 Aquarium", color: "var(--metro-teal)", type: "aquarium" },
  { id: "88b90ad4-272b-b276-20e2-572d6141243b", name: "✅ Reminder", color: "var(--metro-orange)", type: "lecture" },
  { id: "96879b8a-12f6-4496-bd9e-0f8bc39beacd", name: "🔬 Veille technologique", color: "var(--metro-pink)", type: "lecture" },
  { id: "df2b3606-b072-057d-0d24-23b637b084e3", name: "✅ Projects", color: "var(--metro-blue)", type: "lecture" },
  { id: "f5f05c51-fe5c-2851-d65e-28da8c780204", name: "👨🏫 Définition", color: "var(--metro-yellow)", type: "lecture" },
  { id: "7d180011-0a56-388c-26af-330998f2f5cd", name: "🦾 Tools", color: "var(--metro-purple)", type: "lecture" },
  { id: "4bd3d791-3ec0-4cfe-f47d-4dee6a69d56e", name: "🐠 Conseil de famille", color: "var(--metro-green)", type: "lecture" },
  { id: "8420c2f6-0ef2-2ebe-22f9-ca540779e2fc", name: "📚 Books", color: "var(--metro-red)", type: "lecture" },
  { id: "966a3cb3-15d6-a83f-5781-bbd8111159eb", name: "📱 Méthodes", color: "var(--metro-grey)", type: "lecture" },
  { id: "6be23f49-320d-0fa9-3b0d-e0405fe5e570", name: "🏛️ Finances", color: "var(--metro-orange)", type: "finances" },
  { id: "39ca585d-0627-aa1f-28b4-a424bf4c8d54", name: "🗣️ Citations", color: "var(--metro-pink)", type: "citations" },
];

export default function Dashboard() {
  const { data: session } = useSession();
  const [jarvisOpen, setJarvisOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title">Mon Espace</h1>
          <p className="dashboard-subtitle">Synchronisé en temps réel avec Workflowy & Google</p>
        </div>
        <div>
          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Connecté: {session.user?.email}</span>
              <button 
                onClick={() => signOut()} 
                style={{ padding: '10px 20px', borderRadius: '0', border: '1px solid var(--text-secondary)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn('google')} 
              style={{ padding: '12px 24px', borderRadius: '0', border: 'none', background: 'var(--metro-blue)', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
            >
              Google Connexion
            </button>
          )}
        </div>
      </header>

      <div className="grid">
        {TARGET_NODES.map((node) => (
          <Tile 
            key={node.id}
            id={node.id}
            name={node.name}
            color={node.color}
            type={node.type}
            onJarvisClick={() => setJarvisOpen(true)}
          />
        ))}
      </div>

      {jarvisOpen && (
        <div className="fullscreen-modal">
          <button className="fullscreen-close" onClick={() => setJarvisOpen(false)}>×</button>
          <h2 className="fullscreen-title">🤖 Jarvis - Openclaw & Mémoire</h2>
          <div className="tree-container" style={{fontSize: '1.2rem'}}>
            <TreeView item={{id: "08a049b5-462c-40c0-99f3-1e804e59a346", name: "Paramètres Système"}} defaultExpanded={true} />
          </div>
        </div>
      )}
    </div>
  );
}

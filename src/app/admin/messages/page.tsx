'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'subscribers'>('messages');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/contact').then((res) => res.json()),
      fetch('/api/newsletter').then((res) => res.json()),
    ])
      .then(([msgData, subData]) => {
        if (msgData.messages) setMessages(msgData.messages);
        if (subData.subscribers) setSubscribers(subData.subscribers);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="">
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-extrabold text-navy-950 font-heading">
          Inquiries & Communications
        </h1>
        <p className="text-xs text-slate-500">
          Review community contact enquiries and manage newsletter subscribers
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'messages'
              ? 'border-gold-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Contact Enquiries ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'subscribers'
              ? 'border-gold-500 text-navy-950'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Newsletter Subscribers ({subscribers.length})
        </button>
      </div>

      {activeTab === 'messages' ? (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-xs text-slate-400">
              No contact inquiries received yet.
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-navy-950">{m.subject}</h3>
                    <p className="text-xs text-slate-500">
                      From: <strong className="text-slate-700">{m.name}</strong> ({m.email} {m.phone ? `• ${m.phone}` : ''})
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDateTime(m.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-warm-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                  {m.message}
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subscriber Email</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Date Subscribed</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">No subscribers yet.</td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-4 font-mono font-bold text-navy-950">{s.email}</td>
                    <td className="py-3 px-4">{s.name || '-'}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(s.subscribedAt)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

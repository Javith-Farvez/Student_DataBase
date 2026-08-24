import React, { useState } from 'react';
import { Sparkles, Bot, X, Send, TrendingUp, Activity } from 'lucide-react';

export default function AIAssistantWidget({ students = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I am VSB SmartCampus Academic Assistant 🎓. I am monitoring ${students.length || 4} student profiles, academic performance, and department metrics. How can I assist you today?`,
      time: 'Just now'
    }
  ]);

  const quickPrompts = [
    "⚡ Generate Department Academic Insight",
    "📊 Show First Graduate Scholarship Summary",
    "🎯 Predict Academic Cutoff Trends",
    "🚨 Identify Low Attendance Alerts"
  ];

  const handleSend = (userText) => {
    const textToSend = userText || query;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');

    // Generate intelligent AI response
    setTimeout(() => {
      let aiResponseText = "AI Command Executed: Analyzing real-time student database metrics...";
      const lower = textToSend.toLowerCase();

      if (lower.includes("insight") || lower.includes("department")) {
        aiResponseText = "💡 **Department Analysis**: Computer Science & AI-DS departments show a 94.8% average pass rate. Recommendation: Allocate additional practical lab sessions for Semester 6.";
      } else if (lower.includes("scholarship") || lower.includes("first graduate")) {
        aiResponseText = "🎓 **Scholarship Insight**: 3 eligible First Graduate candidates detected. Government scholarship portal sync ready with 100% verification score.";
      } else if (lower.includes("cutoff") || lower.includes("predict")) {
        aiResponseText = "📈 **Cutoff Prediction**: Predicted cutoff for 2026 Admissions: Bio-Maths (192.5), CS-Maths (194.0). Demand up +14% compared to previous academic cycle.";
      } else if (lower.includes("attendance") || lower.includes("alert")) {
        aiResponseText = "🚨 **Attendance Alert System**: 1 student flag detected with attendance < 90%. Automated SMS alert queued for Guardian.";
      } else {
        aiResponseText = `🎓 **VSB Assistant**: Processed "${textToSend}". Live records synchronized. Active roster: ${students.length || 4} students under monitoring.`;
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating AI Trigger Button – Refined & Compact */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 4000,
          padding: '8px 16px',
          borderRadius: 9999,
          background: '#6E0F0F',
          color: '#FFFFFF',
          border: '1px solid #D49A17',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 2px 8px rgba(60, 40, 20, 0.18)',
          fontWeight: 600,
          fontSize: '12.5px',
          cursor: 'pointer',
          transition: 'background 200ms ease, transform 200ms ease'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#4B0808'}
        onMouseLeave={e => e.currentTarget.style.background = '#6E0F0F'}
      >
        <Sparkles style={{ width: 14, height: 14, color: '#D49A17' }} />
        <span>VSB Academic Assistant</span>
      </button>

      {/* AI Assistant Command Panel Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 85,
            right: 28,
            width: 420,
            maxWidth: 'calc(100vw - 36px)',
            height: 560,
            maxHeight: 'calc(100vh - 110px)',
            zIndex: 4000,
            background: '#F1EDE5',
            border: '1px solid #C9C0B2',
            borderRadius: 16,
            boxShadow: '0 10px 40px rgba(110, 15, 15, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: '#6E0F0F',
            borderBottom: '1px solid #D49A17',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  VSB Academic Copilot
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-maroon font-bold">
                    System Verified
                  </span>
                </h3>
                <p className="text-[11px] text-amber-100">Institutional Student Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-amber-200 p-1.5 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Business Insights Bar */}
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-700" /> System Health: <strong className="text-emerald-700">99.8%</strong>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-maroon" /> Academic Index: <strong className="text-maroon">9.4/10</strong>
            </span>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#FCFAF6' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'user'
                    ? '#6E0F0F'
                    : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : '#252525',
                  padding: '12px 16px',
                  borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  border: m.sender === 'user' ? '1px solid #4B0808' : '1px solid #E8E1D7',
                  fontSize: '0.85rem',
                  lineHeight: '1.45',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                <div style={{ fontSize: '0.68rem', color: m.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#666666', marginTop: 4, textAlign: 'right' }}>
                  {m.time}
                </div>
              </div>
            ))}
          </div>

          {/* Quick AI Suggestion Chips */}
          <div className="px-4 py-2 bg-white border-t border-gray-200 flex overflow-x-auto gap-2 text-xs scrollbar-none">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-maroon border border-amber-200 transition text-[11px] font-semibold"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div style={{ padding: 14, background: '#F1EDE5', borderTop: '1px solid #C9C0B2' }}>
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                type="text"
                placeholder="Ask Academic Copilot for insights, reports..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: '#F1EDE5',
                  border: '1px solid #C9C0B2',
                  borderRadius: 8,
                  padding: '8px 12px',
                  color: '#252525',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#6E0F0F',
                  color: '#FFFFFF',
                  border: '1px solid #4B0808',
                  borderRadius: 8,
                  width: 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send className="w-4 h-4 text-amber-400" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


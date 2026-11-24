import React, { useState } from 'react';
import {
  X,
  BellRing,
  Bell,
  Trash2,
  Plus,
  Play,
  CheckCheck,
  Clock,
  Calendar,
  ShieldCheck,
  Power
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationsDrawer: React.FC = () => {
  const {
    rules,
    alerts,
    unreadCount,
    browserPermission,
    requestBrowserPermission,
    removeRule,
    toggleRuleEnabled,
    testFireRule,
    markAllAlertsRead,
    markAlertRead,
    clearAlerts,
    openNotifyModal,
    isDrawerOpen,
    setIsDrawerOpen
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'rules' | 'inbox'>('rules');

  if (!isDrawerOpen) return null;

  const formatTiming = (timing: string, customDateTime?: string) => {
    if (timing === 'custom_time' && customDateTime) {
      return new Date(customDateTime).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const map: Record<string, string> = {
      at_launch: 'At Launch (T-0)',
      '1h_before': '1 Hour Before',
      '24h_before': '24 Hours Before',
      '3d_before': '3 Days Before',
      '7d_before': '7 Days Before'
    };
    return map[timing] || timing;
  };

  return (
    <div className="fixed inset-0 z-[125] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0b0d1a]/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-[#121528] border-l border-[#252846] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-inter">
          {/* Header */}
          <div className="p-5 border-b border-[#252846] bg-[#171a30] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl text-white tracking-wide">
                  NOTIFICATION <span className="text-cyan-400">CENTER</span>
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {rules.filter((r) => r.enabled).length} active rules · {unreadCount} unread
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#252846] transition-colors"
              aria-label="Close Notification Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar: Create New + Browser Permission */}
          <div className="p-3.5 border-b border-[#252846] bg-[#0f1224] flex items-center justify-between gap-2">
            <button
              onClick={() => openNotifyModal()}
              className="flex-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff3d71] via-[#8b5cf6] to-[#22d3ee] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Set New Notification</span>
            </button>

            {browserPermission === 'default' && (
              <button
                onClick={requestBrowserPermission}
                className="px-3 py-2 rounded-xl bg-[#171a30] hover:bg-[#252846] border border-cyan-500/40 text-cyan-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                title="Allow browser push alerts"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enable Push</span>
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#252846] bg-[#141830] px-4 gap-2">
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2.5 px-3 text-xs font-mono font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === 'rules'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Active Alerts ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`py-2.5 px-3 text-xs font-mono font-semibold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'inbox'
                  ? 'border-[#ff3d71] text-[#ff3d71]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>Inbox ({alerts.length})</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#ff3d71] text-white text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {activeTab === 'rules' ? (
              rules.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white mb-1">No custom notifications yet</p>
                  <p className="text-xs mb-4">
                    Set custom alerts for any release, news scoop, category, or custom event.
                  </p>
                  <button
                    onClick={() => openNotifyModal()}
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold hover:bg-cyan-500/30 transition-colors"
                  >
                    + Create First Alert
                  </button>
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      rule.enabled
                        ? 'bg-[#171a30] border-[#2b3052]'
                        : 'bg-[#0f1224] border-[#1f233f] opacity-65'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {rule.category || rule.targetType}
                          </span>
                          {rule.fired && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Delivered
                            </span>
                          )}
                        </div>
                        <h4 className="font-bebas text-xl text-white tracking-wide truncate">
                          {rule.targetName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleRuleEnabled(rule.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            rule.enabled
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                              : 'bg-[#0b0d1a] border-[#252846] text-slate-500'
                          }`}
                          title={rule.enabled ? 'Pause notification' : 'Resume notification'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeRule(rule.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-[#252846] transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Clock className="w-3 h-3" />
                        {formatTiming(rule.timing, rule.customDateTime)}
                      </span>
                      {rule.targetDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {rule.targetDate}
                        </span>
                      )}
                    </div>

                    {rule.note && (
                      <p className="text-xs text-slate-300 bg-[#0b0d1a] px-3 py-2 rounded-lg border border-[#252846]">
                        {rule.note}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {rule.triggerOn.map((t) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-[#0b0d1a] border border-[#252846] text-[10px] font-mono text-slate-400"
                          >
                            {t.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => testFireRule(rule.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#0b0d1a] hover:bg-cyan-500/20 border border-[#2b3052] hover:border-cyan-400/50 text-[11px] font-mono text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Send a test alert now"
                      >
                        <Play className="w-3 h-3" />
                        <span>Test</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : alerts.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <BellRing className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white mb-1">Inbox is quiet</p>
                <p className="text-xs">
                  Triggered alerts and test pings will appear here in real time.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => markAlertRead(alert.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    alert.read
                      ? 'bg-[#141830] border-[#252846] opacity-75'
                      : 'bg-[#171a30] border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.12)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                      {alert.category || 'ALERT'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(alert.triggeredAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h5 className="font-bebas text-lg text-white tracking-wide">{alert.title}</h5>
                  <p className="text-xs text-slate-300">{alert.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {activeTab === 'inbox' && alerts.length > 0 && (
            <div className="p-4 border-t border-[#252846] bg-[#171a30] flex items-center justify-between">
              <button
                onClick={clearAlerts}
                className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear Inbox
              </button>
              <button
                onClick={markAllAlertsRead}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-cyan-500/30 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useBugle } from './BugleContext';
import { useDropData } from './DropDataContext';
import { playBellChimeSound } from '../utils/audio';

export type NotificationTargetType = 'drop' | 'news' | 'category' | 'custom';
export type NotificationTiming =
  | 'at_launch'
  | '1h_before'
  | '24h_before'
  | '3d_before'
  | '7d_before'
  | 'custom_time';
export type NotificationTrigger = 'launch' | 'date_shift' | 'news_update';

export interface NotificationRule {
  id: string;
  targetId: string;
  targetName: string;
  targetType: NotificationTargetType;
  category?: string;
  targetDate?: string;
  timing: NotificationTiming;
  customDateTime?: string;
  triggerOn: NotificationTrigger[];
  note?: string;
  playSound: boolean;
  browserPush: boolean;
  enabled: boolean;
  fired: boolean;
  createdAt: string;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  title: string;
  message: string;
  category?: string;
  triggeredAt: string;
  read: boolean;
}

export interface NotifyModalPrefill {
  targetId?: string;
  targetName?: string;
  targetType?: NotificationTargetType;
  category?: string;
  targetDate?: string;
}

interface NotificationContextType {
  rules: NotificationRule[];
  alerts: TriggeredAlert[];
  unreadCount: number;
  browserPermission: NotificationPermission | 'unsupported';
  requestBrowserPermission: () => Promise<NotificationPermission | 'unsupported'>;
  addOrUpdateRule: (
    rule: Omit<NotificationRule, 'id' | 'createdAt' | 'fired'> & { id?: string }
  ) => NotificationRule;
  removeRule: (id: string) => void;
  toggleRuleEnabled: (id: string) => void;
  hasActiveRuleFor: (targetId: string) => boolean;
  getRuleForTarget: (targetId: string) => NotificationRule | undefined;
  testFireRule: (id: string) => void;
  markAllAlertsRead: () => void;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
  isNotifyModalOpen: boolean;
  notifyPrefill: NotifyModalPrefill | null;
  openNotifyModal: (prefill?: NotifyModalPrefill) => void;
  closeNotifyModal: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_RULES_KEY = 'aheadofyou_notification_rules_v1';
const STORAGE_ALERTS_KEY = 'aheadofyou_triggered_alerts_v1';

const computeFireTimestamp = (rule: NotificationRule): number | null => {
  if (rule.timing === 'custom_time') {
    if (!rule.customDateTime) return null;
    const t = new Date(rule.customDateTime).getTime();
    return isNaN(t) ? null : t;
  }

  if (!rule.targetDate) return null;
  const base = new Date(rule.targetDate).getTime();
  if (isNaN(base)) return null;

  const offsets: Record<Exclude<NotificationTiming, 'custom_time'>, number> = {
    at_launch: 0,
    '1h_before': 1 * 60 * 60 * 1000,
    '24h_before': 24 * 60 * 60 * 1000,
    '3d_before': 3 * 24 * 60 * 60 * 1000,
    '7d_before': 7 * 24 * 60 * 60 * 1000
  };

  return base - offsets[rule.timing];
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast, isAudioDeskEnabled } = useBugle();
  const { drops, dateHistory, news } = useDropData();

  const [rules, setRules] = useState<NotificationRule[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_RULES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [alerts, setAlerts] = useState<TriggeredAlert[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ALERTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return window.Notification.permission;
  });

  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyPrefill, setNotifyPrefill] = useState<NotifyModalPrefill | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const seenDateHistIdsRef = useRef<Set<string>>(new Set(dateHistory.map((h) => h.id)));
  const seenNewsIdsRef = useRef<Set<string>>(new Set(news.map((n) => n.id)));

  // Persist rules & alerts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RULES_KEY, JSON.stringify(rules));
    } catch {
      // ignore
    }
  }, [rules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  const requestBrowserPermission = useCallback(async (): Promise<NotificationPermission | 'unsupported'> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      return 'unsupported';
    }
    try {
      const perm = await window.Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        showToast('Browser push notifications enabled for AheadOfYou!');
      } else if (perm === 'denied') {
        showToast('Browser notifications blocked — in-app alerts remain active.');
      }
      return perm;
    } catch {
      return browserPermission;
    }
  }, [browserPermission, showToast]);

  const dispatchNotification = useCallback(
    (rule: NotificationRule, title: string, message: string) => {
      const newAlert: TriggeredAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        ruleId: rule.id,
        title,
        message,
        category: rule.category,
        triggeredAt: new Date().toISOString(),
        read: false
      };

      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
      showToast(`🔔 ${title}: ${message}`);

      if (rule.playSound || isAudioDeskEnabled) {
        playBellChimeSound();
      }

      if (
        rule.browserPush &&
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'granted'
      ) {
        try {
          new window.Notification(`AheadOfYou · ${title}`, {
            body: message,
            tag: rule.id
          });
        } catch {
          // Safe fallback inside sandboxed iframes
        }
      }
    },
    [isAudioDeskEnabled, showToast]
  );

  // Periodic scheduler check for timed rules (every 10 seconds)
  useEffect(() => {
    const checkDueRules = () => {
      const now = Date.now();
      let didFireAny = false;

      setRules((prevRules) =>
        prevRules.map((rule) => {
          if (!rule.enabled || rule.fired) return rule;
          if (!rule.triggerOn.includes('launch') && rule.timing !== 'custom_time') return rule;

          const fireAt = computeFireTimestamp(rule);
          if (fireAt !== null && now >= fireAt) {
            didFireAny = true;
            const timingLabel =
              rule.timing === 'at_launch'
                ? 'Launching now!'
                : rule.timing === 'custom_time'
                ? 'Scheduled reminder triggered!'
                : `Reminder (${rule.timing.replace('_', ' ')}) for ${rule.targetDate || 'upcoming drop'}`;
            const body = rule.note ? `${timingLabel} — ${rule.note}` : timingLabel;
            setTimeout(() => dispatchNotification(rule, rule.targetName, body), 0);
            return { ...rule, fired: true };
          }
          return rule;
        })
      );

      return didFireAny;
    };

    checkDueRules();
    const timer = setInterval(checkDueRules, 10000);
    return () => clearInterval(timer);
  }, [dispatchNotification]);

  // Watch date shifts & new news matching active rules
  useEffect(() => {
    if (dateHistory.length > 0) {
      for (const hist of dateHistory) {
        if (!seenDateHistIdsRef.current.has(hist.id)) {
          seenDateHistIdsRef.current.add(hist.id);
          rules.forEach((rule) => {
            if (!rule.enabled || !rule.triggerOn.includes('date_shift')) return;
            const matches =
              rule.targetId === hist.titleId ||
              rule.targetName.toLowerCase() === hist.titleName.toLowerCase();
            if (matches) {
              dispatchNotification(
                rule,
                `Schedule Shift: ${hist.titleName}`,
                `Moved from ${hist.oldDate} → ${hist.newDate}${hist.reason ? ` (${hist.reason})` : ''}`
              );
            }
          });
        }
      }
    }
  }, [dateHistory, rules, dispatchNotification]);

  useEffect(() => {
    if (news.length > 0) {
      for (const card of news) {
        if (!seenNewsIdsRef.current.has(card.id)) {
          seenNewsIdsRef.current.add(card.id);
          rules.forEach((rule) => {
            if (!rule.enabled || !rule.triggerOn.includes('news_update')) return;
            const nameMatch =
              card.title.toLowerCase().includes(rule.targetName.toLowerCase()) ||
              card.deck.toLowerCase().includes(rule.targetName.toLowerCase());
            const categoryMatch =
              rule.targetType === 'category' &&
              rule.category &&
              card.tag.toLowerCase().includes(rule.category.toLowerCase());
            if (nameMatch || categoryMatch) {
              dispatchNotification(rule, `News Scoop: ${rule.targetName}`, card.title);
            }
          });
        }
      }
    }
  }, [news, rules, dispatchNotification]);

  const addOrUpdateRule = useCallback(
    (input: Omit<NotificationRule, 'id' | 'createdAt' | 'fired'> & { id?: string }): NotificationRule => {
      // Also resolve targetDate from live drops if missing
      let resolvedDate = input.targetDate;
      if (!resolvedDate && input.targetType === 'drop') {
        const matched = drops.find((d) => d.id === input.targetId);
        if (matched) resolvedDate = matched.date;
      }

      const newRule: NotificationRule = {
        id: input.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        targetId: input.targetId,
        targetName: input.targetName.trim(),
        targetType: input.targetType,
        category: input.category,
        targetDate: resolvedDate,
        timing: input.timing,
        customDateTime: input.customDateTime,
        triggerOn: input.triggerOn.length > 0 ? input.triggerOn : ['launch'],
        note: input.note?.trim() || undefined,
        playSound: input.playSound,
        browserPush: input.browserPush,
        enabled: input.enabled,
        fired: false,
        createdAt: new Date().toISOString()
      };

      setRules((prev) => {
        const existingIdx = prev.findIndex(
          (r) => r.id === newRule.id || (r.targetId === newRule.targetId && r.timing === newRule.timing)
        );
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = newRule;
          return updated;
        }
        return [newRule, ...prev];
      });

      if (newRule.playSound) {
        playBellChimeSound();
      }
      showToast(`Notification set for "${newRule.targetName}"!`);
      return newRule;
    },
    [drops, showToast]
  );

  const removeRule = useCallback(
    (id: string) => {
      setRules((prev) => prev.filter((r) => r.id !== id));
      showToast('Notification rule removed.');
    },
    [showToast]
  );

  const toggleRuleEnabled = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled, fired: false } : r))
    );
  }, []);

  const hasActiveRuleFor = useCallback(
    (targetId: string) => rules.some((r) => r.targetId === targetId && r.enabled),
    [rules]
  );

  const getRuleForTarget = useCallback(
    (targetId: string) => rules.find((r) => r.targetId === targetId),
    [rules]
  );

  const testFireRule = useCallback(
    (id: string) => {
      const rule = rules.find((r) => r.id === id);
      if (!rule) return;
      const msg = rule.note
        ? `Test Alert — ${rule.note}`
        : `Active reminder for ${rule.targetName} (${rule.timing.replace('_', ' ')})`;
      dispatchNotification(rule, rule.targetName, msg);
    },
    [rules, dispatchNotification]
  );

  const markAllAlertsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    showToast('Notification inbox cleared.');
  }, [showToast]);

  const openNotifyModal = useCallback((prefill?: NotifyModalPrefill) => {
    setNotifyPrefill(prefill || null);
    setIsNotifyModalOpen(true);
  }, []);

  const closeNotifyModal = useCallback(() => {
    setIsNotifyModalOpen(false);
    setNotifyPrefill(null);
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <NotificationContext.Provider
      value={{
        rules,
        alerts,
        unreadCount,
        browserPermission,
        requestBrowserPermission,
        addOrUpdateRule,
        removeRule,
        toggleRuleEnabled,
        hasActiveRuleFor,
        getRuleForTarget,
        testFireRule,
        markAllAlertsRead,
        markAlertRead,
        clearAlerts,
        isNotifyModalOpen,
        notifyPrefill,
        openNotifyModal,
        closeNotifyModal,
        isDrawerOpen,
        setIsDrawerOpen
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};

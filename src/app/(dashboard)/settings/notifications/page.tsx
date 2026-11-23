"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Bell,
  Smartphone,
  ShieldAlert,
  Clock,
  Moon,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
  Zap,
  Info,
  Radio,
  Sliders,
} from "lucide-react";
import { INotificationPreference } from "@/models/NotificationPreference";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationsSettingsPage() {
  const queryClient = useQueryClient();

  // Push registration states
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [testPushStatus, setTestPushStatus] = useState<string | null>(null);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Preference form state
  const [enabled, setEnabled] = useState(true);
  const [categories, setCategories] = useState({
    protocol: true,
    habits: true,
    quests: true,
    progression: true,
    workouts: true,
    expenses: true,
    dailyReport: true,
  });
  const [reminderTimes, setReminderTimes] = useState({
    morning: "08:00",
    afternoon: "14:00",
    evening: "18:30",
    night: "21:30",
    dailyReport: "22:30",
  });
  const [quietHours, setQuietHours] = useState({
    enabled: true,
    start: "23:00",
    end: "07:00",
  });
  const [maxReminders, setMaxReminders] = useState(6);

  // Check browser push capabilities and existing subscription
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);

      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) {
            setIsSubscribed(true);
            setCurrentEndpoint(sub.endpoint);
          }
        })
        .catch((err) => {
          console.warn("Service worker registration error:", err);
        });
    }
  }, []);

  // Fetch user preferences
  const { data: prefs, isLoading } = useQuery<INotificationPreference>({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/preferences");
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (prefs) {
      setEnabled(prefs.enabled ?? true);
      if (prefs.categories) setCategories({ ...prefs.categories });
      if (prefs.reminderTimes) setReminderTimes({ ...prefs.reminderTimes });
      if (prefs.quietHours) setQuietHours({ ...prefs.quietHours });
      if (prefs.maxRemindersPerDay) setMaxReminders(prefs.maxRemindersPerDay);
    }
  }, [prefs]);

  // Mutation to update preferences
  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<INotificationPreference>) => {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });

  // Enable Push Notification on current device
  const handleEnablePush = async () => {
    if (!isSupported) {
      alert("Web Push notifications are not supported by this browser.");
      return;
    }

    try {
      setIsRegistering(true);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Push notification permission was denied. Please allow notifications in your browser settings.");
        setIsRegistering(false);
        return;
      }

      // Fetch VAPID public key
      const keyRes = await fetch("/api/notifications/push/vapid-key");
      const keyJson = await keyRes.json();
      const vapidPublicKey = keyJson?.data?.publicKey;

      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured on server.");
      }

      const reg = await navigator.serviceWorker.ready;
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      // Send subscription to server
      const subJson = sub.toJSON();
      const deviceLabel = navigator.userAgent.includes("Android")
        ? "Android Device"
        : navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")
        ? "iOS Device (PWA)"
        : "Desktop Browser";

      await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          },
          userAgent: navigator.userAgent,
          deviceLabel,
        }),
      });

      setIsSubscribed(true);
      setCurrentEndpoint(sub.endpoint);
      setTestPushStatus("System Link established! This device is now receiving live alerts.");
      setTimeout(() => setTestPushStatus(null), 4000);
    } catch (err: any) {
      console.error("Error subscribing to push:", err);
      alert(`Failed to activate push notifications: ${err.message}`);
    } finally {
      setIsRegistering(false);
    }
  };

  // Deactivate Push on current device
  const handleDisablePush = async () => {
    try {
      setIsRegistering(true);
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/notifications/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setIsSubscribed(false);
      setCurrentEndpoint(null);
    } catch (err: any) {
      console.error("Error unsubscribing:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Test Push Dispatch
  const handleTestPush = async () => {
    try {
      setIsTestingPush(true);
      setTestPushStatus(null);
      const res = await fetch("/api/notifications/push/test", { method: "POST" });
      const json = await res.json();
      setTestPushStatus(json.message || "Test alert dispatched.");
      setTimeout(() => setTestPushStatus(null), 5000);
    } catch (err: any) {
      setTestPushStatus(`Test failed: ${err.message}`);
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      enabled,
      categories,
      reminderTimes,
      quietHours,
      maxRemindersPerDay: maxReminders,
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-[#64748B] font-mono text-xs gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#8A2BE2]" />
        <span>INITIALIZING SYSTEM TELEMETRY HUD...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Navigation & Header */}
      <div className="space-y-3">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#64748B] hover:text-[#00F0FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Settings</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1F2435]">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-[#8A2BE2]" />
              HUNTER SYSTEM ALERTS & TELEMETRY
            </h1>
            <p className="text-xs text-[#94A3B8] font-mono mt-1">
              Web Push notifications, daily discipline reminders, streak guards, and RPG system accountability
            </p>
          </div>
          <Link
            href="/settings/protocol"
            className="px-3.5 py-1.5 rounded-lg bg-[#131620] border border-[#1F2435] hover:border-[#00F0FF]/40 text-xs font-mono text-[#94A3B8] hover:text-white transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>5 Spheres Protocol</span>
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>System notification preferences saved successfully.</span>
        </div>
      )}

      {testPushStatus && (
        <div className="p-4 rounded-xl bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 text-purple-200 font-mono text-xs flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#8A2BE2] animate-pulse shrink-0" />
          <span>{testPushStatus}</span>
        </div>
      )}

      {/* 1. Device Push Registration Card */}
      <div className="hud-card p-6 sm:p-7 rounded-2xl border border-[#8A2BE2]/40 bg-[#131620]/60 relative overflow-hidden font-mono space-y-5">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8A2BE2] to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#8A2BE2]/15 border border-[#8A2BE2]/40 flex items-center justify-center text-[#8A2BE2] shrink-0 shadow-[0_0_15px_rgba(138,43,226,0.25)]">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wider uppercase">
                  DEVICE PUSH TELEMETRY
                </h2>
                {isSubscribed ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LINK ACTIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-950/60 border border-amber-500/50 text-amber-400">
                    DISCONNECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                Receive lock-screen alerts even when LEVEL UP is closed or your phone is locked
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isSubscribed ? (
              <>
                <button
                  type="button"
                  onClick={handleTestPush}
                  disabled={isTestingPush}
                  className="px-3.5 py-2 rounded-xl bg-[#8A2BE2]/20 border border-[#8A2BE2]/50 text-purple-200 hover:bg-[#8A2BE2]/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTestingPush ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-[#8A2BE2]" />
                  )}
                  <span>TEST ALERT</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisablePush}
                  disabled={isRegistering}
                  className="px-3.5 py-2 rounded-xl bg-[#090A0F] border border-rose-900/50 text-rose-400 hover:border-rose-500 text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>Deactivate Device</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isRegistering}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-[#0088FF] text-white font-bold text-xs shadow-[0_0_20px_rgba(138,43,226,0.35)] hover:shadow-[0_0_25px_rgba(138,43,226,0.5)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRegistering ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>CONNECT THIS DEVICE</span>
              </button>
            )}
          </div>
        </div>

        {/* iOS PWA Instructions Callout */}
        <div className="p-3.5 rounded-xl bg-[#090A0F]/80 border border-[#1F2435] text-[11px] text-[#94A3B8] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-white">Apple iOS (iPhone/iPad) Hunters:</span>
            <p className="leading-relaxed">
              Apple requires web apps to be installed to your Home Screen for lock-screen Web Push. Tap the Safari{" "}
              <span className="text-white font-bold">Share icon (square with arrow)</span> &rarr; select{" "}
              <span className="text-[#00F0FF] font-bold">&ldquo;Add to Home Screen&rdquo;</span> &rarr; open LEVEL UP from your Home Screen &rarr; tap Connect This Device.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-8 font-mono text-xs">
        {/* 2. Master System Alert Switch */}
        <div className="hud-card p-6 rounded-2xl border border-[#1F2435] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              MASTER SYSTEM ALERT BROADCAST
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Global on/off switch for all push notifications and scheduled reminders
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#1F2435] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8A2BE2]" />
          </label>
        </div>

        {/* 3. Accountability Categories */}
        <div className="hud-card p-6 sm:p-7 rounded-2xl border border-[#1F2435] space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#00F0FF]" />
              ACCOUNTABILITY REMINDER CATEGORIES
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              Select which areas the System is authorized to monitor and alert you on
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Protocol */}
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Daily Protocol (5 Spheres)</span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Reminders when mandatory spheres are untouched + emergency penalty alerts
                </p>
              </div>
              <input
                type="checkbox"
                checked={categories.protocol}
                onChange={(e) => setCategories({ ...categories, protocol: e.target.checked })}
                className="w-4 h-4 accent-[#8A2BE2] cursor-pointer"
              />
            </div>

            {/* Habits */}
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Habit Streak Defense</span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Evening alerts when active streaks are approaching midnight deadline
                </p>
              </div>
              <input
                type="checkbox"
                checked={categories.habits}
                onChange={(e) => setCategories({ ...categories, habits: e.target.checked })}
                className="w-4 h-4 accent-[#8A2BE2] cursor-pointer"
              />
            </div>

            {/* Quests */}
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Daily Quests Trials</span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Afternoon alerts for pending quest clearance and unclaimed rewards
                </p>
              </div>
              <input
                type="checkbox"
                checked={categories.quests}
                onChange={(e) => setCategories({ ...categories, quests: e.target.checked })}
                className="w-4 h-4 accent-[#8A2BE2] cursor-pointer"
              />
            </div>

            {/* Progression */}
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Ascension & Trophies</span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Instant announcements upon Level Up, Rank Advancement, and Achievements
                </p>
              </div>
              <input
                type="checkbox"
                checked={categories.progression}
                onChange={(e) => setCategories({ ...categories, progression: e.target.checked })}
                className="w-4 h-4 accent-[#8A2BE2] cursor-pointer"
              />
            </div>

            {/* Workouts */}
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Physical Training Window</span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Evening workout reminder (19:30 - 21:00) if no gym session logged
                </p>
              </div>
              <input
                type="checkbox"
                checked={categories.workouts}
                onChange={(e) => setCategories({ ...categories, workouts: e.target.checked })}
                className="w-4 h-4 accent-[#8A2BE2] cursor-pointer"
              />
            </div>

            {/* Expenses */}
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Financial Audit Protocol</span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  End-of-day spending review prompt (21:00) to balance daily ledger
                </p>
              </div>
              <input
                type="checkbox"
                checked={categories.expenses}
                onChange={(e) => setCategories({ ...categories, expenses: e.target.checked })}
                className="w-4 h-4 accent-[#8A2BE2] cursor-pointer"
              />
            </div>

            {/* Daily Report */}
            <div className="p-4 rounded-xl bg-[#090A0F] border border-[#1F2435] flex items-center justify-between md:col-span-2">
              <div>
                <span className="font-bold text-white">Daily Hunter Recap Report</span>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Late-night debrief with protocol percentage and XP gained before reset
                </p>
              </div>
              <input
                type="checkbox"
                checked={categories.dailyReport}
                onChange={(e) => setCategories({ ...categories, dailyReport: e.target.checked })}
                className="w-4 h-4 accent-[#8A2BE2] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 4. Reminder Times & Quiet Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Schedule Windows */}
          <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00F0FF]" />
              REMINDER CHECK-IN SCHEDULE
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Target wall-clock times in your local timezone for automated check-ins
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Morning Check-in</span>
                <input
                  type="time"
                  value={reminderTimes.morning}
                  onChange={(e) => setReminderTimes({ ...reminderTimes, morning: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Afternoon Status</span>
                <input
                  type="time"
                  value={reminderTimes.afternoon}
                  onChange={(e) => setReminderTimes({ ...reminderTimes, afternoon: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Evening Training</span>
                <input
                  type="time"
                  value={reminderTimes.evening}
                  onChange={(e) => setReminderTimes({ ...reminderTimes, evening: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Night Financial Audit</span>
                <input
                  type="time"
                  value={reminderTimes.night}
                  onChange={(e) => setReminderTimes({ ...reminderTimes, night: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Daily Recap Report</span>
                <input
                  type="time"
                  value={reminderTimes.dailyReport}
                  onChange={(e) => setReminderTimes({ ...reminderTimes, dailyReport: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#00F0FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="hud-card p-6 rounded-2xl border border-[#1F2435] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#8A2BE2]" />
                QUIET HOURS GUARD
              </h3>
              <input
                type="checkbox"
                checked={quietHours.enabled}
                onChange={(e) => setQuietHours({ ...quietHours, enabled: e.target.checked })}
                className="w-4 h-4 accent-[#8A2BE2] cursor-pointer"
              />
            </div>
            <p className="text-xs text-[#94A3B8]">
              Silence all non-emergency alerts during your sleep cycle so you can recover
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Quiet Period Start</span>
                <input
                  type="time"
                  value={quietHours.start}
                  onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#8A2BE2] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Quiet Period End</span>
                <input
                  type="time"
                  value={quietHours.end}
                  onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                  className="px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-white text-xs focus:border-[#8A2BE2] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#1F2435] flex items-center justify-between">
                <div>
                  <span className="text-white font-bold">Daily Alert Ceiling</span>
                  <p className="text-[10px] text-[#64748B]">Maximum reminders per 24h window</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxReminders}
                  onChange={(e) => setMaxReminders(parseInt(e.target.value, 10) || 6)}
                  className="w-16 px-2.5 py-1 rounded bg-[#090A0F] border border-[#1F2435] text-white text-xs text-center focus:border-[#8A2BE2] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#1F2435] flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8A2BE2] to-[#00F0FF] text-white font-bold hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(138,43,226,0.3)]"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>SAVE TELEMETRY CONFIGURATION</span>
          </button>
        </div>
      </form>
    </div>
  );
}


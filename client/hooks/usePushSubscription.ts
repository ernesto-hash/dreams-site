import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Status = "idle" | "loading" | "subscribed" | "denied" | "unsupported" | "error";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function usePushSubscription() {
  const [status, setStatus] = useState<Status>(() => {
    if (typeof window === "undefined") return "idle";
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    return "idle";
  });

  const subscribe = async () => {
    console.log("[Push] subscribe() chamado");

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("[Push] Push nao suportado neste browser");
      setStatus("unsupported");
      return;
    }

    setStatus("loading");

    try {
      // 1. Registar SW
      console.log("[Push] A registar service worker /sw.js ...");
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });

      // 2. Aguardar SW activo — usar este reg (garante active SW)
      console.log("[Push] A aguardar navigator.serviceWorker.ready ...");
      const reg = await navigator.serviceWorker.ready;
      console.log("[Push] SW pronto:", reg.active?.state, reg.scope);

      // 3. Pedir permissao
      console.log("[Push] A pedir permissao de notificacoes...");
      const permission = await Notification.requestPermission();
      console.log("[Push] Permissao:", permission);

      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      // 4. Verificar VAPID key
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
      console.log(
        "[Push] VITE_VAPID_PUBLIC_KEY:",
        vapidKey
          ? `presente (${vapidKey.length} chars)`
          : "UNDEFINED — reinicia o dev server apos adicionar a variavel ao .env"
      );

      if (!vapidKey) {
        console.error("[Push] ERRO: VITE_VAPID_PUBLIC_KEY esta undefined. Reinicia `npm run dev`.");
        setStatus("error");
        return;
      }

      // 5. Converter VAPID key
      let applicationServerKey: Uint8Array;
      try {
        applicationServerKey = urlBase64ToUint8Array(vapidKey);
      } catch (convErr) {
        console.error("[Push] Erro a converter VAPID key:", convErr);
        setStatus("error");
        return;
      }

      // 6. Subscrever push
      console.log("[Push] A chamar reg.pushManager.subscribe() ...");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log("[Push] Subscrito! Endpoint:", sub.endpoint.slice(0, 60) + "...");

      // 7. Guardar no Supabase
      const json = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      console.log("[Push] A guardar em push_subscriptions ...");
      const { error } = await supabase
        .from("push_subscriptions")
        .insert({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth });

      // 23505 = unique_violation: endpoint ja existe, tratar como sucesso
      if (error && error.code !== "23505") {
        console.error("[Push] Erro no Supabase insert:", error.code, error.message);
        throw error;
      }
      if (error?.code === "23505") {
        console.log("[Push] Endpoint ja estava guardado (duplicate ignorado).");
      }

      console.log("[Push] Guardado com sucesso!");
      setStatus("subscribed");
    } catch (e) {
      console.error("[Push] Falha na subscricao:", e);
      setStatus("error");
    }
  };

  return { status, subscribe };
}

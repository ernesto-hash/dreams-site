// GlobalLiveFeed.tsx
import React from "react";

export type LiveEvent = {
  id: string;
  type: string;
  message: string;
  created_at: string;
};

interface GlobalLiveFeedProps {
  events: LiveEvent[]; // <-- IMPORTANTE: precisa ser um array
}

export default function GlobalLiveFeed({ events }: GlobalLiveFeedProps) {
  return (
    <div className="global-live-feed">
      {events.map((e) => (
        <div key={e.id} className="event">
          <span>[{e.type}]</span> {e.message}
        </div>
      ))}
    </div>
  );
}

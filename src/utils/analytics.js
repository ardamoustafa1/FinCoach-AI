import { authFetch } from './api';

const QUEUE_KEY = 'fincoach_analytics_queue';
const SESSION_KEY = 'fincoach_analytics_session';

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(events) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-100)));
}

export async function trackEvent(name, properties = {}) {
  const event = {
    id: crypto.randomUUID(),
    name,
    properties,
    path: window.location.pathname,
    sessionId: getSessionId(),
    at: new Date().toISOString(),
  };

  const queue = [...readQueue(), event];
  writeQueue(queue);

  try {
    const response = await authFetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({ events: queue.slice(-20) }),
    });
    if (response.ok) writeQueue([]);
  } catch {
    writeQueue(queue);
  }
}

export function trackPageView(name) {
  trackEvent('page_view', { name });
}

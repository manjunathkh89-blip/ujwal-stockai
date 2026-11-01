import { StockItem } from '../types/market';

export type MarketPriceListener = (stocks: StockItem[]) => void;

class MarketPriceSubject {
  private listeners: MarketPriceListener[] = [];

  // Register an observer
  public subscribe(listener: MarketPriceListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all observers with new price stream
  public notify(stocks: StockItem[]): void {
    this.listeners.forEach((listener) => {
      try {
        listener(stocks);
      } catch (err) {
        console.error('Error in market price observer listener:', err);
      }
    });
  }
}

export const globalPriceObserver = new MarketPriceSubject();

// Play synthetic Web Audio chime for alerts
export function playAlertChime(isStopLoss = false): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (isStopLoss) {
      // Descending warning tones for stop loss
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Ascending target hit chime
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        gain.gain.setValueAtTime(0.15, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.25);
      });
    }
  } catch (err) {
    // AudioContext might be restricted by browser autoplay policy
    console.debug('Alert sound muted or restricted by browser', err);
  }
}

// Request and dispatch Native Browser Notification
export async function dispatchBrowserNotification(
  title: string,
  body: string,
  tag = 'apex-alert'
): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        tag,
        icon: '/favicon.ico',
      });
      return true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body,
          tag,
          icon: '/favicon.ico',
        });
        return true;
      }
    }
  } catch (err) {
    console.warn('Browser Notification API blocked or restricted in iframe environment', err);
  }

  return false;
}

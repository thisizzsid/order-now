"use client";

class NotificationManager {
  private newOrderAudio: HTMLAudioElement | null = null;
  private orderReadyAudio: HTMLAudioElement | null = null;
  private statusUpdateAudio: HTMLAudioElement | null = null;
  private volume: number = 1.0;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.newOrderAudio = new Audio("/new_order.wav");
      this.orderReadyAudio = new Audio("/order_ready.wav");
      this.statusUpdateAudio = new Audio("/status_update.wav");
      this.loadSettings();
    }
  }

  private loadSettings() {
    const saved = localStorage.getItem("moc_notification_settings");
    if (saved) {
      const { volume, enabled } = JSON.parse(saved);
      this.volume = volume ?? 1.0;
      this.enabled = enabled ?? true;
    }
  }

  public saveSettings(volume: number, enabled: boolean) {
    this.volume = volume;
    this.enabled = enabled;
    localStorage.setItem("moc_notification_settings", JSON.stringify({ volume, enabled }));
  }

  public getSettings() {
    return { volume: this.volume, enabled: this.enabled };
  }

  public playNewOrder() {
    if (!this.enabled || !this.newOrderAudio) return;
    
    this.newOrderAudio.volume = this.volume;
    this.newOrderAudio.currentTime = 0;
    this.newOrderAudio.play().catch(e => console.warn("Autoplay blocked:", e));

    // Play for exactly 5 seconds as requested
    setTimeout(() => {
      if (this.newOrderAudio) {
        this.newOrderAudio.pause();
        this.newOrderAudio.currentTime = 0;
      }
    }, 5000);
  }

  public playOrderReady() {
    if (!this.enabled || !this.orderReadyAudio) return;
    
    this.orderReadyAudio.volume = this.volume;
    this.orderReadyAudio.currentTime = 0;
    this.orderReadyAudio.play().catch(e => console.warn("Autoplay blocked:", e));
  }

  public playStatusUpdate() {
    if (!this.enabled || !this.statusUpdateAudio) return;
    
    this.statusUpdateAudio.volume = this.volume;
    this.statusUpdateAudio.currentTime = 0;
    this.statusUpdateAudio.play().catch(e => console.warn("Autoplay blocked:", e));
  }
}

export const notificationManager = typeof window !== "undefined" ? new NotificationManager() : null;

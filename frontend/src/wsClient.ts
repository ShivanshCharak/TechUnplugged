// utils/SignalingManager.ts
export class SignalingManager {
  private ws: WebSocket;
  private static instance: SignalingManager;
  private bufferedMessage: Array<any> = [];
  private id = 1;
  private initialized = false;
  private onMessageCallback?: (msg: any) => void; // 👈 callback

  private constructor() {
    this.ws = new WebSocket("ws://localhost:8787/ws");
    this.init();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  public setOnMessage(cb: (msg: any) => void) {
    this.onMessageCallback = cb;
  }

  private init() {
    this.ws.onopen = () => {
      this.initialized = true;
      this.bufferedMessage.forEach(msg => this.ws.send(JSON.stringify(msg)));
      this.bufferedMessage = [];
    };

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("WebSocket message", msg);

      // 🔥 Call React-side callback
      if (this.onMessageCallback) {
        this.onMessageCallback(msg);
      }
    };

    this.ws.onclose = () => console.warn("websocket closed");
    this.ws.onerror = (err) => console.error("warning", err);
  }

  public sendMessage(message: any) {
    const messageToSend = { ...message, id: this.id++ };
    if (!this.initialized) {
      this.bufferedMessage.push(messageToSend);
      return;
    }
    this.ws.send(JSON.stringify(messageToSend));
  }
}

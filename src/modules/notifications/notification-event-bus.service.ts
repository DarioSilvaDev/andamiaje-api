import { Injectable } from "@nestjs/common";
import { EventEmitter } from "events";

@Injectable()
export class NotificationEventBus {
  private readonly emitter = new EventEmitter();

  emit<TPayload>(event: string, payload: TPayload): void {
    this.emitter.emit(event, payload);
  }

  on<TPayload>(
    event: string,
    listener: (payload: TPayload) => Promise<void> | void,
  ): void {
    this.emitter.on(event, listener as (...args: unknown[]) => void);
  }

  off<TPayload>(
    event: string,
    listener: (payload: TPayload) => Promise<void> | void,
  ): void {
    this.emitter.off(event, listener as (...args: unknown[]) => void);
  }
}

"use client";
import { useEffect, useRef } from "react";
import { getAccessToken } from "@/services/auth/auth-token.service";
import { IAppointment } from "@/types/appointment.types";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4200/api";

export function useAppointmentStream(
  onNewAppointment: (data: IAppointment) => void,
  enabled = true,
) {
  const onNewAppointmentRef = useRef(onNewAppointment);
  const hasLoggedConnectionErrorRef = useRef(false);

  useEffect(() => {
    onNewAppointmentRef.current = onNewAppointment;
  }, [onNewAppointment]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: number | null = null;
    let reconnectDelay = 3000;
    let isClosed = false;

    const clearReconnectTimeout = () => {
      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    const connect = () => {
      clearReconnectTimeout();

      if (isClosed) {
        return;
      }

      const token = getAccessToken();
      if (!token) {
        return;
      }

      const streamUrl = `${apiBaseUrl}/appointment-events/stream?token=${encodeURIComponent(token)}`;

      eventSource = new EventSource(streamUrl, { withCredentials: true });

      eventSource.onopen = () => {
        reconnectDelay = 3000;
        hasLoggedConnectionErrorRef.current = false;
      };

      eventSource.addEventListener("connected", () => {
        reconnectDelay = 3000;
        hasLoggedConnectionErrorRef.current = false;
      });

      eventSource.addEventListener("new-appointment", (event) => {
        try {
          const data = JSON.parse(event.data) as IAppointment;
          onNewAppointmentRef.current(data);
        } catch {
          console.error("Failed to parse new-appointment event", event.data);
        }
      });

      eventSource.onerror = (event) => {
        const source =
          event?.target && "readyState" in event.target
            ? (event.target as EventSource)
            : null;

        if (!hasLoggedConnectionErrorRef.current) {
          console.error("EventSource connection error", {
            type: event.type,
            url: source?.url ?? streamUrl,
            readyState: source?.readyState ?? null,
          });
          hasLoggedConnectionErrorRef.current = true;
        }

        eventSource?.close();
        eventSource = null;

        if (!isClosed) {
          reconnectTimeout = window.setTimeout(() => {
            connect();
          }, reconnectDelay);
          reconnectDelay = Math.min(reconnectDelay * 2, 15000);
        }
      };
    };

    connect();

    return () => {
      isClosed = true;
      clearReconnectTimeout();
      eventSource?.close();
    };
  }, [enabled]);
}

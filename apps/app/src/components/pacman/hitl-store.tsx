"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface PendingMeeting {
  reasonForScheduling?: string;
  meetingDuration?: number;
  resolve: (result: string) => void;
}

export interface MeetingFormData {
  name: string;
  date: string;
  time: string;
  duration: number;
}

type HITLPhase = "idle" | "form" | "confirm" | "done" | "cancelled";

interface HITLState {
  phase: HITLPhase;
  pending: PendingMeeting | null;
  formData: MeetingFormData | null;
}

interface HITLStore {
  state: HITLState;
  showForm: (pending: PendingMeeting) => void;
  submitForm: (data: MeetingFormData) => void;
  confirm: () => void;
  cancel: () => void;
  reset: () => void;
}

const HITLContext = createContext<HITLStore | null>(null);

export function HITLProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HITLState>({
    phase: "idle",
    pending: null,
    formData: null,
  });

  const showForm = useCallback((pending: PendingMeeting) => {
    setState({ phase: "form", pending, formData: null });
  }, []);

  const submitForm = useCallback((data: MeetingFormData) => {
    setState((prev) => ({ ...prev, phase: "confirm", formData: data }));
  }, []);

  const confirm = useCallback(() => {
    setState((prev) => {
      if (prev.pending && prev.formData) {
        prev.pending.resolve(
          `Meeting confirmed: "${prev.formData.name}" on ${prev.formData.date} at ${prev.formData.time} for ${prev.formData.duration} minutes.`
        );
      }
      return { ...prev, phase: "done" };
    });
  }, []);

  const cancel = useCallback(() => {
    setState((prev) => {
      if (prev.pending) {
        prev.pending.resolve("The user cancelled the meeting scheduling.");
      }
      return { phase: "cancelled", pending: null, formData: null };
    });
  }, []);

  const reset = useCallback(() => {
    setState({ phase: "idle", pending: null, formData: null });
  }, []);

  return (
    <HITLContext.Provider value={{ state, showForm, submitForm, confirm, cancel, reset }}>
      {children}
    </HITLContext.Provider>
  );
}

export function useHITL() {
  const ctx = useContext(HITLContext);
  if (!ctx) throw new Error("useHITL must be used within HITLProvider");
  return ctx;
}

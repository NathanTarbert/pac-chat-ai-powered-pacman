"use client";

import { PacManLayout } from "@/components/pacman/layout";
import { PacManCanvas } from "@/components/pacman/pacman-canvas";
import { PacManChat } from "@/components/pacman/headless-chat";
import { GoogleCalendar } from "@/components/pacman/calendar";
import { CalendarProvider } from "@/components/pacman/calendar/calendar-store";
import { HITLProvider } from "@/components/pacman/hitl-store";
import { QuestProvider } from "@/components/pacman/quest-store";
import { useGenerativeUIExamples, useExampleSuggestions } from "@/hooks";

function HomeContent() {
  useGenerativeUIExamples();
  useExampleSuggestions();

  return (
    <PacManLayout
      chatContent={<PacManChat />}
      appContent={<PacManCanvas />}
      calendarContent={<GoogleCalendar />}
    />
  );
}

export default function HomePage() {
  return (
    <CalendarProvider>
      <HITLProvider>
        <QuestProvider>
          <HomeContent />
        </QuestProvider>
      </HITLProvider>
    </CalendarProvider>
  );
}

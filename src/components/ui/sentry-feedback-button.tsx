"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { Bug, MessageCircle } from "lucide-react";
import { useModalAwareButton } from "@/hooks/useModalAwareButton";
import { createPortal } from "react-dom";

export function SentryFeedbackButton() {
  const [feedback, setFeedback] = useState<any>(null);
  const [widget, setWidget] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useModalAwareButton();

  useEffect(() => {
    setMounted(true);
    // Get the feedback instance on the client side
    setFeedback(Sentry.getFeedback());
  }, []);

  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!feedback) return;

    if (widget) {
      // If widget is open, close it
      widget.removeFromDom();
      setWidget(null);
    } else {
      // Create and show the form immediately
      feedback.createForm().then((newWidget: any) => {
        newWidget.appendToDom();
        newWidget.open();
        setWidget(newWidget);
      }).catch((error: any) => {
        console.error('Failed to create Sentry feedback form:', error);
      });
    }
  };

  if (!feedback || !mounted) return null;

  const button = (
    <Button
      ref={buttonRef}
      variant="destructive"
      size="lg"
      onClick={handleFeedbackClick}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="fixed bottom-4 right-4 z-[99999] shadow-lg"
      style={{
        zIndex: 99999,
        pointerEvents: 'auto',
      }}
      aria-label="Report a bug or give feedback"
    >
      <Bug className="h-4 w-4 mr-2" />
      Report an Issue
    </Button>
  );

  // Render the button in a portal to ensure it's outside modal context
  return createPortal(button, document.body);
} 
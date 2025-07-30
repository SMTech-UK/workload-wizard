"use client";

import { Button } from "@/components/ui/button";
import { ChevronUp, Home } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export function ReturnToTop() {
  const [isVisible, setIsVisible] = useState(true); // Temporarily always visible for testing

  useEffect(() => {
    const toggleVisibility = () => {
      console.log("Scroll position:", window.pageYOffset);
      if (window.pageYOffset > 300) {
        console.log("Setting visible to true");
        setIsVisible(true);
      } else {
        console.log("Setting visible to false");
        setIsVisible(false);
      }
    };

    // Call once on mount to check initial state
    toggleVisibility();
    
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    console.log("Scrolling to top");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  console.log("ReturnToTop component render, isVisible:", isVisible);

  return (
    <>
      {/* Return to Home button - top left */}
      <Link href="/">
        <Button
          size="sm"
          variant="outline"
          className="fixed top-4 left-4 z-50 shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Return to home"
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </Link>

      {/* Return to Top button - bottom left */}
      <Button
        onClick={scrollToTop}
        size="sm"
        className="fixed bottom-4 left-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-500 text-white"
        aria-label="Return to top"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
    </>
  );
} 
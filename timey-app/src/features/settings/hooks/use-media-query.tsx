// hooks/use-media-query.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure window is defined (for SSR compatibility)
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(query);

    // Update state with current match
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (modern and legacy methods)
    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup function
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else {
        // Fallback for older browsers
        media.removeListener(listener);
      }
    };
  }, [query, matches]);

  return matches;
}

// Predefined breakpoint hooks for easier usage
export function useIsSm(): boolean {
  return useMediaQuery("(min-width: 640px)");
}

export function useIsMd(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

export function useIsLg(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

export function useIsXl(): boolean {
  return useMediaQuery("(min-width: 1280px)");
}

export function useIs2Xl(): boolean {
  return useMediaQuery("(min-width: 1536px)");
}

// Device-specific hooks
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

// Orientation hooks
export function useIsPortrait(): boolean {
  return useMediaQuery("(orientation: portrait)");
}

export function useIsLandscape(): boolean {
  return useMediaQuery("(orientation: landscape)");
}

// Accessibility hooks
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery("(prefers-color-scheme: dark)");
}

// High contrast mode hook
export function usePrefersHighContrast(): boolean {
  return useMediaQuery("(prefers-contrast: high)");
}

// Specific device features
export function useSupportsHover(): boolean {
  return useMediaQuery("(hover: hover)");
}

export function useTouchDevice(): boolean {
  return useMediaQuery("(pointer: coarse)");
}

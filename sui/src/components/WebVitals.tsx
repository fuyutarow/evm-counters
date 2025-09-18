"use client";

import { useReportWebVitals } from "next/web-vitals";
import logger from "@/utils/logger";

export function WebVitals() {
  useReportWebVitals((metric) => {
    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      logger.info("Web Vitals:", metric);
    }

    // Send to analytics service in production
    if (process.env.NODE_ENV === "production") {
      // Replace with your analytics service
      // Example: gtag('event', metric.name, { value: metric.value })
      // Or send to your monitoring service
    }
  });

  return null;
}

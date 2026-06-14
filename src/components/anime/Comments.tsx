"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";

export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !ref.current) return;
    // Clear any previous script to avoid duplicates
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "dizvf/animex");
    script.setAttribute("data-repo-id", "R_kgDOSzvbfQ");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOSzvbfc4C-yjt");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-lang", "en");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    ref.current.appendChild(script);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-brand" />
        <h2 className="text-lg font-bold text-white">Comments</h2>
      </div>
      <div ref={ref} />
    </div>
  );
}
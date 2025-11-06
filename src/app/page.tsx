"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import PromptInput from "@/components/prompt-input";
import RoadmapVisualizer from "@/components/roadmap-visualizer";

export default function HomePage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  // Load roadmaps from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("roadmaps") || "[]");
    setRoadmaps(saved);
  }, []);

  // Auto-refresh sidebar when new roadmap is added
  const handleNewRoadmap = (newRoadmap: any) => {
    const updated = [...roadmaps, newRoadmap];
    setRoadmaps(updated);
    localStorage.setItem("roadmaps", JSON.stringify(updated));
  };

  const selectedRoadmap = roadmaps.find((r) => r.title === selectedTitle);

   return (
    <div className="flex min-h-screen">
      <Sidebar
        roadmaps={roadmaps}
        onSelectRoadmap={setSelectedTitle}
        currentTitle={selectedTitle ?? undefined}
        setRoadmaps={setRoadmaps}
      />
      <main className="flex-1 p-6 space-y-6">
        <PromptInput onNewRoadmap={handleNewRoadmap} />

        {/* 👇 Show JSON of selected roadmap */}
        {selectedRoadmap ? (
         <div>
            <h2 className="font-semibold mb-4 text-lg">{selectedRoadmap.title}</h2>
            <RoadmapVisualizer roadmap={selectedRoadmap.data} />
          </div>
        ) : (
          <p className="text-gray-500 italic">Select a roadmap to view its data</p>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PromptInput({ 
  onNewRoadmap, 
  onSelectRoadmap
 }: { 
  onNewRoadmap: (r: any) => void; 
  onSelectRoadmap: (title: string) => void; 
}) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate(e?: React.FormEvent) {

    e?.preventDefault();  // prevents the refresh
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();

      if (data.roadmap) {
        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem("roadmaps") || "[]");
        const newRoadmap = {
          title: data.roadmap.title,
          data: data.roadmap,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem("roadmaps", JSON.stringify([...existing, newRoadmap]));
        onNewRoadmap(newRoadmap);
        onSelectRoadmap(newRoadmap.title);
        setTopic("");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while generating.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleGenerate} className="flex gap-2">
      <Input
        placeholder="Enter a topic (e.g. Learn Figma)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </Button>
    </form>
  );
}

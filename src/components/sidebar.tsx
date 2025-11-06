"use client";

import { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Sidebar({
  roadmaps,
  onSelectRoadmap,
  currentTitle,
  setRoadmaps,
}: {
  roadmaps: any[];
  onSelectRoadmap: (title: string) => void;
  currentTitle?: string;
  setRoadmaps: (r: any[]) => void;
}) {
  const handleDelete = (title: string) => {
    const filtered = roadmaps.filter((r) => r.title !== title);
    setRoadmaps(filtered);
    localStorage.setItem("roadmaps", JSON.stringify(filtered));
  };

  return (
    <aside className="w-sm bg-gray-100 border-r p-4 space-y-3">
      <h2 className="font-semibold mb-2">Your Roadmaps</h2>
      {roadmaps.length === 0 && (
        <p className="text-sm text-gray-500">No roadmaps yet</p>
      )}
      {roadmaps.map((r) => (
        <div
          key={r.title}
          className={`flex items-center justify-between rounded-md px-2 py-1 cursor-pointer ${
            currentTitle === r.title ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={() => onSelectRoadmap(r.title)}
        >
          <span>{r.title}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDelete(r.title)}>
                <Trash2 size={14} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </aside>
  );
}

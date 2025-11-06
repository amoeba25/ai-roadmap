"use client";

import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RoadmapNode = { id: string; label: string; level?: string; children?: RoadmapNode[] };
type RoadmapData = { title: string; nodes: RoadmapNode[] };

const primaryColor = "#6366F1"; // unified color

export default function RoadmapVisualizer({ roadmap }: { roadmap: RoadmapData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedLevel, setSelectedLevel] = useState<string>("basic");

  const applyLayout = useCallback((nodes: Node[], edges: Edge[]) => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 80, ranksep: 100 }); // top to bottom
    g.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((n) => g.setNode(n.id, { width: 180, height: 60 }));
    edges.forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);

    return nodes.map((n) => {
      const pos = g.node(n.id);
      return { ...n, position: { x: pos.x - 90, y: pos.y - 30 } };
    });
  }, []);

  // ✅ Filter nodes based on selected level
  const filterByLevel = useCallback(
    (nodes: RoadmapNode[]) => {
      const levelPriority = ["basic", "intermediate", "expert"];
      const allowedLevels = levelPriority.slice(0, levelPriority.indexOf(selectedLevel) + 1);

      return nodes.filter((n) => allowedLevels.includes(n.level || "basic"));
    },
    [selectedLevel]
  );

  const buildTopLevel = useCallback(() => {
    const filteredNodes = filterByLevel(roadmap.nodes);
    const baseNodes: Node[] = filteredNodes.map((node) => ({
      id: node.id,
      data: { label: node.label },
      position: { x: 0, y: 0 },
      style: {
        backgroundColor: primaryColor,
        color: "#fff",
        border: "2px solid #4338CA",
        borderRadius: 12,
        padding: 10,
      },
    }));

    const laidOutNodes = applyLayout(baseNodes, []);
    setNodes(laidOutNodes);
    setEdges([]);
    setExpandedNodes(new Set());
  }, [roadmap, applyLayout, filterByLevel]);

  useEffect(() => {
    buildTopLevel();
  }, [buildTopLevel, selectedLevel]);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      const isExpanded = expandedNodes.has(node.id);
      const newExpanded = new Set(expandedNodes);

      if (isExpanded) {
        // Collapse: remove children and their edges
        const parent = roadmap.nodes.find((n) => n.id === node.id);
        const childIds = parent?.children?.map((c) => c.id) || [];

        const newNodes = nodes.filter((n) => !childIds.includes(n.id));
        const newEdges = edges.filter((e) => !childIds.includes(e.target));

        const laidOutNodes = applyLayout(newNodes, newEdges);
        setNodes(laidOutNodes);
        setEdges(newEdges);
        newExpanded.delete(node.id);
      } else {
        // Expand: add children that fit current level
        const parent = roadmap.nodes.find((n) => n.id === node.id);
        if (!parent?.children) return;

        const levelFilteredChildren = filterByLevel(parent.children);

        const childNodes: Node[] = levelFilteredChildren.map((child) => ({
          id: child.id,
          data: { label: child.label },
          position: { x: 0, y: 0 },
          style: {
            backgroundColor: primaryColor,
            color: "#fff",
            border: "2px solid #4338CA",
            borderRadius: 10,
            padding: 8,
          },
        }));

        const newEdges: Edge[] = levelFilteredChildren.map((child) => ({
          id: `${parent.id}-${child.id}`,
          source: parent.id,
          target: child.id,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: primaryColor },
        }));

        const newNodeSet = [...nodes, ...childNodes];
        const newEdgeSet = [...edges, ...newEdges];

        const laidOutNodes = applyLayout(newNodeSet, newEdgeSet);
        setNodes(laidOutNodes);
        setEdges(newEdgeSet);
        newExpanded.add(node.id);
      }

      setExpandedNodes(newExpanded);
    },
    [expandedNodes, roadmap, nodes, edges, applyLayout, filterByLevel]
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(roadmap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roadmap.title || "roadmap"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ width: "100%", height: "80vh" }} className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleExport}>Export JSON</Button>
      </div>

      {/* Visualization */}
      <div className="flex-1 border rounded-md">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          nodesDraggable={false}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo } from "react";
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
    Node,
    Edge
} from "react-flow-renderer";
import * as d3 from "d3";
import axios from "../api";
import "./FamilyTree.css";

interface FamilyTreeProps {
    userId: string;
}

interface NodeData {
    name: string;
    relationship: string;
    gender: string;
    id: string;
}

import { useTranslation } from "react-i18next";

// --- PREMIUM NODE COMPONENT ---
const PremiumNode = ({ data }: { data: NodeData }) => {
    const { t } = useTranslation();
    const isMale = data.gender === "male";
    // Dynamic Styles based on gender
    const primaryColor = isMale ? "#3b82f6" : "#ec4899"; // Blue-500 : Pink-500
    const avatarBg = isMale ? "linear-gradient(to right, #60a5fa, #3b82f6)" : "linear-gradient(to right, #f472b6, #ec4899)";

    return (
        <div className="premium-node">
            <Handle type="target" position={Position.Top} className="handle" />

            <div className="node-card" style={{ background: "white", borderColor: primaryColor }}>
                {/* Color Strip at top */}
                <div style={{ height: "8px", width: "100%", background: primaryColor }}></div>

                <div className="node-content">
                    <div className="node-avatar" style={{ background: avatarBg }}>
                        {isMale ? "👨‍💼" : "👩‍💼"}
                    </div>

                    <div className="node-info">
                        <h3 className="node-name" title={data.name}>{data.name}</h3>
                        {/* Relationship Badge */}
                        <div className="node-badge" style={{ backgroundColor: isMale ? "#eff6ff" : "#fdf2f8", color: primaryColor, border: `1px solid ${primaryColor}` }}>
                            {t(data.relationship)}
                        </div>
                    </div>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="handle" />
        </div>
    );
};

const FamilyTree: React.FC<FamilyTreeProps> = ({ userId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Memoize nodeTypes to prevent React Flow warning
    const nodeTypes = useMemo(() => ({ premium: PremiumNode }), []);

    useEffect(() => {
        if (!userId) return;
        const fetchTree = async () => {
            try {
                console.log("Fetching tree for userId:", userId);
                const { data } = await axios.get(`/familyTree/${userId}`);
                console.log("Tree Data Received:", data);

                if (Array.isArray(data) && data.length > 0) {
                    const { nodes: layoutNodes, edges: layoutEdges } = getProLayout(data);
                    console.log("Generated Nodes:", layoutNodes);
                    console.log("Generated Edges:", layoutEdges);
                    setNodes(layoutNodes);
                    setEdges(layoutEdges);
                } else {
                    console.warn("Received empty tree data");
                }
            } catch (err) {
                console.error("Tree data error:", err);
            }
        };
        fetchTree();
    }, [userId]);

    const getProLayout = (flatData: any[]): { nodes: Node[], edges: Edge[] } => {
        if (!flatData || flatData.length === 0) return { nodes: [], edges: [] };

        // 1. Build Hierarchy
        const map = new Map();
        flatData.forEach(item => map.set(item.id, { ...item, children: [] }));
        let root = null;
        map.forEach(node => {
            if (node.parent && map.has(node.parent)) {
                map.get(node.parent).children.push(node);
            } else if (!root) {
                root = node;
            }
        });
        // Fallback root
        if (!root && flatData.length > 0) root = map.get(flatData[0].id);

        // Type casting d3 hierarchy
        const hierarchy = d3.hierarchy(root as any);

        // 2. D3 Layout Configuration
        const nodeWidth = 320;
        const nodeHeight = 280;

        const treeLayout = d3.tree<any>()
            .nodeSize([nodeWidth, nodeHeight])
            .separation((a, b) => {
                return a.parent === b.parent ? 1.1 : 2;
            });

        treeLayout(hierarchy);

        // 3. Transform to React Flow
        const flowNodes: Node[] = [];
        const flowEdges: Edge[] = [];

        hierarchy.descendants().forEach((d: any) => {
            flowNodes.push({
                id: d.data.id,
                type: 'premium',
                data: {
                    name: d.data.name,
                    relationship: d.data.relationship,
                    gender: d.data.gender || "male",
                    id: d.data.id
                },
                position: { x: d.x - 100, y: d.y },
            });

            if (d.parent) {
                flowEdges.push({
                    id: `edge-${d.parent.data.id}-${d.data.id}`,
                    source: d.parent.data.id,
                    target: d.data.id,
                    type: 'smoothstep',
                    style: { stroke: '#94a3b8', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#94a3b8',
                        width: 20,
                        height: 20,
                    },
                });
            }
        });

        return { nodes: flowNodes, edges: flowEdges };
    };

    return (
        <div className="family-tree-wrapper">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
                maxZoom={1.5}
                attributionPosition="bottom-right"
            >
                <Controls showInteractive={false} className="tree-controls" />
                <Background
                    variant={"dots" as any}
                    gap={24}
                    size={1.5}
                    color="#cbd5e1"
                />
            </ReactFlow>
        </div>
    );
};

export default FamilyTree;

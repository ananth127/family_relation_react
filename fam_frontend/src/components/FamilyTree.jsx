import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import axios from "../api";

const FamilyTree = ({ userId }) => {
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    axios.get(`/familyTree/${userId}`).then(({ data }) => {
      setTreeData(convertToHierarchy(data));
    });
  }, [userId]);

  const convertToHierarchy = (data) => {
    const map = new Map(data.map(d => [d.id, { ...d, children: [] }]));
    let roots = [];
    for (let node of map.values()) {
      if (!node.parent) {
        roots.push(node);
      } else if (map.has(node.parent)) {
        map.get(node.parent).children.push(node);
      }
    }
    return roots.length === 1 ? roots[0] : { id: "root", children: roots };
  };

  useEffect(() => {
    if (treeData) drawTree(treeData);
  }, [treeData]);

  const drawTree = (rootData) => {
    d3.select("#tree").selectAll("*").remove();

    const width = Math.max(1200, window.innerWidth * 0.9);
    const height = Math.max(600, window.innerHeight * 0.9);

    const svg = d3.select("#tree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(50,50)`);

    const root = d3.hierarchy(rootData);
    const treeLayout = d3.tree().size([width - 100, height - 100]);
    treeLayout(root);

    const link = svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .style("fill", "none")
      .style("stroke", "#999")
      .style("stroke-width", "2px");

    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 8)
      .style("fill", d => d.depth === 0 ? "#ff9800" : d.children ? "#03A9F4" : "#8BC34A")
      .style("stroke", "#666")
      .style("stroke-width", "2px")
      .style("cursor", "pointer");

    node.append("text")
      .attr("dy", "0.35em")
      .attr("x", d => (d.children ? -15 : 15))
      .attr("text-anchor", d => (d.children ? "end" : "start"))
      .style("font-size", "14px")
      .style("fill", "#444")
      .text(d => `${d.data.name} (${d.data.relationship})`);
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#222" }}>Family Tree</h1>
      <div id="tree" style={{ display: "flex", justifyContent: "center", overflowX: "auto", padding: "20px" }}></div>
    </div>
  );
};

export default FamilyTree;

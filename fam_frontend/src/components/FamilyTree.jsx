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

    const width = Math.max(1200, window.innerWidth * 0.9); // Set maximum width as a percentage of the window
    const height = Math.max(600, window.innerHeight * 0.4); // Set maximum height as a percentage of the window

    const svg = d3.select("#tree")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(50,50)`);

    const root = d3.hierarchy(rootData);
    const treeLayout = d3.tree().size([height -70, width - 500]);
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
      .attr("dy", "0.25em")
      .attr("x", d => {
        const labelWidth = d.data.name.length * 7; // Estimate label width based on text length
        const nodeWidth = 30; // Circle radius * 2
        const maxTextX = width + 100; // SVG's width minus padding
  
        if (d.children) {
          // For parent nodes, place text to the left of the node
          return d.y - nodeWidth - labelWidth > 0 ? -15 : 15;
        } else {
          // For leaf nodes, place text to the right of the node but ensure it doesn't overflow
          return d.y + nodeWidth + labelWidth < maxTextX ? +15 : -15;
        }
      })
      .attr("text-anchor", d => (d.children ? "end" : "start"))
      .style("font-size", "14px")
      .style("fill", "#444")
      .text(d => `${d.data.name} (${d.data.relationship})`);
  
    // Adjust the SVG width dynamically to the tree's actual width
    const treeWidth = root.width + 1000; // Include padding
    const treeHeight = root.height + 1000; // Include padding

    // Adjust SVG size to fit within available space without cutting off
    svg.attr("width", Math.max(treeWidth+100, width+100)) // Ensure the tree is not cut off horizontally
       .attr("height", Math.max(treeHeight, height+100)); // Ensure the tree is not cut off vertically
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#222" }}>Family Tree</h1>
      <div 
        id="tree-container"
        style={{
          justifyContent: "center", 
          overflowX: "auto",  // Enable horizontal scrolling when needed
          padding: "100px",
          width: "100%",
          height: "100%", // Make sure the container takes up the full width
        }}
      >
        <div id="tree"></div>
      </div>
    </div>
  );
};

export default FamilyTree;


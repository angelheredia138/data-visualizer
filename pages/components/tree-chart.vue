<template>
  <div class="chart-container">
    <svg id="d3-christmas-tree-chart"></svg>

    <!-- Error message -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Loading spinner -->
    <div v-if="loading" class="loading-spinner">Loading...</div>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

const artists = ref([]);
const loading = ref(false);
const error = ref(null);

// Get the axios instance from the Nuxt app
const { $axios } = useNuxtApp();

// Ornaments per level (sum should match the number of artists)
const ornamentsPerLevel = [1, 2, 3, 5, 9]; // Total of 20 ornaments

// Fetch top artists
const fetchTopArtists = async () => {
  try {
    loading.value = true;
    error.value = null;

    const token = localStorage.getItem("spotify_access_token");
    if (!token) {
      error.value = "No Spotify access token found in localStorage.";
      loading.value = false;
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const timeRange = "long_term"; // You can adjust the time range as needed
    const response = await $axios.get(`/top-artists/?time_range=${timeRange}`, {
      headers,
    });
    artists.value = response.data.items.slice(0, 20) || []; // Get top 20 artists

    drawChristmasTreeChart(artists.value);
  } catch (err) {
    error.value = "Error fetching data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Function to draw the Christmas tree chart
const drawChristmasTreeChart = (artists) => {
  const svg = d3
    .select("#d3-christmas-tree-chart")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", `0 0 500 600`)
    .classed("svg-content-responsive", true)
    .style("background-color", "transparent");

  svg.selectAll("*").remove(); // Clear previous elements

  const width = 500;
  const height = 600;

  // Define glow filter for lights and ornaments
  const defs = svg.append("defs");
  const glowFilter = defs
    .append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  glowFilter
    .append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", "4") // Increased for shinier effect
    .attr("result", "blur");
  glowFilter
    .append("feMerge")
    .selectAll("feMergeNode")
    .data(["blur", "SourceGraphic"])
    .enter()
    .append("feMergeNode")
    .attr("in", (d) => d);

  // Place ornaments (nodes) on the tree
  const ornamentPositions = calculateOrnamentPositions(
    artists.length,
    width,
    height
  );

  // Draw the filled tree shape
  drawTreeShape(svg, ornamentPositions);

  // Draw the tree lines connecting the ornaments
  drawTreeLines(svg, ornamentPositions);

  // Tooltip div
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("display", "none");

  // Draw trunk
  svg
    .append("rect")
    .attr("x", width / 2 - 15)
    .attr("y", height - 181)
    .attr("width", 40)
    .attr("height", 60)
    .attr("fill", "#8B4513"); // Brown color

  // Draw ornaments (nodes)
  svg
    .selectAll(".ornament")
    .data(artists)
    .enter()
    .append("circle")
    .attr("class", "ornament")
    .attr("cx", (d, i) => ornamentPositions[i].x)
    .attr("cy", (d, i) => ornamentPositions[i].y)
    .attr("r", 15)
    .attr("fill", (d, i) => d3.schemeCategory10[i % 10]) // Use D3 color scheme
    .style("filter", "url(#glow)") // Apply glow effect
    .on("mouseover", function (event, d) {
      // Show tooltip with artist name and image
      tooltip.style("display", "block").html(
        `<div style="display: flex; align-items: center;">
         <img src="${d.images[0]?.url}" 
              alt="${d.name}" 
              style="width: 60px; height: 60px; border-radius: 50%; margin-right: 10px;">
         <strong>${d.name}</strong>
       </div>`
      );
      d3.select(this).style("stroke", "#000").style("stroke-width", "2px");
    })

    .on("mousemove", (event) => {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("display", "none");
      d3.select(this).style("stroke", "none");
    });
};

// Function to calculate ornament positions on the tree
const calculateOrnamentPositions = (count, width, height) => {
  const positions = [];
  const levels = 5; // Number of levels on the tree
  const ornamentsPerLevel = [1, 2, 3, 5, 9]; // Ornaments per level (sum to 20)
  let index = 0;

  const startY = 100; // Starting Y position
  const levelHeight = (height - startY - 50) / levels; // Height per level

  const offset = 20; // Increased vertical offset for more extreme wave effect
  const totalOrnaments = count;

  for (let level = 0; level < levels; level++) {
    const numOrnaments = ornamentsPerLevel[level];
    let y = startY + level * levelHeight;

    // Move bottom two levels up
    if (level === levels - 1 || level === levels - 2) {
      y -= 20; // Adjust this value as needed
    }

    const xSpacing = width / (numOrnaments + 1);
    for (let i = 0; i < numOrnaments && index < count; i++, index++) {
      const x = xSpacing * (i + 1);

      let yOffset = 0;

      // Exclude the second and second-to-last ornaments from the wave effect
      if (index !== 1 && index !== totalOrnaments - 2) {
        // Apply wave effect to alternate up and down more extremely
        yOffset += i % 2 === 0 ? -offset : offset;
      }

      // Move ornaments that aren't on the edges up a bit
      if (i !== 0 && i !== numOrnaments - 1) {
        yOffset -= 10; // Additional upward adjustment
      }

      // Move the fifth ornament up even more
      if (index === 4) {
        yOffset -= 80; // Move the fifth ornament up more
      }
      if (index === 2) {
        yOffset -= 20; // Move the fifth ornament up more
      }
      // Move other inner ornaments after the fifth even higher
      if (index > 4 && i !== 0 && i !== numOrnaments - 1) {
        yOffset -= 30; // Move them up more
      }

      const yAdjusted = y + yOffset;
      positions.push({ x, y: yAdjusted });
    }
  }
  return positions;
};

// Function to draw the filled tree shape
const drawTreeShape = (svg, positions) => {
  const levels = 5; // Number of levels
  const ornamentsPerLevel = [1, 2, 3, 5, 9]; // Same as in calculateOrnamentPositions

  const leftPoints = [];
  const rightPoints = [];

  let index = 0;

  for (let level = 0; level < levels; level++) {
    const numOrnaments = ornamentsPerLevel[level];
    const levelStartIndex = index;

    // Leftmost ornament
    const leftIndex = levelStartIndex;
    leftPoints.push([positions[leftIndex].x, positions[leftIndex].y]);

    // Rightmost ornament
    const rightIndex = levelStartIndex + numOrnaments - 1;
    rightPoints.push([positions[rightIndex].x, positions[rightIndex].y]);

    index += numOrnaments;
  }

  // Reverse the right points to create a continuous path
  rightPoints.reverse();

  // Combine left and right points
  const treePoints = leftPoints.concat(rightPoints);

  // Close the path by connecting back to the first point
  treePoints.push(treePoints[0]);

  // Define gradient in defs
  const defs = svg.append("defs");
  const gradient = defs
    .append("linearGradient")
    .attr("id", "treeGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  gradient.append("stop").attr("offset", "0%").attr("stop-color", "#228B22"); // Lighter green
  gradient.append("stop").attr("offset", "100%").attr("stop-color", "#006400"); // Darker green

  // Draw the filled polygon with gradient
  svg
    .append("polygon")
    .attr("points", treePoints.map((d) => d.join(",")).join(" "))
    .attr("fill", "url(#treeGradient)")
    .attr("opacity", 1);
};

// Function to draw the tree lines connecting the ornaments
const drawTreeLines = (svg, positions) => {
  const levels = 5; // Number of levels
  const ornamentsPerLevel = [1, 2, 3, 5, 9]; // Same as in calculateOrnamentPositions

  const lineColors = ["#FFFFFF"];

  let index = 0;
  let prevLevelStartIndex = 0;

  for (let level = 0; level < levels; level++) {
    const numOrnaments = ornamentsPerLevel[level];
    const levelStartIndex = index;

    if (level > 0) {
      const numOrnamentsAbove = ornamentsPerLevel[level - 1];

      // Connect the leftmost ornament to the leftmost ornament above
      const leftChildIndex = levelStartIndex;
      const leftParentIndex = prevLevelStartIndex;
      drawLightStrand(
        svg,
        positions[leftChildIndex],
        positions[leftParentIndex],
        lineColors
      );

      // Connect the rightmost ornament to the rightmost ornament above
      const rightChildIndex = levelStartIndex + numOrnaments - 1;
      const rightParentIndex = prevLevelStartIndex + numOrnamentsAbove - 1;
      drawLightStrand(
        svg,
        positions[rightChildIndex],
        positions[rightParentIndex],
        lineColors
      );

      // Connect inner ornaments within the same level in a V shape
      for (let i = 1; i < numOrnaments - 1; i++) {
        const currentIndex = levelStartIndex + i;

        // Connect to the left adjacent ornament
        drawLightStrand(
          svg,
          positions[currentIndex],
          positions[currentIndex - 1],
          lineColors
        );

        // Connect to the right adjacent ornament
        drawLightStrand(
          svg,
          positions[currentIndex],
          positions[currentIndex + 1],
          lineColors
        );
      }
    }

    index += numOrnaments;
    prevLevelStartIndex = levelStartIndex;
  }
};

// Function to draw a light strand between two points
const drawLightStrand = (svg, start, end, lineColors) => {
  // Calculate the number of lights based on the distance
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const numLights = Math.max(Math.floor(distance / 20), 1);

  // Calculate the positions of the lights along the line
  const lightsData = [];
  for (let i = 0; i <= numLights; i++) {
    const t = i / numLights;
    const x = start.x + t * (end.x - start.x);
    const y = start.y + t * (end.y - start.y);
    lightsData.push({
      x,
      y,
      color: lineColors[Math.floor(Math.random() * lineColors.length)],
    });
  }

  // Draw the lights (bulbs) along the line
  svg
    .selectAll(null)
    .data(lightsData)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", 5)
    .attr("fill", (d) => d.color)
    .style("filter", "url(#glow)");
};

// Fetch data and draw chart on component mount
onMounted(() => {
  fetchTopArtists();
});
</script>

<style scoped>
.chart-container {
  flex: 1;
  padding: 10px;
  width: 100%;
  height: 100%;
}

#d3-christmas-tree-chart {
  display: block;
  margin: auto;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}

.loading-spinner {
  color: green;
  font-weight: bold;
  margin-top: 10px;
}

.tooltip {
  pointer-events: none;
}

/* Additional styles for shinier ornaments */
.ornament {
  stroke: gold;
  stroke-width: 1px;
}
</style>

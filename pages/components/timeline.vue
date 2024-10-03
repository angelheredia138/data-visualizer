<template>
  <div class="chart-container-transparent">
    <div class="last-played">Last played:</div>
    <div class="last-played">
      {{ lastPlayedTrack || "No track played yet" }}
    </div>
    <svg id="d3-clock-timeline-chart"></svg>

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

const tracks = ref([]);
const loading = ref(false);
const error = ref(null);
const lastPlayedTrack = ref(null);
const colorMap = new Map(); // Store color for each track to persist between updates
const svgRef = ref(null);
let clockUpdateInterval;

// Get the axios instance from the Nuxt app
const { $axios } = useNuxtApp();

// Fetch recently played tracks
const fetchRecentlyPlayed = async () => {
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
    const response = await $axios.get("/recently-played/", { headers });
    tracks.value = response.data.items || [];

    // Set last played track with track name and artist names
    if (tracks.value.length > 0) {
      const track = tracks.value[0].track;
      const artistNames = track.artists.map((artist) => artist.name).join(", ");
      lastPlayedTrack.value = `${track.name} by ${artistNames} at ${new Date(
        tracks.value[0].played_at
      ).toLocaleTimeString()}`;
    } else {
      lastPlayedTrack.value = "No track played";
    }

    drawClockTimelineChart(tracks.value);
  } catch (err) {
    error.value = "Error fetching data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Helper to get a random non-gray color from D3's color scheme
const getRandomColor = () => {
  const colors = d3.schemeCategory10.filter((color) => color !== "gray");
  return colors[Math.floor(Math.random() * colors.length)];
};

// Draw the clock and nodes
const drawClockTimelineChart = (tracks) => {
  const svg = d3
    .select("#d3-clock-timeline-chart")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 400 500`)
    .classed("svg-content-responsive", true)
    .style("background-color", "transparent");

  svg.selectAll("*").remove(); // Clear previous elements

  const width = 400;
  const height = 500;
  const radius = Math.min(width, height) / 2 - 20;

  const clockGroup = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Draw the clock face
  clockGroup
    .append("circle")
    .attr("r", radius)
    .attr("fill", "#f0f0f0")
    .attr("stroke", "#000")
    .attr("stroke-width", 2);

  // Add hour numbers (time marks)
  const hourScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([0, 2 * Math.PI]);

  const hours = d3.range(0, 24);
  clockGroup
    .selectAll(".hour-label")
    .data(hours)
    .enter()
    .append("text")
    .attr("class", "hour-label")
    .attr("x", (d) => Math.cos(hourScale(d) - Math.PI / 2) * (radius - 30))
    .attr("y", (d) => Math.sin(hourScale(d) - Math.PI / 2) * (radius - 30))
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("font-size", "13px")
    .style("font-family", "'Inter', sans-serif")
    .style("font-weight", "bold")
    .text((d) => {
      const hour = d % 12 || 12;
      const period = d < 12 || d === 24 ? "AM" : "PM";
      return `${hour}${period}`;
    });

  // Add nodes dynamically with the original spacing logic
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0)); // Start of today

  const nodes = clockGroup.selectAll(".node").data(tracks, (d) => d.track.id);

  // Update nodes (delete old nodes, and add new ones)
  nodes.exit().remove();

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

  nodes
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 5)
    .attr("cx", (track) => {
      const date = new Date(track.played_at);
      const hours = date.getHours() + date.getMinutes() / 60;
      const angle = (hours / 24) * 2 * Math.PI;
      return Math.cos(angle - Math.PI / 2) * (radius - 10);
    })
    .attr("cy", (track) => {
      const date = new Date(track.played_at);
      const hours = date.getHours() + date.getMinutes() / 60;
      const angle = (hours / 24) * 2 * Math.PI;
      return Math.sin(angle - Math.PI / 2) * (radius - 10);
    })
    .style("fill", (track) => {
      const trackDate = new Date(track.played_at);
      if (trackDate < todayStart) {
        return "gray"; // Old nodes are always gray
      } else {
        // Preserve color for new nodes
        if (!colorMap.has(track.track.id)) {
          colorMap.set(track.track.id, getRandomColor());
        }
        return colorMap.get(track.track.id); // Assign color from the map
      }
    })
    .style("opacity", 0.8)
    .attr("data-time", (track) => new Date(track.played_at).getTime())
    .on("mouseover", function (event, track) {
      d3.select(this).transition().attr("r", 6);
      const date = new Date(track.played_at);
      const formattedTime = formatTime(date);

      const maxLength = 30;
      const trackName =
        track.track.name.length > maxLength
          ? `${track.track.name.substring(0, maxLength)}...`
          : track.track.name;

      const artistNames = track.track.artists
        .map((artist) => artist.name)
        .join(", ");
      const truncatedArtists =
        artistNames.length > maxLength
          ? `${artistNames.substring(0, maxLength)}...`
          : artistNames;

      const isYesterday = new Date(track.played_at) < todayStart;

      tooltip
        .style("display", "block")
        .html(
          `<strong>${trackName}</strong><br/>Played at: ${formattedTime}<br/>Artist: ${truncatedArtists}<br/>${
            isYesterday ? "Yesterday" : "Today"
          }`
        );
      d3.select(this).style("stroke", "#000").style("stroke-width", "2px");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).transition().attr("r", 4);
      tooltip.style("display", "none");
      d3.select(this).style("stroke", "none");
    });

  // Draw clock hand
  drawClockHand(clockGroup, radius);
};

// Draw clock hand with arrow
const drawClockHand = (clockGroup, radius) => {
  const now = new Date();
  const currentHours = now.getHours() + now.getMinutes() / 60;
  const hourAngle = (currentHours / 24) * 2 * Math.PI;

  const handLength = radius - 60;
  const arrowLength = 15;
  const arrowWidth = 3;

  clockGroup
    .append("line")
    .attr("class", "clock-hand")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", Math.cos(hourAngle - Math.PI / 2) * handLength)
    .attr("y2", Math.sin(hourAngle - Math.PI / 2) * handLength)
    .attr("stroke", "red")
    .attr("stroke-width", 4);

  // Draw arrow tip for the clock hand
  clockGroup
    .append("polygon")
    .attr(
      "points",
      `
        ${Math.cos(hourAngle - Math.PI / 2) * (handLength + arrowLength)},${
        Math.sin(hourAngle - Math.PI / 2) * (handLength + arrowLength)
      }
        ${Math.cos(hourAngle - Math.PI / 2 + Math.PI / 24) * handLength},${
        Math.sin(hourAngle - Math.PI / 2 + Math.PI / 24) * handLength
      }
        ${Math.cos(hourAngle - Math.PI / 2 - Math.PI / 24) * handLength},${
        Math.sin(hourAngle - Math.PI / 2 - Math.PI / 24) * handLength
      }
      `
    )
    .attr("fill", "red");
};

// Updates chart and clock hand every minute
const updateChart = () => {
  fetchRecentlyPlayed(); // Fetch new data every minute
  drawClockTimelineChart(tracks.value); // Redraw the chart every minute
};

// Fetch data and draw chart on component mount
onMounted(() => {
  fetchRecentlyPlayed();
  clockUpdateInterval = setInterval(updateChart, 60000); // Update every minute
});

onUnmounted(() => {
  clearInterval(clockUpdateInterval); // Clear interval when the component is unmounted
});

// Helper to format the time
const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};
</script>

<style scoped>
#d3-clock-timeline-chart {
  display: block;
  margin: auto;
}

.chart-container-transparent {
  flex: 1;
  padding: 10px;
  width: 100%;
  height: 100%;
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

.last-played {
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.tooltip {
  pointer-events: none;
}
</style>

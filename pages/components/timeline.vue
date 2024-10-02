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

// Local state for tracks data, loading, and error
const tracks = ref([]);
const loading = ref(false);
const error = ref(null);
const isHovering = ref(false);
const hoverTimeout = ref(null);
const clickTimeout = ref(null);
const lastPlayedTrack = ref(null);

// Get the axios instance from the Nuxt app
const { $axios } = useNuxtApp();

// Function to fetch recently played tracks from the API
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
      lastPlayedTrack.value = `${track.name} by ${artistNames}`;
    } else {
      lastPlayedTrack.value = "No track played";
    }

    drawClockTimelineChart(tracks.value);
    setInterval(updateClock, 1000); // Update clock hand and nodes every second
    setInterval(fetchRecentlyPlayed, 60000); // Fetch new data every minute
  } catch (err) {
    error.value = "Error fetching data.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Draws the clock with data points and clock hand
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

  // Draw clock face
  clockGroup
    .append("circle")
    .attr("r", radius)
    .attr("fill", "#f0f0f0")
    .attr("stroke", "#000")
    .attr("stroke-width", 2);

  // Add hour numbers with AM/PM labels
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

  // Tooltip
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

  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0)); // Start of today

  // Bind data and apply enter, update, exit logic for nodes
  const nodes = clockGroup.selectAll(".node").data(tracks, (d) => d.track.id); // Use unique track ID as key

  // Remove old nodes
  nodes.exit().remove();
  let isHovering = false;
  let selectedNode = null;

  // Add new nodes
  nodes
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 4)
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
      const isYesterday = trackDate < todayStart;

      // Nodes from yesterday are gray, today's nodes are colorful
      return isYesterday
        ? "gray"
        : d3.schemeCategory10[tracks.indexOf(track) % 10]; // Colorful if today
    })
    .style("opacity", 0.7)
    .attr("data-time", (track) => new Date(track.played_at).getTime())
    .merge(nodes) // Merge new and existing nodes
    .on("mouseover", function (event, track) {
      isHovering = true;
      d3.select(this).transition().attr("r", 6);
      const date = new Date(track.played_at);
      const formattedTime = formatTime(date);

      // Limit the length of the song title and artist list for the tooltip
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

      // Correct check for whether it's yesterday or today
      const isYesterday = new Date(track.played_at) < todayStart;

      tooltip
        .style("display", "block")
        .html(
          `<strong>${trackName}</strong><br/>Played at: ${formattedTime}<br/>Artist: ${truncatedArtists}<br/>${
            isYesterday ? "Yesterday" : "Today"
          }`
        );
      d3.select(this).style("stroke", "#000").style("stroke-width", "2px");
      setTimeout(() => {
        tooltip.style("display", "none"); // Hide after 500ms
      }, 3000);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      isHovering = false;
      d3.select(this).transition().attr("r", 4);
      tooltip.style("display", "none");
      d3.select(this).style("stroke", "none");
    })
    .on("click", function (event, track) {
      // On hover-capable devices, block click if the user is hovering
      if (isHovering && window.matchMedia("(hover: hover)").matches) {
        return;
      }

      const node = d3.select(this);
      const isHighlighted = node.classed("highlighted");

      // Deselect the previously selected node if it’s not the current one
      if (selectedNode && selectedNode !== node) {
        selectedNode.classed("highlighted", false).style("fill", "steelblue");
        tooltip.style("display", "none");
      }

      // Toggle the selection of the clicked node
      if (isHighlighted) {
        // If the node is already highlighted, unselect it
        node.classed("highlighted", false).style("fill", "steelblue");
        tooltip.style("display", "none");
        selectedNode = null;
      } else {
        // If the node is not highlighted, select it
        node.classed("highlighted", true).style("fill", "darkblue");

        // Show tooltip when clicked (even on touch devices)
        const date = new Date(track.played_at);
        const formattedTime = formatTime(date);

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

        tooltip
          .style("display", "block")
          .html(
            `<strong>${trackName}</strong><br/>Played at: ${formattedTime}<br/>Artist: ${truncatedArtists}<br/>${
              date < todayStart ? "Yesterday" : "Today"
            }`
          )
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");

        selectedNode = node;
      }
    });

  // Draw clock hand with arrow
  drawClockHand(clockGroup, radius);
};

// Function to draw the clock hand with an arrow tip
const drawClockHand = (clockGroup, radius) => {
  const now = new Date();
  const currentHours = now.getHours() + now.getMinutes() / 60;
  const hourAngle = (currentHours / 24) * 2 * Math.PI;

  const handLength = radius - 60;
  const arrowLength = 15;
  const arrowWidth = 3;

  // Draw the clock hand
  clockGroup
    .append("line")
    .attr("class", "clock-hand")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", Math.cos(hourAngle - Math.PI / 2) * handLength)
    .attr("y2", Math.sin(hourAngle - Math.PI / 2) * handLength)
    .attr("stroke", "red")
    .attr("stroke-width", 4);

  // Draw the arrow tip
  clockGroup
    .append("polygon")
    .attr(
      "points",
      `
          ${Math.cos(hourAngle - Math.PI / 2) * (handLength + arrowLength)},${
        Math.sin(hourAngle - Math.PI / 2) * (handLength + arrowLength)
      }
          ${
            Math.cos(hourAngle - Math.PI / 2 + Math.PI / 24) *
            (handLength - arrowWidth)
          },${
        Math.sin(hourAngle - Math.PI / 2 + Math.PI / 24) *
        (handLength - arrowWidth)
      }
          ${
            Math.cos(hourAngle - Math.PI / 2 - Math.PI / 24) *
            (handLength - arrowWidth)
          },${
        Math.sin(hourAngle - Math.PI / 2 - Math.PI / 24) *
        (handLength - arrowWidth)
      }
        `
    )
    .attr("fill", "red");
};

// Updates the clock hand and dynamically adjusts nodes
const updateClock = () => {
  const svg = d3.select("#d3-clock-timeline-chart");
  const clockGroup = svg.select("g");

  // Remove old clock hand
  clockGroup.selectAll(".clock-hand").remove();
  clockGroup.selectAll("polygon").remove(); // Remove the arrow tip

  // Redraw clock hand
  drawClockHand(clockGroup, Math.min(400, 500) / 2 - 20);

  const now = new Date();

  // Hide any visible tooltips when the clock updates
  d3.select(".tooltip").style("display", "none");

  // Update nodes based on their age
  clockGroup.selectAll(".node").each(function () {
    const node = d3.select(this);
    const trackDate = new Date(parseInt(node.attr("data-time")));

    const timeDifference = now - trackDate;
    const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);

    // If the node is older than 24 hours, remove it
    if (timeDifferenceInHours >= 24) {
      node.remove();
    }
  });

  // Fetch and add new tracks dynamically
  const newTracks = tracks.value.filter((track) => {
    const trackDate = new Date(track.played_at);
    return trackDate >= now.setHours(0, 0, 0, 0); // Only today's tracks
  });

  drawClockTimelineChart(newTracks); // Only re-draw new tracks from today
};

// Function to format the time in AM/PM
const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// Fetch data and draw chart on component mount
onMounted(() => {
  fetchRecentlyPlayed();
});
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
</style>

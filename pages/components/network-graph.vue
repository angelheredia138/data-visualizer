<template>
  <div class="chart-container-transparent" style="flex: 1; padding: 10px">
    <!-- Error Message -->
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- Loading Spinner -->
    <div v-if="!isLoaded" class="loading-spinner">
      <v-progress-circular
        :size="40"
        :width="4"
        indeterminate
        color="white"
        class="loading-spinner"
      ></v-progress-circular>
    </div>

    <!-- Network Graph SVG -->
    <svg
      v-show="isLoaded"
      id="d3-network-graph"
      :style="{ width: '100%', height: '100%' }"
    ></svg>

    <!-- Connections Overview -->
    <div v-if="isLoaded && connections.length > 0">
      <h4 class="heading">Connections Overview</h4>
      <div
        v-for="(connection, index) in connections"
        :key="index"
        class="connection-text"
      >
        <p>
          <strong :style="{ color: getColor(connection.source.id) }">
            {{ connection.source.name }}
          </strong>
          and
          <strong :style="{ color: getColor(connection.target.id) }">
            {{ connection.target.name }}
          </strong>
          share the following artists: {{ connection.sharedArtists.join(", ") }}
        </p>
      </div>
      <p class="info-text">
        Hover over the data points and connections on the chart to view
        additional details.
      </p>
      <p class="info-text">
        Note: This graph displays your public playlists only. If you have a
        limited number of playlists, the graph may not contain many nodes.
      </p>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  props: {
    isMobile: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const connections = ref([]);
    const error = ref(null);
    const isLoaded = ref(false); // Spinner state

    // D3 color scale for node colors
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Function to get color for a node
    const getColor = (id) => colorScale(id);

    // Fetch playlists data
    const fetchPlaylists = async () => {
      try {
        const token = localStorage.getItem("spotify_access_token");
        if (!token) {
          throw new Error("No Spotify token provided");
        }

        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get("/api/get_playlists", { headers });

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        const playlists = response.data.playlists || [];
        drawNetworkGraph(playlists);
        isLoaded.value = true; // Mark as loaded after the graph is drawn
      } catch (err) {
        console.error("Error fetching playlists:", err);
        error.value = "Failed to load playlists data.";
      }
    };

    // Draw network graph
    const drawNetworkGraph = (playlists) => {
      const svg = d3
        .select("#d3-network-graph")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr(
          "viewBox",
          `0 0 ${props.isMobile ? 400 : 800} ${props.isMobile ? 300 : 600}`
        )
        .classed("svg-content-responsive", true)
        .style("background-color", "transparent");

      const width = props.isMobile ? 400 : 800;
      const height = props.isMobile ? 300 : 600;

      const nodes = playlists.map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
      }));

      const links = [];
      const artistMap = {};

      playlists.forEach((playlist) => {
        playlist.artists.forEach((artist) => {
          if (!artistMap[artist]) {
            artistMap[artist] = [];
          }
          artistMap[artist].push(playlist.id);
        });
      });

      Object.values(artistMap).forEach((playlistIds) => {
        for (let i = 0; i < playlistIds.length; i++) {
          for (let j = i + 1; j < playlistIds.length; j++) {
            const source = playlistIds[i];
            const target = playlistIds[j];
            const existingLink = links.find(
              (link) =>
                (link.source === source && link.target === target) ||
                (link.source === target && link.target === source)
            );
            if (existingLink) {
              existingLink.strength += 1;
              existingLink.sharedArtists.push(
                ...Object.keys(artistMap).filter(
                  (artist) =>
                    artistMap[artist].includes(source) &&
                    artistMap[artist].includes(target)
                )
              );
            } else {
              links.push({
                source,
                target,
                strength: 1,
                sharedArtists: Object.keys(artistMap).filter(
                  (artist) =>
                    artistMap[artist].includes(source) &&
                    artistMap[artist].includes(target)
                ),
              });
            }
          }
        }
      });

      links.forEach((link) => {
        link.sharedArtists = [...new Set(link.sharedArtists)];
      });

      connections.value = links;

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance((d) => 150 / d.strength)
        )
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(20));

      const link = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke-width", (d) => Math.sqrt(d.strength) * 2);

      const node = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", (d) => colorScale(d.id))
        .call(
          d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

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

      node
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block").html(`<strong>${d.name}</strong>`);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });

      link
        .on("mouseover", (event, d) => {
          const sharedArtists = d.sharedArtists.join(", ");
          tooltip
            .style("display", "block")
            .html(
              `<strong>Playlists:</strong> ${d.source.name} & ${d.target.name}<br/><strong>Shared Artists:</strong> ${sharedArtists}`
            );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      });

      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    };

    onMounted(() => {
      fetchPlaylists();
    });

    return {
      connections,
      error,
      getColor,
      isLoaded,
    };
  },
};
</script>

<style scoped>
.chart-container-transparent {
  flex: 1;
  padding: 10px;
}

.connection-text {
  font-size: 14px;
  margin-bottom: 10px;
}

.info-text {
  margin-top: 16px;
  font-size: 12px;
  color: gray;
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
  text-align: center;
}
</style>

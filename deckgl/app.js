import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { IconLayer } from "@deck.gl/layers";
import FPSStats from "react-fps-stats";

// Initial viewport settings
const INITIAL_VIEW_STATE = {
  longitude: 4.37,
  latitude: 50.8562,
  zoom: 12,
  pitch: 45,
  bearing: 0,
};

// Map style URL
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

// Data source URL
const DATA_URL = "http://localhost:8003/output.json";

// Icon mapping for markers
const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

// Main App component
const App = () => {
  const [data, setData] = useState([]);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  // Fetch data on component mount
  useEffect(() => {
    fetch(DATA_URL)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setData(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Create icon layer
  const layers = [
    new IconLayer({
      id: "icon-layer",
      data,
      pickable: true,
      iconAtlas: "https://deck.gl/images/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: () => "marker",
      sizeScale: 15,
      getPosition: d => [d.gps_lon, d.gps_lat],
      getSize: () => 5,
      getColor: d => [Math.sqrt(d.gps_speed) * 255, 140, 0],
    })
  ];

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
      >
        <StaticMap
          mapStyle={MAP_STYLE}
          viewState={viewState}
        />
      </DeckGL>
      <FPSStats />
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '10px',
        background: 'white',
        borderRadius: '4px'
      }}>
        <div>Points: {data.length}</div>
      </div>
    </>
  );
};

// Create root element
const rootElement = document.createElement('div');
rootElement.id = 'root';
document.body.appendChild(rootElement);

// Render the app
render(<App />, document.getElementById('root'));
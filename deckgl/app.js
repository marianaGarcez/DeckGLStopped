import React, { useState, useEffect, useCallback } from "react";
import { render } from "react-dom";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import FPSStats from "react-fps-stats";

const INITIAL_VIEW_STATE = {
  longitude: 4.37,
  latitude: 50.8562,
  zoom: 10,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const DATA_URL = "http://localhost:8003/outputConsumer.json";
const UPDATE_INTERVAL = 1000;

const App = () => {
  const [data, setData] = useState([]);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [currentTime, setCurrentTime] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(DATA_URL);
      const newData = await response.json();
      
      const validData = newData.map(d => ({
        ...d,
        coordinates: [Number(d.gps_lon), Number(d.gps_lat)]
      })).filter(d => 
        !isNaN(d.coordinates[0]) && 
        !isNaN(d.coordinates[1])
      );

      const latestTime = Math.max(...validData.map(d => d.time_utc));
      
      setData(validData);
      setCurrentTime(latestTime);
      
      document.getElementById('tNumber').textContent = validData.length;
      document.getElementById('stopped').textContent = 
        validData.filter(d => d.gps_speed < 1).length;
      document.getElementById('timeDiv').textContent = latestTime;
      
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const layers = [
    new ScatterplotLayer({
      id: 'train-layer',
      data,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 3,
      radiusMaxPixels: 30,
      lineWidthMinPixels: 1,
      getPosition: d => d.coordinates,
      getRadius: d => 5,
      getFillColor: d => [
        0, // Blue component
        0,
        255, // Full blue
        d.gps_speed < 1 ? 128 : 255 // Alpha based on speed
      ],
      getLineColor: d => [255, 255, 255], // White border
      updateTriggers: {
        getFillColor: [data],
        getPosition: [data]
      }
    })
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <StaticMap mapStyle={MAP_STYLE} />
      <FPSStats />
    </DeckGL>
  );
};

render(<App />, document.getElementById('root'));
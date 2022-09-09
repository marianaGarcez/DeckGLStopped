import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import { StaticMap } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { PathLayer } from "@deck.gl/layers";
import { IconLayer } from "@deck.gl/layers";
import FPSStats from "react-fps-stats";

var IconPositions = [];
var coord = [];
var resp1 = [];
var resp2 = [];
//how to delete old trajectories

const INITIAL_VIEW_STATE = {
  longitude: 4.37,
  latitude: 50.8562,
  zoom: 12,
  pitch: 45,
  bearing: 0,
};

const _THEME = [
  [100, 250, 93],
  [23, 165, 137],
  [100, 250, 150],
  [100, 150, 255],
  [250, 50, 250],
  [255, 50, 50],
];

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const DATA1 = "http://localhost:8003/berlin.json";
const DATA2 = "http://localhost:8003/berlin2.json";

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 800, height: 800, mask: true },
};

export default function App({ initialViewState = INITIAL_VIEW_STATE, mapStyle = MAP_STYLE,}) {
  var last_update_time = {};
  var last_update_time4 = {};
  var STOPPED_VEHICLES_Positions = new Map();

  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function updateDisplayInfo( trajectoryNumber, currentTimestamp, stoppedNumber) {
    var tNumber = (document.getElementById("tNumber").innerHTML =
      trajectoryNumber);
    var timeDiv = (document.getElementById("timeDiv").innerHTML =
      currentTimestamp);
    var stopped = (document.getElementById("stopped").innerHTML =
      stoppedNumber);
  	}

   function GetCoord() {
    	return STOPPED_VEHICLES_Positions;
	}

	function getCoordHash(){
		STOPPED_VEHICLES_Positions.forEach((value, key) => {
			coord.push({
				name: "ID" + key,
				coordinates: [
					{x: parseFloat(value[0])},
					{y: parseFloat(value[1])},
				],
			});
		});
		console.log("coord",coord);
		//return coord;
	}

  function vehicleStopped(id, path, threshold) {
    //if is stopped
    var xOld = path[0][0];
    var yOld = path[0][1];

    if (path.length - 2 > 0) {
      var index = path.length - 2;
    } 
    else {
      var index = path.length - 1;
    }
    var xNew = path[index][0];
    var yNew = path[index][1];

    if ( Math.abs(xOld - xNew) <= threshold && Math.abs(yOld - yNew) <= threshold) {
      //check if was already stopped
      //console.log("Difference is smaller ID", id);
      if (STOPPED_VEHICLES_Positions.get(id)) {
        //console.log("ID already inserted", id);
        return;
      } 
      else {
        STOPPED_VEHICLES_Positions.set(id, path[0]);
        IconPositions.push(path[0]);
      }
    }
    //is driving
    else {
      if (STOPPED_VEHICLES_Positions.get(id) != undefined) {
        //remove from list
        STOPPED_VEHICLES_Positions.delete(id);
        IconPositions.pop(path[0]);
      }
    }
  }

  function cleanStoppedID(id) {
    if (STOPPED_VEHICLES_Positions.get(id) != undefined) {
      //remove from list
      var topop = STOPPED_VEHICLES_Positions.get(id);
      STOPPED_VEHICLES_Positions.delete(id);
      IconPositions.pop(topop);
	    resp2.pop(topop);
    }
  }

  function ADDMapElements(value, key, map) {
		resp2.push(resp1[key]);
  }

  function HashToArray(map) {
    map.forEach(ADDMapElements);
  }


  async function* getResp() {
	  await timeout(1000);
    yield resp2;
  }

  async function* getdataFromArray(wholedata) {
	  console.log("Test", wholedata);
	  await timeout(1000);
    var returndata= wholedata[0];
    yield returndata;
  }

  async function* getData() {
    var threshold = 0;
    while (1) {
      fetch(DATA1)
        .then((response) => response.json())
        .then((response) => {
          if (Object.keys(response).length > 0) {
            updateDisplayInfo( response.length, Math.floor(Date.now() / 1000), resp2.length);
            let lengthRespTMP = response.length;
            let pathID = 0;

            //go thru the whole file
            while (pathID < lengthRespTMP) {
              let positionID = 0;
              if (!(parseInt(response[pathID]["vehicleID"]) in last_update_time)) {
                last_update_time[parseInt(response[pathID]["vehicleID"])] = 1;
              }

              let lengthTMP = response[pathID]["timestamps"].length;
              //go thru each object
              while (positionID < lengthTMP) {
                //clean previous response
                if (parseInt(response[pathID]["timestamps"][positionID]) < last_update_time[parseInt(response[pathID]["vehicleID"])]) {
                  //delete the positionID element
                  response[pathID]["timestamps"].splice(positionID, 1);
                  //DELETE POSITION WITH TIMESTAMP LESS THAN LAST UPDATE_TIMESTAMP
                  response[pathID]["path"].splice(positionID, 1);
                  cleanStoppedID(parseInt(response[pathID]["vehicleID"]));

                } 
                else {
                  //continue reading (timestamp window valid)
                  last_update_time[parseInt(response[pathID]["vehicleID"])] = parseInt(response[pathID]["timestamps"][positionID]);

                  // if longitude latitude difference smaller than x meters compared to UPDATE_LONGITUTE_LATITUDE
                  //console.log("ID :",pathID,response[pathID]["path"]);

                  vehicleStopped( parseInt(response[pathID]["vehicleID"]),response[pathID]["path"], threshold);
                  //console.log("stopped",STOPPED_VEHICLES_Positions);

                  positionID++;
                }
                if (response[pathID]["timestamps"].length === 0 || response[pathID]["path"].length === 0) {
                  lengthTMP = 0;
                } 
                else {
                  lengthTMP = response[pathID]["timestamps"].length;
                }
              }
              if (response[pathID]["timestamps"].length === 0 || response[pathID]["path"].length === 0) {
                response.splice(pathID, 1);
              } 
              else {
                pathID++;
              }
              lengthRespTMP = response.length;
            }
          }
          if (response.length === 0) {
			      resp1 = [];
          } 
		      else {
			      resp1 = response;
			      HashToArray(STOPPED_VEHICLES_Positions);
            // update iconLAYER props.data , with new data in STOPPED_VEHICLUE list or just copy list to the layer data
          }
        });
      await timeout(100);
      yield resp2;
    }
  }

  async function* getDataTraj() {
    var resp4 = []; // start with empty segment
    while (1) {
      fetch(DATA2)
        .then((response4) => response4.json())
        .then((response4) => {
          if (Object.keys(response4).length > 0) {
            //updateDisplayInfo( response.length, Math.floor(Date.now() / 1000), resp2.length);
            let lengthRespTMP4 = response4.length;
            let pathID4 = 0;

            //go thru the whole file
            while (pathID4 < lengthRespTMP4) {
              let positionID4 = 0;
              if (!(parseInt(response4[pathID4]["vehicleID"]) in last_update_time4)) {
                last_update_time4[parseInt(response4[pathID4]["vehicleID"])] = 1;
              }

              let lengthTMP4 = response4[pathID4]["timestamps"].length;
              //go thru each object
              while (positionID4 < lengthTMP4) {
                //clean previous response
                if (parseInt(response4[pathID4]["timestamps"][positionID4]) < last_update_time4[parseInt(response4[pathID4]["vehicleID"])]) {
                  //delete the positionID element
                  response4[pathID4]["timestamps"].splice(positionID4, 1);
                  //DELETE POSITION WITH TIMESTAMP LESS THAN LAST UPDATE_TIMESTAMP
                  response4[pathID4]["path"].splice(positionID4, 1);

                } 
                else {
                  //continue reading (timestamp window valid)
                  last_update_time4[parseInt(response4[pathID4]["vehicleID"])] = parseInt(response4[pathID4]["timestamps"][positionID4]);

                  // if longitude latitude difference smaller than x meters compared to UPDATE_LONGITUTE_LATITUDE
                  //console.log("ID :",pathID,response[pathID]["path"]);

                  //vehicleStopped( parseInt(response[pathID]["vehicleID"]),response[pathID]["path"], threshold);
                  //console.log("stopped",STOPPED_VEHICLES_Positions);

                  positionID4++;
                }
                if (response4[pathID4]["timestamps"].length === 0 || response4[pathID4]["path"].length === 0) {
                  lengthTMP4 = 0;
                } 
                else {
                  lengthTMP4 = response4[pathID4]["timestamps"].length;
                }
              }
              if (response4[pathID4]["timestamps"].length === 0 || response4[pathID4]["path"].length === 0) {
                response4.splice(pathID4, 1);
              } 
              else {
                pathID4++;
              }
              lengthRespTMP4 = response4.length;
            }
          }
          if (response4.length === 0) {
            resp4 = [];
          } 
		      else {
            resp4 = response4;
          }
        });
      await timeout(100);
      yield resp4;
    }
  }
  

  const trajVar = getDataTraj();

  const iconVar = getData();

  function updateLayers(data) {
    console.log("here",data);
    const layers =
      new PathLayer({
        id: "PathLayer",
        data: data,
        getPath: (d) => d.path,
        parameters: {
          depthMask: false,
        },
        getWidth: (d) => 1.5,
        widthMinPixels: 2,
        widthScale: 2,
        getColor: (d) => _THEME[3],
        opacity: 0.2,
        pickable: true,
        autoHighlight: true,
        shadowEnabled: false
      });
    return layers;
  }

  function renderLayer(data) {
	const iconLayer = new IconLayer({
		id: "icon-layer",
		data,
		pickable: true,
		iconAtlas: 'https://raw.githubusercontent.com/marianaGarcez/Backup/main/circle.png',
		iconMapping: ICON_MAPPING,
		getIcon: (d) => 'marker',
		getPosition: (d) => d.path[0],
		sizeScale: 20,
		getColor: (d) => [Math.sqrt(d.exits), 140, 0]
    //updateProps: {
    //  data: Object.assign({}, FIXTURES.choropleths),
    //  _dataDiff: () => [{startRow: 0, endRow: 3}]
    //}
  	});
	return iconLayer;
}

  const _layers = updateLayers(trajVar);
  
  const _layers2 = renderLayer(iconVar);

  return (
    <DeckGL
      layers={[_layers,_layers2]}
      initialViewState={initialViewState}
      controller={true}
      getTooltip={({ object }) => object && `Vehicle ID : ${object.vehicleID}`}
    >
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  render(
    <div>
      <App />
      <FPSStats />
    </div>,
    container
  );
}

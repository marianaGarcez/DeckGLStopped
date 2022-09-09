import json
import time
import sys
from datetime import datetime, timedelta

import json

f = open(sys.argv[1])
data = json.load(f)

startingtimestamp = datetime.now()
resTrajectories = []
TRAJECTORY_SIZE = 240 # one position per second
vehicleID = 0

for route in data["features"]:
    geom= route["geometry"]
    prop = route["properties"]
    tripid = prop["tripid"]
    #print(tripid)

    resTrajectory= geom["coordinates"]
    resTimestamps = []

    while len(resTrajectory) < TRAJECTORY_SIZE:
        if geom["coordinates"][0] != geom["coordinates"][-1]:
            for p in range(len(geom["coordinates"])-1,-1,-1):
                resTrajectory.append(geom["coordinates"][p])
        else:
            for p in range(len(geom["coordinates"])):
                resTrajectory.append(geom["coordinates"][p])
    for t in range(len(resTrajectory)):
        resTimestamps.append((startingtimestamp+timedelta(seconds=t)).strftime("%Y-%m-%d %H:%M:%S")) # en seconde
    
    resTrajectories.append({"vehicleID" : tripid, "path" : resTrajectory, "timestamps" : resTimestamps})
    vehicleID +=1
    
with open('berlininput.json', 'w') as f:
    json.dump(resTrajectories, f, indent=2)

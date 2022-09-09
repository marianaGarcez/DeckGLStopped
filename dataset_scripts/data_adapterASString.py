from ast import And
import json
import sys
import random
from datetime import datetime, timedelta

import json

def ADD(l,p,i):
    coord = [[0 for _ in range(0,2)] for _ in range(0,i)]
    for it in range(0,len(l)):
       coord[it][0]= l[it]
       coord[it][1]= p[it]
    return coord


f = open(sys.argv[1])
data = json.load(f)

startingtimestamp = datetime.now()
resTrajectories = []
TRAJECTORY_SIZE = 120 # one position per second
vehicleID = 0 

for r in data:
    geojson= r["st_asgeojson"]
    vehicle = r["vehicle"]

    coordinates= geojson["coordinates"]
     
    resTrajectory=coordinates

    resTimestamps = []


    while len(resTrajectory) < TRAJECTORY_SIZE:
        #if the first is equal the last
        if coordinates[0] != coordinates[-1]:
            for p in range(len(coordinates)-1,-1,-1):
                resTrajectory.append(coordinates[p])
        else:
            for p in range(len(coordinates)):
                resTrajectory.append(coordinates[p])
    
    for t in range(len(resTrajectory)):
        resTimestamps.append((startingtimestamp+timedelta(seconds=t)).strftime("%Y-%m-%d %H:%M:%S")) # en seconde
    
    resTrajectories.append({"vehicleID" : vehicleID, "path" : resTrajectory, "timestamps" : resTimestamps})
    vehicleID +=1
    #print(len(resTrajectory))

    
with open('BerlinTest4.json', 'w') as f:
    json.dump(resTrajectories, f, indent=2)

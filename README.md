# DeckGLStopped

## Overview
DeckGLStopped is a real-time visualization application leveraging DeckGL, Kafka, and MobilityDB/MEOS. The project streams mobility data from a Kafka producer to a Kafka consumer, processes it using MEOS, and visualizes it using a DeckGL-based web application.

## Dependencies
Ensure you have the following dependencies installed:
- [Kafka C](https://github.com/jogjini/kafka-c)
- [MEOS](https://libmeos.org/)
- [MobilityDB](https://github.com/MobilityDB/MobilityDB)
- Node.js and npm
- Python 3

## Setup & Running the Application
To run the application, you need multiple terminal sessions:

### 1. Start the Kafka Producer and Consumer
Navigate to the directory containing the Kafka producer and consumer scripts:
```bash
cd C_Implementation/
```
#### Start the Kafka Consumer:
```bash
./consumer localhost:9092 MEOS carPositions 
```
#### Start the Kafka Producer:
```bash
python3 json_to_kafkaMine.py selected_columns_df_part_1.json
```

### 2. Start the HTTP Server
This server hosts the JSON file required for the visualization.
Navigate to `data_server/` and run:
```bash
cd data_server
python3 cors_http_server.py
```

### 3. Start the DeckGL Application
Navigate to `deckgl/` and run:
```bash
cd deckgl
npm install
npm start
```

## Usage
Once all components are running, the application will consume data from Kafka, process it with MEOS, and visualize it in DeckGL.



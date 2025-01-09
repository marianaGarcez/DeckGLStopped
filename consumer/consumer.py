from confluent_kafka import Consumer, KafkaError, KafkaException
import json
import sys
import os

# Initialize output file
output_path = '../data_server/outputConsumer.json'
with open(output_path, 'w') as f:
    json.dump([], f)

# Kafka consumer configuration
conf = {
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'my_group',
    'auto.offset.reset': 'earliest'
}

# Create consumer and subscribe
consumer = Consumer(conf)
consumer.subscribe(['positions'])

try:
    while True:
        msg = consumer.poll(1.0)

        if msg is None:
            continue

        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                print(f'%% {msg.topic()} [{msg.partition()}] reached end at offset {msg.offset()}')
            elif msg.error():
                raise KafkaException(msg.error())
        else:
            # Process message
            value = msg.value().decode('utf-8')
            device_id, gps_lat, gps_lon, time_utc, gps_speed = value.split(',')
            
            # Read current data
            with open(output_path, 'r') as f:
                data = json.load(f)
            
            # Append new data
            data.append({
                "time_utc": int(time_utc),
                "device_id": int(device_id),
                "gps_speed": float(gps_speed),
                "gps_lat": float(gps_lat),
                "gps_lon": float(gps_lon)
            })
            
            # Write updated data
            with open(output_path, 'w') as f:
                json.dump(data, f)
            
            print(f'Processed and saved: {value}')

except KeyboardInterrupt:
    print('\nInterrupted by user')

except Exception as e:
    print(f'Unexpected error: {e}')

finally:
    consumer.close()
    print('Consumer closed')
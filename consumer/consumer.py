from confluent_kafka import Consumer, KafkaError
import json
import sys

# Kafka consumer configuration
conf = {
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'my_group',
    'auto.offset.reset': 'earliest'
}

# Create a Kafka consumer
consumer = Consumer(conf)

# Subscribe to the 'positions' topic
consumer.subscribe(['positions'])

# List to store the consumed messages
data = []

try:
    while True:
        msg = consumer.poll(1.0)  # Poll for messages with a timeout of 1 second

        if msg is None:
            continue

        if msg.error():
            if msg.error().code() == KafkaError._PARTITION_EOF:
                # End of partition event
                print(f'%% {msg.topic()} [{msg.partition()}] reached end at offset {msg.offset()}')
            elif msg.error():
                raise KafkaException(msg.error())
        else:
            # Proper message
            value = msg.value().decode('utf-8')
            device_id, gps_lat, gps_lon, time_utc, gps_speed = value.split(',')
            data.append({
                "time_utc": int(time_utc),
                "device_id": int(device_id),
                "gps_speed": float(gps_speed),
                "gps_lat": float(gps_lat),
                "gps_lon": float(gps_lon)
            })
            print(f'Received message: {value}')

except KeyboardInterrupt:
    pass
finally:
    # Close the consumer
    consumer.close()

# Save the data to a JSON file
with open('output.json', 'w') as f:
    json.dump(data, f, indent=2)
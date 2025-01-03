from confluent_kafka import Producer, Consumer, KafkaError
import json
import sys
import time

p = Producer({'bootstrap.servers': 'localhost:9092','broker.version.fallback': '0.9.0.0', 'api.version.request': False})

f = open(sys.argv[1])
data = json.load(f)

KAFKA_TOPIC = "positions"

for row in data:
    try:
        value = f"{row['device_id']},{row['gps_lat']},{row['gps_lon']},{row['time_utc']},{row['gps_speed']}"
        print(value)
        p.produce(KAFKA_TOPIC, value=value.encode('utf-8'))
        p.poll(0)
        time.sleep(1)
    except Exception as e:
        print(f"Produce Error : {e}")

p.flush(0)
CC=gcc
CFLAGS= -I/opt/homebrew/Cellar/librdkafka/1.9.2/include -L/opt/homebrew/Cellar/librdkafka/1.9.2/lib -lrdkafka
DEPS =  save_to_json.h rt_mb_buffer.h
OBJ = save_to_json.o rt_mb_buffer.o consumer.o

%.o: %.c $(DEPS)
	$(CC) -c -o $@ $< $(CFLAGS)

consumer: $(OBJ)
	gcc -o $@ $^ $(CFLAGS)

.PHONY: clean

clean:
	rm consumer *.o

#include "rt_mb_buffer.h"

#define VEHICLE_UNIQUE_ID_LENGTH 50
#define LATITUDE_LENGTH 20
#define LONGITUDE_LENGTH 20
#define TIME_UTC_LENGTH 20
#define SPEED_LENGTH 20

void init_position(Position *p, char* time_utc, char* latitude, char* longitude, char* speed) {
    p->time_utc = strdup(time_utc);
    p->latitude = strdup(latitude);
    p->longitude = strdup(longitude);
    p->speed = strdup(speed);
}

void init_trajectory(Trajectory *t, char* vehicle_id, int maxBufferPosition) {
    t->vehicle_id = strdup(vehicle_id);
    t->current_number_position = 0;
    t->max_number_position = maxBufferPosition;
    t->position_array = (Position**)malloc(maxBufferPosition * sizeof(Position*));
}

void insert_position(Trajectory *t, Position* new_position) {
    if (t->current_number_position < t->max_number_position) {
        t->position_array[t->current_number_position++] = new_position;
    }
}

void free_trajectory_position_array(Trajectory *t) {
    for (int i = 0; i < t->current_number_position; i++) {
        free(t->position_array[i]->time_utc);
        free(t->position_array[i]->latitude);
        free(t->position_array[i]->longitude);
        free(t->position_array[i]->speed);
        free(t->position_array[i]);
    }
    free(t->position_array);
}

void free_trajectory(Trajectory *t) {
    free_trajectory_position_array(t);
    free(t->vehicle_id);
    free(t);
}

void init_trajectory_list(Trajectory_list *tl, size_t default_trajectory_number) {
    tl->trajectory_array = (Trajectory**)malloc(default_trajectory_number * sizeof(Trajectory*));
    tl->current_number_trajectory = 0;
    tl->max_number_trajectory = default_trajectory_number;
}

int search_no_trajectory_index(Trajectory_list *trajl) {
    for (size_t i = 0; i < trajl->current_number_trajectory; i++) {
        if (trajl->trajectory_array[i] == NULL) {
            return i;
        }
    }
    return -1;
}

void insert_trajectory_list(Trajectory_list *tl, Trajectory* new_trajectory) {
    if (tl->current_number_trajectory < tl->max_number_trajectory) {
        tl->trajectory_array[tl->current_number_trajectory++] = new_trajectory;
    }
}

void free_trajectory_list(Trajectory_list *trajl) {
    for (size_t i = 0; i < trajl->current_number_trajectory; i++) {
        if (trajl->trajectory_array[i] != NULL) {
            free_trajectory(trajl->trajectory_array[i]);
        }
    }
    free(trajl->trajectory_array);
}

void insert_trajectory_mobilityDB(Trajectory *t) {
    // Placeholder for inserting trajectory into MobilityDB
    printf("Inserting trajectory into MobilityDB: %s\n", t->vehicle_id);
}

void parse_one_kafka_position(char* input_position, char* vehicleUniqueID, char* latitude, char* longitude, char* time_utc_str, char* speed, const int vehicleUniqueIDLENGTH, const int latitudeLENGTH, const int longitudeLENGTH, const int time_utcLENGTH, const int speedLENGTH) {
    sscanf(input_position, "%[^,],%[^,],%[^,],%[^,],%s", vehicleUniqueID, latitude, longitude, time_utc_str, speed);
}

int check_position_is_valid(char* vehicleUniqueID, char* latitude, char* longitude, char* time_utc_str, char* speed) {
    // Placeholder for checking if a position is valid
    return 1;
}

int trajectory_already_exist(Trajectory_list* tl, char* vehicleUniqueID) {
    for (size_t i = 0; i < tl->current_number_trajectory; i++) {
        if (strcmp(tl->trajectory_array[i]->vehicle_id, vehicleUniqueID) == 0) {
            return 1;
        }
    }
    return 0;
}

Trajectory* get_or_create_trajectory(Trajectory_list* tl, char* vehicleUniqueID, const int maxBufferPosition) {
    for (size_t i = 0; i < tl->current_number_trajectory; i++) {
        if (strcmp(tl->trajectory_array[i]->vehicle_id, vehicleUniqueID) == 0) {
            return tl->trajectory_array[i];
        }
    }
    Trajectory* new_trajectory = (Trajectory*)malloc(sizeof(Trajectory));
    init_trajectory(new_trajectory, vehicleUniqueID, maxBufferPosition);
    insert_trajectory_list(tl, new_trajectory);
    return new_trajectory;
}

void check_trajectories_to_db(Trajectory_list* tl, const int dbInsertionInterval, const int VNumber) {
    for (size_t i = 0; i < tl->current_number_trajectory; i++) {
        if ((clock() - tl->trajectory_array[i]->last_db_insert_time) / CLOCKS_PER_SEC >= dbInsertionInterval) {
            insert_trajectory_mobilityDB(tl->trajectory_array[i]);
            tl->trajectory_array[i]->last_db_insert_time = clock();
        }
    }
}

void handle_new_position(Trajectory_list* tl, char* input_position, const int dbInsertionInterval, const int VNumber, const int maxBufferPosition) {
    char vehicleUniqueID[VEHICLE_UNIQUE_ID_LENGTH];
    char latitude[LATITUDE_LENGTH];
    char longitude[LONGITUDE_LENGTH];
    char time_utc_str[TIME_UTC_LENGTH];
    char speed[SPEED_LENGTH];

    parse_one_kafka_position(input_position, vehicleUniqueID, latitude, longitude, time_utc_str, speed, VEHICLE_UNIQUE_ID_LENGTH, LATITUDE_LENGTH, LONGITUDE_LENGTH, TIME_UTC_LENGTH, SPEED_LENGTH);

    if (check_position_is_valid(vehicleUniqueID, latitude, longitude, time_utc_str, speed)) {
        Trajectory* t = get_or_create_trajectory(tl, vehicleUniqueID, maxBufferPosition);
        Position* new_p = (Position*)malloc(sizeof(Position));
        init_position(new_p, time_utc_str, latitude, longitude, speed);
        insert_position(t, new_p);
        check_trajectories_to_db(tl, dbInsertionInterval, VNumber);
    }
}
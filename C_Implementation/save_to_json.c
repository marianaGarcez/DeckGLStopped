#include <stdio.h>
#include <stdlib.h>
#include "rt_mb_buffer.h"

void save_to_json(Trajectory_list* tl){
    FILE *fptr;

    //fptr = fopen("../data_server/trips.json", "w");
    fptr = fopen("../data_server/berlin.json", "w");
    if(fptr == NULL){
        printf("FILE ERROR\n");   
        exit(1);             
    }

    int LINEMAXLENGTH = 150;
    char line_to_json[LINEMAXLENGTH];
    char concatenation_tmp[LINEMAXLENGTH];

    strncpy(line_to_json,"[\n",LINEMAXLENGTH);
    fputs(line_to_json, fptr);

    for (int t = 0; t < tl->current_number_trajectory; t++) {
        for (int p = 0; p < tl->trajectory_array[t]->current_number_position; p++) {
            strncpy(line_to_json,"  {\n",LINEMAXLENGTH);
            fputs(line_to_json, fptr);
            memset(line_to_json, 0, LINEMAXLENGTH);

            // device_id
            strncpy(line_to_json,"    \"device_id\":",LINEMAXLENGTH);
            memset(concatenation_tmp, 0, LINEMAXLENGTH);
            sprintf(concatenation_tmp, "\"%s\"", tl->trajectory_array[t]->vehicle_id);
            strcat(line_to_json, concatenation_tmp);
            strcat(line_to_json, ",\n");
            fputs(line_to_json, fptr);
            memset(line_to_json, 0, LINEMAXLENGTH);

            // gps_lat
            strncpy(line_to_json,"    \"gps_lat\":",LINEMAXLENGTH);
            memset(concatenation_tmp, 0, LINEMAXLENGTH);
            sprintf(concatenation_tmp, "%s", tl->trajectory_array[t]->position_array[p]->latitude);
            strcat(line_to_json, concatenation_tmp);
            strcat(line_to_json, ",\n");
            fputs(line_to_json, fptr);
            memset(line_to_json, 0, LINEMAXLENGTH);

            // gps_lon
            strncpy(line_to_json,"    \"gps_lon\":",LINEMAXLENGTH);
            memset(concatenation_tmp, 0, LINEMAXLENGTH);
            sprintf(concatenation_tmp, "%s", tl->trajectory_array[t]->position_array[p]->longitude);
            strcat(line_to_json, concatenation_tmp);
            strcat(line_to_json, ",\n");
            fputs(line_to_json, fptr);
            memset(line_to_json, 0, LINEMAXLENGTH);

            // time_utc
            strncpy(line_to_json,"    \"time_utc\":",LINEMAXLENGTH);
            memset(concatenation_tmp, 0, LINEMAXLENGTH);
            sprintf(concatenation_tmp, "%s", tl->trajectory_array[t]->position_array[p]->time_utc);
            strcat(line_to_json, concatenation_tmp);
            strcat(line_to_json, ",\n");
            fputs(line_to_json, fptr);
            memset(line_to_json, 0, LINEMAXLENGTH);

            // gps_speed
            strncpy(line_to_json,"    \"gps_speed\":",LINEMAXLENGTH);
            memset(concatenation_tmp, 0, LINEMAXLENGTH);
            sprintf(concatenation_tmp, "%s", tl->trajectory_array[t]->position_array[p]->speed);
            strcat(line_to_json, concatenation_tmp);
            strcat(line_to_json, "\n");
            fputs(line_to_json, fptr);
            memset(line_to_json, 0, LINEMAXLENGTH);

            strncpy(line_to_json,"  },\n",LINEMAXLENGTH);
            fputs(line_to_json, fptr);
        }
    }
    strncpy(line_to_json,"]\n",LINEMAXLENGTH);
    fputs(line_to_json, fptr);

    fclose(fptr);
}
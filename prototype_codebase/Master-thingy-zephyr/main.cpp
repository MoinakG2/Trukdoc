#include <jwt.h>
#include <ArduinoJson.h>
#include <base64.hpp>
#include <RF24Network.h>
#include <RF24.h>
#include <SPI_.h>
#include <timestamp32bits.h>
#include<bits/stdc++.h>
#include <Board_Interface.h>
#include <avr/io.h>
#include <util/_delay_ms.h>
#include <String.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#define SLAVE_ADD 0x08

RF24 radio(7,6);                 // nRF24L01 (CE,CSN)
RF24Network network(radio);      // Include the radio in the network



const uint16_t this_node = 00;   // Address of this node in Octal format ( 04,031, etc)
const uint16_t node01 = 01;      // Address of the other node in Octal format
const uint16_t node02 = 02;
const uint16_t node03 = 03;
const uint16_t node04 = 04;
const uint16_t node05 = 05;

uint16_t data_1 = 0; //data from slave1
uint16_t data_2 = 0; //data from slave2
uint16_t data_3 = 0; //data from slave3
uint16_t data_4 = 0; //data from slave4
uint16_t data_5 = 0; //data from slave5

int engine_analog = A0;
int count = 0;
unsigned long cur_timestamp;
timestamp32bits stamp = timestamp32bits();

const char* private_key_str =
  "e9:f3:97:40:eb:60:7e:8a:34:91:f5:0e:c0:8e:10:"
  "38:cd:65:60:94:06:66:bd:6d:ed:44:cf:a9:66:8a:"
  "5e:82";

NN_DIGIT priv_key[9];
void setPrivateKey(const char*);
void startHttp();
void sendHttpData();
void getTimeLocation();
void parsetimeData();
void gsmPublish();
void printSerial();
void print_(string);
void print_next_line(string);

typedef struct TimeCoordinates {
  String year;
  String month;
  String day;

  String hour;
  String minute;
  String second;

  String latittude;
  String longitude;
  String date;
  String timedata;
  
  String precision;
  
} TimeCoordinates;

String auth_token;
String timeLocation;
TimeCoordinates tc;


LiquidCrystal_I2C lcd(0x27, 20, 4);

void warning_handler(string warning) {
  lcd.clear();
  lcd.setCursor(0,0);
  string to_print = "Check with " + warning;
  lcd.print(to_print);
  _delay_ms(5000);
  lcd.clear();
}

void trip_start_check() {
  bool flag = 1;
  int state1 = 0;
  int state2 = 0;
  int state3 = 0;
  int state4 = 0;
  int state5 = 0;
  int counter = 0;
  while(flag) {
    state1 = fetch_from_slave1();
    state2 = fetch_from_slave2();
    state3 = fetch_from_slave3();
    state4 = fetch_from_slave4();
    state5 = fetch_from_slave5();
    int slateTot = state1 + state2 + state3 + state4 + state5;
    if(slateTot != 5) {
      flag = 1;
      counter++;
      if(counter > 20) {
        warning_handler("Trip_Not_Start");
        break;
      }
      continue;
    }
    flag = 0;
  }
}
void trip_end_diagnostics() {
  data1 = fetch_data_slave1();
  data2 = fetch_data_slave2();
  data3 = fetch_data_slave3();
  data4 = fetch_data_slave4();
  data5 = fetch_data_slave5();
  dataPack = appendData(data1, data2, data3, data4, data5);
  loranWanSend(dataPack);
}

void DEF_tank_monitoring(int amm_conc, int sol_lvl) {
  if(amm_conc < 30 || sol_lvl < 200) {
    warning_handler("DEF_Tank");
  }
}
void wheel_alignment_monitoring(float steer_angle, float wheel_angle) {
  float resultant = steer_angle * 0.0625;
  if (abs(resultant-wheel_angle) > 1.50) {
    warning_handler("Wheel_Alignment");
  }
}
void axle_bending_monitoring(int deform) {
  if(deform > 9) {
    warning_handler("Axle_Bending");
  }
}
void clutch_bite_detection(int engineRPM, int clutchRPM) {
  if(abs(engineRPM-clutchRPM)>50) {
    warning_handler("Clutch_Bite");
  }
}
void coolant_pressure(int cool_pr) {
  if(cool_pr<2.5) {
    warning_handler("Coolant_Pressure");
  }
}
void tyre_pressure(int tyre_pr) {
  if(tyre_pr<40) {
    warning_handler("Tyre_Pressre");
  }
}

//function to receive stream 
void receiveEvent(int byteCount) {
    //if stream is on 
    while (Wire.available()) {
        char c = Wire.read();
        print_next_line(c);
    }
}


void setup() {
  Serial.begin(115200);
  Serial1.setTimeout(5000);
  Serial1.begin(115200);
  while(!Serial) {}
  SPI.begin();
  radio.begin();
  DDRB |= 0B100000;
  network.begin(90, this_node);  //(channel, node address)
  radio.setDataRate(RF24_2MBPS); 
  print_next_line("Setup Complete!");

  lcd.init();
  lcd.backlight();

  //begin comm on the bus
  Wire.begin(SLAVE_ADD);
  //prepare to receive 
  Wire.onReceive(receiveEvent);

  trip_start_check();
}

void loop() {
  network.update();
  //===== Receiving =====//
  while ( network.available() ) {     // Is there any incoming data?
    RF24NetworkHeader header;
    long incomingData;
    network.read(header, &incomingData, sizeof(incomingData)); // Read the incoming data
    int node_label = 0;
    node_label = header.from_node;
    switch(node_label) {
      case 1: //Ammonia and DEF sensor
        data_1 = incomingData;
        print_("Incoming Data from Ammonia and Water level: ");
        print_next_line(incomingData);
        int amm_conc = incomingData.amm_conc;
        int sol_lvl = incomingData.sol_lvl;
        DEF_tank_monitoring(amm_conc, sol_lvl);
        continue;
      case 2: //Wheel Alignment
        data_2 = incomingData;
        print_("Incoming Data from Wheel Alignment: ");
        print_next_line(incomingData);
        int steer_angle = incomingData.steer_angle;
        int wheel_angle = incomingData.wheel_angle;
        wheel_alignment_monitoring(steer_angle, wheel_angle);
        continue;
      case 3: //Axle Alignment
        data_3 = incomingData;
        print_("Incoming Data from Axle Alignment: ");
        print_next_line(incomingData);
        int deform = incomingData.deform;
        axle_bending_monitoring(deform);
        continue;
      case 4: //Input Shaft RPM and Coolant Pressure
        print_("Incoming Data from Input shaft RPM and coolant pressure: ");
        print_next_line(incomingData);
        int engineRPM = ecu_obd_handler.engine_RPM;
        int clutchRPM = incomingData.clutchRPM;
        clutch_bite_detection(engineRPM, clutchRPM);
        int cool_pr = incomingData.cool_pr;
        coolant_pressure(cool_pr);
        continue;
      case 5: //Tyre pressure 
        data_5 = incomingData;
        print_("Incoming Data from Air Pressure: ");
        print_next_line(incomingData);
        int tyre_pr = incomingData.tyre_pr;
        tyre_pressure(tyre_pr);
        continue;
      default:
        print_("Fetching data...");
        continue;
    }
  }

  int trip_end = 0;
  trip_end = header.tripEnd;
  if(trip_end == 1) {
    trip_end_diagnostics();
  }
  _delay_ms(750);
  count++;
  if(count==300){gsmPublish(); count=0;}
}

void print_(string s){
  cout << s;
}

void print_next_line(string s){
  cout << "\n" << s;
}

void setPrivateKey(const char *private_key) {
  priv_key[8] = 0;
  for (int i = 7; i >= 0; i--) {
    priv_key[i] = 0;
    for (int byte_num = 0; byte_num < 4; byte_num++) {
      priv_key[i] = (priv_key[i] << 8) + strtoul(private_key, NULL, 16);
      private_key += 3;
    }
  }
}

void getTimeLocation() {
  _delay_ms(3000);
  print_("AT+SAPBR=3,1,\"Contype\",\"GPRS\"\r");
  _delay_ms(500);
  printSerial();
  print_("AT+SAPBR=3,1,\"APN\",\"www\"\r");
  _delay_ms(500);
  printSerial();
  print_("AT+SAPBR=1,1\r");
  _delay_ms(500);
  printSerial();
  print_("AT+CLBS=4,1\r");
  timeLocation = Serial1.readString();
  print_next_line(timeLocation);
  parsetimeData();
}

void startHttp() {
  print_("AT+CGATT=1\r");
  _delay_ms(500);
  printSerial();
  print_("AT+CSTT=\"www\"\r");
  _delay_ms(500);
  printSerial();
  print_("AT+CIICR\r");
  _delay_ms(500);
  printSerial();
  print_("AT+CIFSR\r");
  _delay_ms(500);
  printSerial();
  print_("AT+CDNSCFG=1.1.1.1\r");
  _delay_ms(500);
  printSerial();
}

void sendHttpData() {
  DynamicJsonDocument doc(1024);
  doc["name"] = "Truck 42";
  doc["geopoint"] = "POINT(" + tc.longitude + " " + tc.latittude + ")";
  doc["timestamp"] = tc.year+"-"+tc.month+"-"+tc.day+" "+tc.hour+":"+tc.minute+":"+tc.second+".000000";
  doc["metadata"] = String(data_1) + String(data_2) + String(data_3) + String(data_4) + String(data_5);
  char* json_data = (char*) calloc(1024, sizeof(char));
  char* base64_data = (char*) calloc(1024, sizeof(char));
  serializeJson(doc, json_data, 1024);
  encode_base64((unsigned char*) json_data, strlen(json_data), (unsigned char*) base64_data);

  String data = "{\"binary_data\": \"" + String(base64_data) + "\", \"sub_folder\": \"gps\"}";

  _delay_ms(2000);
  print_("AT+HTTPINIT\r");
  _delay_ms(500);
  printSerial();
  print_("AT+HTTPPARA=\"CID\",\"1\"\r");
  _delay_ms(500);
  printSerial();
  print_("AT+HTTPPARA=\"URL\",\"http://iot.sohamsen.me/v1/projects/interiit-silabs-343212/locations/asia-east1/registries/test/devices/esp8266:publishEvent\"\r");
  _delay_ms(500);
  printSerial();
  print_("AT+HTTPPARA=\"CONTENT\",\"application/json\"\r");
  _delay_ms(500);
  printSerial();
  print_("AT+HTTPPARA=\"UA\",\"curl/7.77.0\"\r");
  _delay_ms(500);
  printSerial();
  print_("AT+HTTPPARA=\"USERDATA\",\"authorization: Bearer ");
  print_(auth_token);
  print_("\"\r");
  _delay_ms(1500);
  printSerial();
  print_("AT+HTTPDATA=");
  print_(data.length());
  print_(",5000\r");
  _delay_ms(500);
  print_(data);
  _delay_ms(1500);
  printSerial();
  print_("AT+HTTPACTION=1\r");
  _delay_ms(2000);
  printSerial();
}

void parsetimeData() {
  _delay_ms(1000);
  tc.longitude=timeLocation.substring(23,32);
  tc.latittude=timeLocation.substring(33,42);
  tc.precision=timeLocation.substring(43,46);
  tc.date=timeLocation.substring(47,55);
  tc.timedata=timeLocation.substring(56,64);

  tc.hour = tc.timedata.substring(0,2);
  tc.minute = tc.timedata.substring(3,5);
  tc.second = tc.timedata.substring(6,8);

  tc.year = tc.date.substring(0,2);
  tc.month = tc.date.substring(3,5);
  tc.day = tc.date.substring(6,8);
  return;
}

void gsmPublish(){
  setPrivateKey(private_key_str);
  cur_timestamp = stamp.timestamp(tc.year.toInt(),tc.month.toInt(),tc.day.toInt(),tc.hour.toInt(),tc.minute.toInt(),tc.second.toInt());
  auth_token = CreateJwt("interiit-silabs-343212", cur_timestamp, priv_key, 12*3600);
  getTimeLocation();
  startHttp();
  sendHttpData();
  for(int k=0;k<10;k++){
    PORTB |= 0B100000; // PORTB5
    _delay_ms(50);
    PORTB &= ~ 0B100000; // PORTB5
    _delay_ms(50);
  }
}

void printSerial() {
  _delay_ms(1000);
  while (Serial1.available()) Serial.write(Serial1.read());
}

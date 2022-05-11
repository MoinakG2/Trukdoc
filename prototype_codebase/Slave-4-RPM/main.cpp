#include <RF24Network.h>
#include <RF24.h>
#include <SPI_.h>
#include <Tachometer.h>
#include<bits/stdc++.h>
#include <Board_Interface.h>
#include <avr/io.h>
#include <util/delay.h>

#define TACH_PIN 2 //Defining input pin for RPM reading
Tachometer tacho;
long rpm;

#define coolant_pin A0
long pressure;

RF24 radio(9,8);               // nRF24L01 (CE,CSN)
RF24Network network(radio);      
const uint16_t this_node = 04;   
const uint16_t master = 00;      

long interval_rpm = 1000;
long interval_coolant = 5000;  
long last_sent_rpm = 0;
long last_sent_coolant = 0; 
long present;  

void print_(string);
void print_next_line(string);

//Interrupt handler
void countRot() {
  tacho.tick(); //intimate library
}

void setup() {
  Serial.begin(9600);
  SPI.begin();
  radio.begin();
  network.begin(90, this_node);  //(channel, node address)
  radio.setDataRate(RF24_2MBPS);

  DDRD &= ~0b00000100;
  PORTD |= 0b00000100; //tachometer pin in pullup mode
  DDRC &= ~0b00000001; // coolant pin as input
  /*attachInterrupt(digitalPinToInterrupt(TACH_PIN), countRot, LOW); //May be reqd. to be changed to falling
  tacho.setTimeout(1000); //1s delay to observe stopping of rotation */
}

void loop() {
  network.update();
  present = millis();
  if (present - last_sent_rpm >= interval_rpm) {   // If it's time to send a data, send it!
    last_sent_rpm = present;
    //rpm = tacho.getRPM();
    rpm = 100; //dummy value
    print_("RPM: "); print_next_line(rpm);
    RF24NetworkHeader header(master); 
    bool ok = network.write(header, &rpm, sizeof(rpm)); // Send the data
  }
   if (present - last_sent_coolant >= interval_coolant) {   // If it's time to send a data, send it!
    last_sent_coolant = present;
    //pressure = analogRead(coolant_pin);
    pressure = 512; //dummy
    print_("Coolant: "); print_next_line(pressure);
    RF24NetworkHeader header(master); 
    bool ok = network.write(header, &pressure, sizeof(pressure)); // Send the data
  }
}

void print_(string s){
  cout << s;
}

void print_next_line(string s){
  cout << "\n" << s;
}
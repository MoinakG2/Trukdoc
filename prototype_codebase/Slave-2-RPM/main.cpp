/*Rotary Encoder Pinout: clk-7, DT-6, Vin-5 V, GND-gnd */

#include <RF24Network.h>
#include <RF24.h>
#include <SPI_.h>
#include <Tachometer.h>
#include<bits/stdc++.h>
#include <Board_Interface.h>
#include <avr/io.h>
#include <util/delay.h>

#define outputA 6 //DT pin of encoder
#define outputB 7 //CLK pin of encoder

long counter = 0;  //variable to update knob position
int aState;
int aLastState; 

RF24 radio(9,8);               // nRF24L01 (CE,CSN)
RF24Network network(radio);      //including radio in network
const uint16_t this_node = 02;   
const uint16_t master = 00; 

void print_next_line(string);     

void setup() {
  Serial.begin(9600);
  SPI.begin();
  radio.begin();
  network.begin(90, this_node);  //(channel, node address)
  radio.setDataRate(RF24_2MBPS);

  DDRD &= ~0b01000000;
  DDRD &= ~0b10000000;
  aLastState = PIND & (0b01000000); 
}

void loop() {
  network.update();
  aState = PIND & (0b01000000); //current state of Output A

  if(aState != aLastState) { //rotation has happened
    if (PIND & (0b10000000) != aState) { //cw rotation
       counter ++; }
     else {
       counter --; }
   print_next_line(counter);
   RF24NetworkHeader header(master); 
   bool ok = network.write(header, &counter, sizeof(counter)); // Send the data
  }
  aLastState = aState;
}

void print_next_line(string s){
  cout << "\n" << s;
}
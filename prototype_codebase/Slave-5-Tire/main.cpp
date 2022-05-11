/*Pressure Sensor Pinout: Analog Pin-A0, Vin-5 V, GND-gnd */

#include <RF24Network.h>
#include <RF24.h>
#include <SPI_.h>
#include<bits/stdc++.h>
#include <Board_Interface.h>
#include <avr/io.h>
#include <util/delay.h>

#define pressure_pin A0
long pressure;

//sleep parameters
int rounds = 225; // sleep for 30 min (8 seconds per round)
int buffer_time = 1000; // delay before and after sleep (for error free operation)


RF24 radio(9,8);               // nRF24L01 (CE,CSN)
RF24Network network(radio);      
const uint16_t this_node = 05;   
const uint16_t master = 00;    

void print_next_line(string);  

void setup() {
  Serial.begin(9600);
  SPI.begin();
  radio.begin();
  network.begin(90, this_node);  //(channel, node address)
  radio.setDataRate(RF24_2MBPS);

  DDRC &= ~0b00000001;  // pressure pin as input 

  // Configure ADC to be left justified, use AVCC as reference, and select ADC0 as ADC input
  ADMUX = 0b01100000;

  // Enable the ADC and set the prescaler to max value (128)
  ADCSRA = 0b10000111;
}

void loop() {
    // Start an ADC conversion by setting ADSC bit (bit 6)
    ADCSRA = ADCSRA | (1 << ADSC);
    while(ADCSRA & (1 << ADSC));
    pressure = ADCH;
    print_next_line(pressure);

    network.update();
    RF24NetworkHeader header(master); 
    bool ok = network.write(header, &pressure, sizeof(pressure)); // Send the data

    print_next_line(", Going to Sleep");
    _delay_ms(buffer_time);
    for(int i=1; i<=rounds; i++){
        LowPower.idle(SLEEP_8S, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_OFF,SPI_OFF, USART0_OFF, TWI_OFF); }
    _delay_ms(buffer_time);
    print_("Woke up!, ");
}

void print_next_line(string s){
  cout << "\n" << s;
}
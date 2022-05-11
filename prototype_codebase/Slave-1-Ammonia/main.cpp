/* US Sensor: (VCC,echo,trig,gnd) - (5,6,7,gnd)
 *  MQ-135: (VCC,Dout,Aout,gnd)- (3,4,A0,gnd)
 * NRF Module: (CSN,CE,Vin,MOSI,MISO,SCK,gnd) - (8,9,10,11,12,13,gnd)
 * If level converter not used, connect Vin of NRF to 3.3 V
*/

#include <RF24Network.h>
#include <RF24.h>
#include <SPI_.h>
#include <LowPower.h>
#include<bits/stdc++.h>
#include <Board_Interface.h>
#include <avr/io.h>
#include <util/delay.h>

//MQ-135 pinout
#define nh3_power 3 
#define button 4 
#define ammonia_pin A0 

//MQ-135 Parameters
int ammonia_val; 
int ammonia_val_th = 500; //threshold
unsigned long buttonState;

//US Sensor pinout
#define us_power 5
#define echopin 6 
#define trigpin 7 

//US module parameters
long duration;
float level; 
long level_av[3];
long level_th = 20; //threshold in cm

RF24 radio(9,8);               // (CE,CSN)
RF24Network network(radio);      // Include the radio in the network
const uint16_t this_node = 01;  
const uint16_t master = 00;     

//sleep parameters
int rounds = 2700; // sleep for 6 hours (8 seconds per round)
int buffer_time = 1000; // delay before and after sleep (for error free operation)

void print_(string);
void print_next_line(string);

//US Module Calculation Function
void level_measure() {
  PORTD &= ~ 0B10000000;
  _delay_ms(5);
  PORTD |= 0B10000000;
  _delay_ms(15);
  PORTD &= ~ 0B10000000;
  DDRD &= ~ 0B01000000;
  duration = pulseIn(echopin, HIGH);
  level = duration / 36; //obtain level in cm
}

void setup() {
  SPI.begin();
  radio.begin();
  Serial.begin(9600);
  
  //US Module Pinout initialisation
  DDRD |= 0b00100000;  //us power as output
  PORTD |= 0b00100000; // us power high
  DDRD |= 0b10000000;  //trig pin as output
  PORTD &= ~0b10000000;// trig pin as LOW
  DDRD &= ~0b01000000;  //echo pin as input

  //MQ-135 Pinout initialisation
  DDRD |= 0b00001000;   //nh3 power as output
  PORTD |= 0b00100000; // us power high
  DDRD &= ~0b00010000;   // utton as input
  DDRC &= ~0b00000001;  // ammonia pin as input 

  // Configure ADC to be left justified, use AVCC as reference, and select ADC0 as ADC input
  ADMUX = 0b01100000;

  // Enable the ADC and set the prescaler to max value (128)
  ADCSRA = 0b10000111;

  network.begin(90, this_node);  //(channel, node address)
  radio.setDataRate(RF24_2MBPS); //data rate set to 2 MBPS
  print_("Started, ");
}

void loop() {
  network.update();

  for(int i=0; i<=2; i++){ //liquid level calculation (averaging 3 consecutive values to minimise error)
    level_measure();
    level_av[i]=level;
    delay(10);}
  level = (level_av[0]+level_av[1]+level_av[2])/3;
  print_("level= "); 
  print_(level);

  // Start an ADC conversion by setting ADSC bit (bit 6)
    ADCSRA = ADCSRA | (1 << ADSC);
    
    // Wait until the ADSC bit has been cleared
    while(ADCSRA & (1 << ADSC));
    ammonia_val = ADCH;
  buttonState = PIND & (0b00010000);  //digitalRead(button); //if in safe zone, pin stays 3.3V
  print_(", NH3_val= "); 
  print_(ammonia_val); 
  print_(", NH3_status= "); 
  print_(buttonState);
  
  if(level>level_th || ammonia_val>ammonia_val_th || buttonState == 0) { //this means DEF tank is in bad condition
    print_(", Bad Condition");
    unsigned long flag = 10;
    RF24NetworkHeader header(master);
    bool ok = network.write(header, &flag, sizeof(flag)); Serial.print(", Level Data Sent");
  }

  print_next_line(", Going to Sleep");
  PORTD &= ~0b00100000;   //us power low 
  PORTD &= ~0b00001000;   //nh3 power as low//switching off the modules
  _delay_ms(buffer_time);
  for(int i=1; i<=rounds; i++){
      LowPower.idle(SLEEP_8S, ADC_OFF, TIMER2_OFF, TIMER1_OFF, TIMER0_OFF,SPI_OFF, USART0_OFF, TWI_OFF); }
  _delay_ms(buffer_time);
  PORTD |= 0b00001000;   //nh3 power as high
  PORTD |= 0b00100000;//switching on the modules
  print_("Woke up!, ");
}

void print_(string s){
  cout << s;
}

void print_next_line(string s){
  cout << "\n" << s;
}
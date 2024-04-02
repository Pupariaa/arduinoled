#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 32
#define OLED_RESET     -1 
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

int xCursor = 0;
int yCursor = 0;
int TextSize = 1;

void setup() {
  Serial.begin(9600);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("OLED screen initialization failed"));
    for(;;);
  }
  display.display();
  delay(2000);
  display.clearDisplay();
}

void loop() {
  if (Serial.available() > 0) {
    String message = Serial.readStringUntil('\n'); 
    display.clearDisplay();
    display.setTextSize(TextSize); 
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(xCursor, yCursor);
    display.println(message);
    display.display();
  }
}
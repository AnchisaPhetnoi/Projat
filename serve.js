#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ตั้งค่าการเชื่อมต่อ Wi-Fi
const char* ssid = "anc";        // เปลี่ยนเป็น SSID ของคุณ
const char* password = "123456789"; // เปลี่ยนเป็น Password ของคุณ

// ตั้งค่าการเชื่อมต่อ MQTT
const char* mqtt_server = "broker.netpie.io";
const int mqtt_port = 1883;
const char* mqtt_Client = "58e64cea-7d7a-495b-acdf-2746cd7b9979"; // เปลี่ยนเป็น Client ID ของคุณ
const char* mqtt_username = "wQ5YYdu43DuYHTpKdovbaPbUh22sVfaF"; // เปลี่ยนเป็น Username ของคุณ
const char* mqtt_password = "Z2hsSfAYfCVVe3aCj5zjUh3n5ztY3BxF"; // เปลี่ยนเป็น Password ของคุณ

#define ONE_WIRE_BUS 2  // ขาที่เชื่อมต่อกับเซนเซอร์ DS18B20
#define RELAY_PIN 12     // ขาที่เชื่อมต่อกับรีเลย์

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(mqtt_Client, mqtt_username, mqtt_password)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(9600);
  sensors.begin();
  pinMode(RELAY_PIN, OUTPUT);  // ตั้งค่าขารีเลย์เป็น OUTPUT
  
  setup_wifi();  // เริ่มการเชื่อมต่อ Wi-Fi
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }

  sensors.requestTemperatures(); // ขออุณหภูมิ
  float temperature = sensors.getTempCByIndex(0); // อ่านอุณหภูมิ
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");

  // กำหนดเงื่อนไขสำหรับเปิด/ปิดปั๊ม
  if (temperature > 30.0) { // เปลี่ยนค่า 30.0 ตามที่ต้องการ
    digitalWrite(RELAY_PIN, HIGH); // เปิดปั๊ม
    Serial.println("Pump is ON");
  } else {
    digitalWrite(RELAY_PIN, LOW); // ปิดปั๊ม
    Serial.println("Pump is OFF");
  }

  // ส่งข้อมูลไปยัง MQTT Broker
  String payload = "{\"temperature\": " + String(temperature) + "}";
  client.publish("sensor/temperature", payload.c_str());

  client.loop();
  delay(5000); // หยุดทำงานเป็นเวลา 5 วินาที
}

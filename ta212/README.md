# TA212: Bluetooth-Controlled Rover 

## Overview
This folder contains the control logic for the rover assembly (Box_Assembly). The rover is powered by an ESP32 microcontroller and controlled remotely using a smartphone via Bluetooth. The system interfaces with a dual DC motor setup, utilizing PWM (Pulse Width Modulation) for precise speed and directional control based on joystick inputs.

## ESP32 Source Code
(Please refer to the .cpp file or previous code block for the full source code)

## Code Explanation
This code transforms an ESP32 into a Bluetooth-controlled motor driver using the **Dabble** application ecosystem. It maps the physical push of a virtual joystick into a raw speed integer and converts that into hardware PWM signals to drive an H-Bridge motor controller.

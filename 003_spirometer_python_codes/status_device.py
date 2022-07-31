import serial
import sys
from time import sleep
import time
import serial.tools.list_ports
import threading 

class autoPair:
    def serial_ports(self):
        if sys.platform.startswith('win'):
            ports = ['COM%s' % (i + 1) for i in range(256)]
        elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
            # this excludes your current terminal "/dev/tty"
            ports = glob.glob('/dev/tty[A-Za-z]*')
        elif sys.platform.startswith('darwin'):
            ports = glob.glob('/dev/tty.*')
        else:
            raise EnvironmentError('Unsupported platform')
    
        result = []
        for port in ports:
            try:
                s = serial.Serial(port)
                s.close()
                result.append(port)
            except (OSError, serial.SerialException):
                pass
        return result

    def deviceCallback(self):
        #global device_status, deviceAt
        while True:
            #print(self.ser)
            print(self.device_status)
            comlist = serial.tools.list_ports.comports()
            connected = []
            for element in comlist:
                connected.append(element.device)
            #print("Connected COM ports: " + str(connected))
            #print("Device paired: " + str(self.device_status) + ", Name: "+str(self.deviceAt))
            #print(self.deviceAt in connected)
            if self.previousUSB is not len(connected):
                print('USB device change detected')
            deviceCheck = self.deviceAt in connected
            if deviceCheck is False:
                self.deviceAt = 'None'
                self.device_status = False
                ## TODO error here in autopair i commented out the below line
                #self.ser = None
                #print("ran")
            if self.previousUSB is not len(connected) and self.device_status is False:
                print('Connecting device')
                self.pairDevice()
            self.previousUSB = len(connected)
            
            sleep(0.5)
    
    def pairDevice(self):
        print('Pairing device')
        device_list = self.serial_ports()
        if len(device_list) > 0:
            for x in device_list:
                print('.')
                self.ser = serial.Serial(x, baudrate=115200, timeout=2, writeTimeout=2)
                print(self.ser)
                sleep(3)
                try:
                    self.ser.write(b'3')
                except Exception as e :
                    print(str(e))
                    continue
                print("bit testing")
                if self.ser.read() == b'3':
                    #global device_status, deviceAt
                    self.device_status = True
                    self.deviceAt = x
                    print('Device Paired at '+x)
                    self.ser.write(b'2')
                    if  self.ser.read() == b'2':
                        
                        print("Device Reading")
                        
                            
        
                    break
                else:
                    print('Incorrect device')
                    
        else:
            self.deviceAt = 'None'
    def __init__(self):
        self.device_list = self.serial_ports()
        print(self.device_list)
        self.numberOfUSBConnected = len(self.device_list)
        print(self.numberOfUSBConnected)
        self.device_status = False
        self.deviceAt = 'None'
        self.changeUSB = True
        self.previousUSB = 0
        self.ser = None
        self.pairDevice()
        #self.deviceCallback()
        self.t1 = threading.Thread(target=self.deviceCallback, name='t1')
        self.t1.start()
        
        pass
    
    def sendData(self, data):
        print(self.ser)
        #self.ser.write(data)
    
if __name__ == "__main__": 
    handler = autoPair()
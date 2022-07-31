import serial
import sys
from time import sleep
import time
import serial.tools.list_ports

def status():

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
    device_list = result
    
    if len(device_list) > 0:
        for x in device_list:
            #print('.')
            ser = serial.Serial(x, baudrate=115200, timeout=2, writeTimeout=2)
            #print(ser)
            sleep(3)
            try:
                ser.write(b'3')
            except Exception as e :
                print(str(e))
                continue
            print("bit testing")
            if ser.read() == b'3':
                #global device_status, deviceA
                return ((x))
                ser.write(b'2')
                if  ser.read() == b'2':
                    return ("Device Reading")
                break
            else:
                return ('Incorrect device')
    else :
        return("No device found")
    
if __name__ == "__main__": 
    print(status())
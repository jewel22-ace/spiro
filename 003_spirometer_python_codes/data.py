import serial
import time
from matplotlib import pyplot as plt
ser=serial.Serial('COM9',115200)
data_lst=[]
while  ser.isOpen() :

    if (float(ser.readline().strip()) > 15.0 ) :
        t_d_end = time.time() + 2
        while time.time() < t_d_end :
            x=float(ser.readline().strip())
            data_lst.append(x)
        ser.close()
        break
            
    else :
        print("-- Blow into device --")
     
print(len(data_lst))
print(data_lst)

plt.ylim(-7, 1000)
plt.plot(data_lst)
plt.show()

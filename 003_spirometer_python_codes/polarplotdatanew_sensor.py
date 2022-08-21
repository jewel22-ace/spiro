import serial
import time
from matplotlib import pyplot as plt
ser=serial.Serial('COM7',115200)
data_lst=[]
while  ser.isOpen() :

    if (float(ser.readline().strip()) > 15.0 ) :
        t_d_end = time.time() + 5
        while time.time() < t_d_end :
            x=float(ser.readline().strip())
            data_lst.append(x)
        ser.close()
        break
            
    else :
        print("-- Blow into device --")
     
print(len(data_lst))
print(data_lst)

fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})
ax.plot(data_lst)
ax.grid(True)

ax.set_title("A line plot on a polar axis", va='bottom')
plt.show()
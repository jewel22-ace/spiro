# -*- coding: utf-8 -*-
"""
Created on Fri Aug 19 17:53:05 2022

@author: KIIT
"""
# -*- coding: utf-8 -*-
"""
Created on Fri Aug 19 16:54:45 2022

@author: KIIT / Mosaif Ali
"""
import serial
import time
from matplotlib import pyplot as plt
import math
import numpy as np
ser=serial.Serial('COM7',115200)
data_lst=[]
while  ser.isOpen() :

    if (float(ser.readline().strip()) > 15.0 ) :
        t_d_end = time.time() + 10
        while time.time() < t_d_end :
            x=float(ser.readline().strip())
            data_lst.append(x)
        ser.reset_input_buffer()
        ser.close()
        break
            
    else :
        print("-- Blow into device --")
     
print(len(data_lst))
print(data_lst)
theta_360=[]
for i in range (0,len(data_lst)):
    x=math.radians(i)
    theta_360.append(x)
colors=[]
area=[]
#offset=np.arange(0,len(data_lst))
#=[]
#for k in range(0,len(data_lst)):
#    final_lst.append(data_lst[k]+offset[k])
#    print(final_lst)
    
for r in data_lst:
    if r > 0 and r <= 30 :
        colors.append('green')
    elif r > 30 and r <= 60 :
        colors.append('yellow')
    elif r > 60 and r <= 90 :
        colors.append('orange')
    elif r > 90 :
        colors.append('red')
    elif r <= 0 and r > -30 :
        colors.append('blue')
    elif r <= -30 and r > -60 :
        colors.append('indigo')
    elif r <= -60 and r > -90 :
        colors.append('aqua')
    elif r <=-90 :
        colors.append('coral')
    
    if r > 0 :
        a=5*r
        area.append(a)
    elif r < 0 :
        a=-5*r
        area.append(a)
    else:
        area.append(5)


fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})
ax.scatter(theta_360,data_lst,c=colors,s=area)
ax.grid(True)

ax.set_title("A line plot on a polar axis", va='bottom')
plt.show()
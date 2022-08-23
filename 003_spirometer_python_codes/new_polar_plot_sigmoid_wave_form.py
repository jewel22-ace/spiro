# -*- coding: utf-8 -*-
"""
Created on Mon Aug 22 17:22:56 2022

@author: KIIT
"""
import serial
import time
from matplotlib import pyplot as plt
import math
import numpy as np


ser=serial.Serial('COM7',115200)
data_lst=[]
while  ser.isOpen() :

        t_d_end = time.time() + 5
        while time.time() < t_d_end :
            x=float(ser.readline().strip())
            data_lst.append(x)
        ser.close()
        break
            
new_data=[]
for k in data_lst:
    if k != 0 :
        new_data.append(k)
c=0
waveform=[]
for i in range(0,len(new_data)):
    
    if c != 10 and c <10 :
        if new_data[i+1] > new_data[i] :
            c=c+1
        else :
            c=0
    elif c==10 :
        increasing_index=i-10
    
        
    
    
    
plt.plot(new_data)
plt.show()
print(len(data_lst))
print(data_lst)
print(len(new_data))
print(new_data)
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
import pandas as pd
ser=serial.Serial('COM7',115200)
data_lst=[]
while  ser.isOpen() :

    if (float(ser.readline().strip()) > 15.0 ) :
        t_d_end = time.time() + 10
        while time.time() < t_d_end :
            x=float(ser.readline().strip())
            data_lst.append(x)
        ser.close()
        break
            
    else :
        print("-- Blow into device --")
     
print(len(data_lst))
print(data_lst)
theta_360=[]
for i in range (len(data_lst)):
    x=math.radians(i)
    theta_360.append(x)
    
offset=np.arange(0,len(data_lst))
final_lst=[]
for k in range(0,len(data_lst)):
    final_lst.append(data_lst[k]+offset[k])
    print(final_lst)

dic={"Spiro_Data":data_lst}
df=pd.DataFrame(dic)
df.to_csv('Spiro_data.csv')


fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})
ax.plot(theta_360,final_lst)
ax.grid(True)

ax.set_title("Spiro Meter Readings", va='bottom')
plt.show()
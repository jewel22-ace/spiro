# -*- coding: utf-8 -*-
"""
Created on Mon Aug 22 21:59:20 2022

@author: KIIT
"""
import pandas as pd
import math
import numpy as np
from matplotlib import pyplot as plt
data_raw = pd.read_csv("Spiro_data.csv")
data=data_raw['Spiro_Data'].tolist()
#plt.plot(data)
window_size = 5
  
i = 0
moving_averages = []
  

while i < len(data) - window_size + 1:
    
    
    window = data[i : i + window_size]
    window_average = round(sum(window) / window_size, 2)
    moving_averages.append(window_average)
    i += 1
  
#plt.plot(moving_averages)
#print(moving_averages)
c=0
for i in range(0,len(moving_averages)):
    if c == 10 :
        increasing_index=i-10
        break
    else:
        if moving_averages[i+1] > moving_averages[i] :
            c=c+1
        elif moving_averages[i+1] < moving_averages[i] :
            c=0
        else:
            c=c+1

for r in range(increasing_index,len(moving_averages)) :
    if moving_averages[r] < 0 :
        decreasing_index=r-1
        break
    
for k in range(decreasing_index,len(moving_averages)) :
    if moving_averages[k+1] > 0 :
        first_wave_end_point = k-1
        break
    
first_wavelet=moving_averages[increasing_index:first_wave_end_point]
print(first_wavelet)
theta_360=[]
for i in range (len(first_wavelet)):
    x=math.radians(i)
    theta_360.append(x)

fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})
ax.plot(theta_360,first_wavelet)
ax.grid(True)

ax.set_title("Spiro Meter Readings", va='bottom')
plt.show()

         
    
    
    
    
    
    
    
    
    

    
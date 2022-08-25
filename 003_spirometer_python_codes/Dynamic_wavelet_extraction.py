# -*- coding: utf-8 -*-
"""
Created on Tue Aug 23 16:12:41 2022

@author: KIIT
"""

import pandas as pd
import math
import scipy.signal
import numpy as np
from matplotlib import pyplot as plt

data_raw = pd.read_csv("spiro_data.csv")
data=data_raw['Data'].tolist()

window_size = 10  
i = 0
moving_averages = []


while i < len(data) - window_size + 1:
    
    window = data[i : i + window_size]
    window_average = round(sum(window) / window_size, 2)
    moving_averages.append(window_average)
    i += 1

x_0=[]
for i in range(0,len(data)):
    x_0.append(0)
    
b, a = scipy.signal.butter(3, 0.1)
filtered_data = scipy.signal.filtfilt(b, a, moving_averages)
filtered_data=filtered_data.tolist()





def extract_first_inflection(filtered_data):
    wavelet_counter=0
    for d in range(0,len(filtered_data)) :
        if filtered_data[d] > 0 :
            if wavelet_counter==15:
                inflection_1 = d-15
                return inflection_1
            else:
                if filtered_data[d+1] > filtered_data[d] :
                    wavelet_counter=wavelet_counter+1
                elif filtered_data[d+1] < filtered_data[d] :
                    wavelet_counter=0
                else:
                    wavelet_counter=wavelet_counter+1
        else :
            pass
        
def extract_wavelet(lst):
    wavelet_checker=0
    firsthalf_end='breaker'
    end_lst=[]
    for i in range(0,len(lst)) :
        if lst[i] < 0 :
            firsthalf_end=i
            wavelet_checker=wavelet_checker+1
            break
    if firsthalf_end == 'breaker' :
        pass
    else : 
        for m in range(firsthalf_end,len(lst)):
            if lst[m] > 0 :
                secondhalf_end=m
                wavelet_checker=wavelet_checker+1
                break

    
    if wavelet_checker == 2 :
        return lst[:secondhalf_end]
    else:
        return end_lst


print(extract_first_inflection(filtered_data))
first_inflection_point=(extract_first_inflection(filtered_data))
real_data=filtered_data[first_inflection_point:]
x_0=[]
for i in range(0,len(real_data)):
    x_0.append(0)

plt.figure(100)
plt.plot(real_data)
plt.plot(x_0)
i=2

while len(extract_wavelet(real_data)) != 0 :
    wavelet=extract_wavelet(real_data)
    end_point=len(wavelet)
    real_data=real_data[end_point:]
    plt.figure(i*100)
    plt.plot(wavelet)
    plt.plot(x_0)
    plt.show()
    i=i+1






    








            
            
            

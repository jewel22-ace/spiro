# -*- coding: utf-8 -*-
"""
Created on Tue Aug 23 15:55:50 2022

@author: KIIT
"""
import pandas as pd
import math
import scipy.signal
import numpy as np
from matplotlib import pyplot as plt
data_raw = pd.read_csv("Spiro_data_1.csv")
data=data_raw['Spiro_Data'].tolist()
window_size = 10
  
i = 0
moving_averages = []
sampleRate=1
times = np.arange(len(data))/sampleRate

while i < len(data) - window_size + 1:
    
    window = data[i : i + window_size]
    window_average = round(sum(window) / window_size, 2)
    moving_averages.append(window_average)
    i += 1

x_0=[]
for i in range(0,len(data)):
    x_0.append(0)
    
b, a = scipy.signal.butter(3, 0.1)
filtered = scipy.signal.filtfilt(b, a, moving_averages)
plt.subplot(211)
plt.plot(data)
plt.subplot(212)
plt.plot(filtered)
plt.show()
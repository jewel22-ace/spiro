# -*- coding: utf-8 -*-
"""
Created on Wed Aug 24 17:28:51 2022

@author: KIIT
"""
from Spiro_package import Spiro
from matplotlib import pyplot as plt

Spiro=Spiro()

x=Spiro.read_data('spiro_data.csv')
filtered_data=Spiro.filter_data(x)
x_0=[]
for i in range(0,len(x)):
    x_0.append(0)
est=[1,2]
print(len(est))
w=Spiro.extract_wavelet(x)

print(len(w))

plt.figure(100)
plt.plot(w[0])
plt.plot(x_0)
plt.show()

plt.figure(200)
plt.plot(w[1])
plt.plot(x_0)
plt.show()

plt.figure(300)
plt.plot(w[2])
plt.plot(x_0)
plt.show()

plt.figure(400)
plt.plot(w[3])
plt.plot(x_0)
plt.show()

plt.figure(500)
plt.plot(w[4])
plt.plot(x_0)
plt.show()


plt.figure(700)
plt.plot(filtered_data)
plt.plot(x_0)
plt.show()


# -*- coding: utf-8 -*-
"""
Created on Sat Aug 20 12:52:50 2022

@author: KIIT / Mosaif Ali

Desc : Realtime polar plot for spirometer data

"""


import serial
import time
from matplotlib import pyplot as plt
import matplotlib.animation as animation
import math
from queue import Queue
from threading import Thread
import numpy as np

#while  ser.isOpen() :
#    if (float(ser.readline().strip()) > 15.0 ) :
#        t_d_end = time.time() + 2
#        while time.time() < t_d_end :
#            x=float(ser.readline().strip())
#            data_lst.append(x)
#        ser.close()
#        break
#            
#    else :
#        print("-- Blow into device --")
     
#print(len(data_lst))
#print(data_lst)
#theta_360=[]
#for i in range (len(data_lst)):
#    x=math.radians(i)
#    theta_360.append(x)
    
#offset=np.arange(0,len(data_lst))
#final_lst=[]
#for k in range(0,len(data_lst)):
#    final_lst.append(data_lst[k]+offset[k])
#    print(final_lst)

#fig, ax = plt.subplots(subplot_kw={'projection': 'polar'})
#ax.plot(theta_360,final_lst)
#ax.grid(True)
#ax.set_title("Spiro Meter Readings", va='bottom')
def get_data(out_q):
    ser=serial.Serial('COM7',115200)
    t_d_end = time.time() + 10
    while time.time() < t_d_end :
        r = float(ser.readline().strip())
        out_q.put(r)
        
def priting(in_q):
    t_d_end = time.time() + 3
    while time.time() < t_d_end :
        d = in_q.get()
        data.append(d)
        print(d)
        plt.plot(data)
        
    
    
if __name__ == "__main__" :
    q = Queue()
    data=[]
    t1=Thread(target=get_data,args=(q,))
    t1.start()
    t_d_end = time.time() + 10
    while time.time() < t_d_end :
        d=q.get()
        data.append(d)
        plt.plot(data)
    #t2=Thread(target=priting,args=(q,))
    
    #t2.start()
    
    
    

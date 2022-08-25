# -*- coding: utf-8 -*-
"""
Created on Wed Aug 24 16:27:45 2022

@author: KIIT / Mosaif Ali

Library for Project Spiro

"""

import serial
import time
import pandas as pd
import scipy.signal

        
class Spiro :
    
    """
    
    Class spiro .
    Functions for spiro operations .
    
    """
    
    def __init__(self):
        
        """
        
        Empty Default Constructor
        
        """
        
        pass
    
    def get_data(self,com_port):
        
        """
        
        get_data()
        
        =>function to get data from sensor .
        
        :param com_port: Com Port in which the device is connected .
        :type string: str
        
        :param t: Time window for data to be recorded .
        :type string: int
         
        :return: List containing all data points
        :rtype: [] 
        
        """
        
        ser=serial.Serial(com_port,115200)
        data_lst=[]
        try :
            while  ser.isOpen() :
                try :
                    t_d_end = time.time() + 20
                    print('Reading Data...')
                    while time.time() < t_d_end :
                        x=float(ser.readline().strip())
                        data_lst.append(x)
                    ser.close()
                    return data_lst
                except Exception as e :
                    if ser.isOpen():
                        ser.close()
                    print(str(e))
        except Exception as e :
            if ser.isOpen():
                ser.close()
            print(str(e))
        
    
    def save_data(self,data_lst,file_name):
        
        """
        
        save_data()
        
        =>function to save data in .csv format
        
        :param data_lst: List containing all the data points .
        :type string: []
        
        :param data_lst: List containing all the data points .
        :type string: []
         
        :return: .csv file containing all the data points .
        :rtype: .csv
        
        """
        
        try :
            dic={"Data":data_lst}
            df=pd.DataFrame(dic)
            df.to_csv(file_name+'.csv')
            print('File saved as',file_name+'.csv')
        except Exception as e :
            print(str(e))
            
            
            
    def read_data(self,data_file):
        
        """
        
        sample_rate()
        
        =>function to read data file .
        
        :param data_file: List or String of the data file .
        :type string: str
        
         
        :return: List of Data Points .
        :rtype: []
        
        """
        
        data = pd.read_csv(data_file)
        data=data['Data'].tolist()
        return data
        
    
    def sample_rate(self,data_file):
        
        """
        
        sample_rate()
        
        =>function to find sampling rate of data file or list .
        
        :param data_file: List or String of the data file .
        :type string: [],str
        
         
        :return: Sampling rate .
        :rtype: int
        
        """
        
        try :
            if (data_file[-4:] == '.csv'):
                data = pd.read_csv(data_file)
                data=data['Data'].tolist()
                sampling_rate=len(data) / 15
                return sampling_rate
            else :
                sampling_rate=len(data_file) / 15
                return sampling_rate
        except Exception as e :
            print(str(e))
            
            
            
    def filter_data(self,data_lst):
        
        """
        
        filter_data()
        
        =>function to filter data by butter and moving average .
        
        :param data_file: List  of the data  .
        :type string: [],str
        
         
        :return: filtered data .
        :rtype: []
        
        """
        
        try:
            
            i = 0
            moving_averages = []
            window_size = 10
    
            while i < len(data_lst) - window_size + 1:
                
                window = data_lst[i : i + window_size]
                window_average = round(sum(window) / window_size, 2)
                moving_averages.append(window_average)
                i += 1
            
            b, a = scipy.signal.butter(3, 0.1)
            filtered_data = scipy.signal.filtfilt(b, a, moving_averages)
            filtered_data=filtered_data.tolist()
        
            return filtered_data
        
        except Exception as e :
            print(str(e))

            
        
    def extract_wavelet(self,data_file):
        
        """
        
        extract_wavelet()
        
        =>function to extract wavelet from the datafile .
        
        :param data_file: List or String of the data file .
        :type string: [] , str .
        
         
        :return: wavelets .
        :rtype: []
        
        """
        
        
        data=data_file
        window_size = 10  
        i = 0
        moving_averages = []
        
        while i < len(data) - window_size + 1:
            
            window = data[i : i + window_size]
            window_average = round(sum(window) / window_size, 2)
            moving_averages.append(window_average)
            i += 1
        
        b, a = scipy.signal.butter(3, 0.1)
        filtered_data = scipy.signal.filtfilt(b, a, moving_averages)
        filtered_data=filtered_data.tolist()
        
        wavelet_counter=0
        for d in range(0,len(filtered_data)) :
            if filtered_data[d] > 0 :
                if wavelet_counter==20:
                    first_inflection_point = d-15
                    break
                else:
                    if filtered_data[d+1] > filtered_data[d] :
                        wavelet_counter=wavelet_counter+1
                    elif filtered_data[d+1] < filtered_data[d] :
                        wavelet_counter=0
                    else:
                        wavelet_counter=wavelet_counter+1
            else :
                pass
        
        real_data=filtered_data[first_inflection_point:]
        
        extracted_wavelets=[]
        
        while len(real_data) != 0 :
            wavelet_checker=0
            firsthalf_end='breaker'
            end_lst=[]
            for i in range(0,len(real_data)) :
                if real_data[i] < 0 :
                    firsthalf_end=i
                    wavelet_checker=wavelet_checker+1
                    break
            if firsthalf_end == 'breaker' :
                pass
            else : 
                for m in range(firsthalf_end,len(real_data)):
                    if real_data[m] > 0 :
                        secondhalf_end=m
                        wavelet_checker=wavelet_checker+1
                        break
        
            
            if wavelet_checker == 2 :
                extracted_wavelets.append(real_data[:secondhalf_end]) 
            else:
                real_data=end_lst
            
            end_point=len(real_data[:secondhalf_end])
            real_data=real_data[end_point:]
            
        return extracted_wavelets
    
    
    
        
        
            
            
    
    
    
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
       
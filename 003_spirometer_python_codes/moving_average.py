import serial
import time
from matplotlib import pyplot as plt
ser=serial.Serial('COM9',115200)
window_size = 50
i = 0
data_lst=[]
moving_averages = []
def Average(lst):
    return sum(lst) / len(lst)
def chunkIt(seq, num):
    avg = len(seq) / float(num)
    out = []
    last = 0.0

    while last < len(seq):
        out.append(seq[int(last):int(last + avg)])
        last += avg

    return out
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
     

print(data_lst)
print()
while i < len(data_lst) - window_size + 1:
    
    # Store elements from i to i+window_size
    # in list to get the current window
    window = data_lst[i : i + window_size]
  
    # Calculate the average of current window
    window_average = round(sum(window) / window_size, 2)
      
    # Store the average of current
    # window in moving average list
    moving_averages.append(window_average)
      
    # Shift window to right by one position
    i += 1
    
print(moving_averages)


plt.plot(data_lst)
plt.plot(moving_averages)
plt.show()



import serial
import time
from matplotlib import pyplot as plt
ser=serial.Serial('COM9',115200)

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

# middle_index=round((len(data_lst))/2)
# print(Average(data_lst[:middle_index]))
# print(Average(data_lst[middle_index:]))


print(Average(chunkIt(data_lst, 5)[0]))
print()
print(Average(chunkIt(data_lst, 5)[1]))
print()
print(Average(chunkIt(data_lst, 5)[2]))
print()
print(Average(chunkIt(data_lst, 5)[3]))
print()
print(Average(chunkIt(data_lst, 5)[4]))



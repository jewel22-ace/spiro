import serial
import time
ser=serial.Serial('COM7',115200)

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
def vol(p_diff):
    num=((3.14159)*(0.0092**4)*(p_diff))
    deno=(8*1.145*0.0035)
    volume=(num/deno)*1000
    return "{:.8f}".format(float(volume))
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
     
print("Data List")
print(data_lst)
print("Average Pressure Diff in 1st sec")
print(Average(chunkIt(data_lst, 5)[0]))
print("Average Pressure Diff in 2nd sec")
print(Average(chunkIt(data_lst, 5)[1]))
print("Average Pressure Diff in 3rd sec")
print(Average(chunkIt(data_lst, 5)[2]))
print("Average Pressure Diff in 4th sec")
print(Average(chunkIt(data_lst, 5)[3]))
print("Average Pressure Diff in 5th sec")
print(Average(chunkIt(data_lst, 5)[4]))
print()
print("Voume in 1st second or fev1")
fev1=float(vol(Average(chunkIt(data_lst, 5)[0])))
print(fev1)
print("Voume in 2nd second")
fev2=float(vol(Average(chunkIt(data_lst, 5)[1])))
print(fev2)
print("Voume in 3rd second")
fev3=float(vol(Average(chunkIt(data_lst, 5)[2])))
print(fev3)
print("Voume in 4th second")
fev4=float(vol(Average(chunkIt(data_lst, 5)[3])))
print(fev4)
print("Voume in 5th second")
fev5=float(vol(Average(chunkIt(data_lst, 5)[4])))
print(fev5)
print()
fvc=float(fev1+fev2+fev3+fev4+fev5)
ratio=float(fev1/fvc)
print("Ratio : ")
print(ratio)




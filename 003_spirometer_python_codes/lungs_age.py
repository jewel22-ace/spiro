def get_data(x):

    try :
        data_lst=[]
        import serial
        import time 
        ser=serial.Serial(x,115200,timeout=2, writeTimeout=2)

        time.sleep(3)
        try:
            ser.write(b'3')
        except Exception as e :
            return(str(e))
        #print("bit testing")
        try:
            if ser.read() == b'3':
            #global device_status, deviceA
            #return ('Device Paired at '+x)
                ser.write(b'2')
                if  ser.read() == b'2':
                    while True:
                        if (float(ser.readline().strip()) > 15.0 ) :
                            t_d_end = time.time() + 5
                            while time.time() < t_d_end :
                                x=float(ser.readline().strip())
                                data_lst.append(x)
                            ser.close()
                            break
                    fev1=float(vol(Average(chunkIt(data_lst, 5)[0])))
                    fev2=float(vol(Average(chunkIt(data_lst, 5)[1])))
                    fev3=float(vol(Average(chunkIt(data_lst, 5)[2])))
                    fev4=float(vol(Average(chunkIt(data_lst, 5)[3])))
                    fev5=float(vol(Average(chunkIt(data_lst, 5)[4])))
                    fvc=float(fev1+fev2+fev3+fev4+fev5)
                    ratio=float(fev1/fvc)
                    return ratio
        
        except Exception as e :
            return(str(e))
        
                
        #else:
        #    ser.close
        #    return ('Incorrect device')     

    except Exception as e :
        return str(e)

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

def lungs_age(ratio,patient_age):
    
    age=(((100-patient_age)/100)*(100-(ratio*100)))+(patient_age)
    return age






if __name__ == "__main__": 
    
    ratio=get_data('COM9')
    patient_age=22
    result=lungs_age(ratio,patient_age)
    print(result)
    
    
    
    
    
    
    
    
    
    
    
    
    

    
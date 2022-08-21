from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import tkinter as tk
import numpy as np
import serial 

#---------global variables------------
data=np.array([])
cond = False 

#-----------plot_data----------
def plot_data():
    global cond,data
    
    if (cond == True) :
        x=ser.readline().strip()
        x.decode()
        print(x)
        if(len(data)<100):
            data =np.append(data,float(x[0:4]))
        else :
            data[0:99] = data[1:100]
            data[99] = float(x[0:4])
        lines.set_xdata(np.arange(0,len(data)))
        lines.set_ydata(data)
        
        canvas.draw()
    root.after(1000,plot_data)
        
def plot_start():
    global cond
    cond=True
    ser.reset_input_buffer()

def plot_stop():
    global cond
    cond=False
    




#-----------Main Gui Code--------------
root=tk.Tk()
root.title('Spiro Meter')
root.configure(background='light blue')
root.geometry("650x700")

#------------Create plot object on GUI----------
# add fig to canvas
fig=Figure();
ax=fig.add_subplot(111)
ax.set_title('Serial Data')
ax.set_xlabel('Time')
ax.set_ylabel('Pressure Diff')
ax.set_xlim(0)
lines = ax.plot([],[])[0]

canvas = FigureCanvasTkAgg(fig,master=root)
canvas.get_tk_widget().place(x=10,y=10,width=600,height=550)
canvas.draw()

#------------Create Button-------------
root.update();
start=tk.Button(root,text="Start",font=('calbiri',12),command=lambda : plot_start())
start.place(x=10,y=570)
stop=tk.Button(root,text="Stop",font=('calbiri',12),command=lambda : plot_stop())
stop.place(x=110,y=570)

#------------start serial-----------
try :
    ser=serial.Serial('COM7',115200)
    ser.reset_input_buffer()
except Exception as e :
    print(str(e))


root.after(1000,plot_data)
root.mainloop()
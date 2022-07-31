from operator import le
from unittest import result
from flask import Flask,jsonify,render_template
import device_status as device_status
import assests as assets
import logging as logger
logger.basicConfig(level="DEBUG")

flaskAppInstance= Flask(__name__)

@flaskAppInstance.route("/")
def hello_world():

    return jsonify('Hello from Api')

@flaskAppInstance.route("/status")
def status():
    
    return jsonify(device_status.status())

@flaskAppInstance.route("/get_data")
def get_data():
    response,port=device_status.status()
    if (port != ""):
        ratio=assets.get_data("COM9")
        return jsonify(result=ratio)
    return response




if __name__ == '__main__':
    logger.debug("Starting the application")
    flaskAppInstance.run(host="0.0.0.0",port=5000,debug=True,use_reloader=True)
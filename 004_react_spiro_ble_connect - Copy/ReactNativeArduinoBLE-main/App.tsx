import React, { useState } from 'react';
import {
  TouchableOpacity,
  Button,
  PermissionsAndroid,
  View,
  Text,
} from 'react-native';
import { stringToBytes } from "convert-string";

import base64 from 'react-native-base64';

import CheckBox from '@react-native-community/checkbox';

import { BleManager, Device, Service } from 'react-native-ble-plx';
import { styles } from './Styles/styles';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

const BLTManager = new BleManager();

const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';

const MESSAGE_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
//const BOX_UUID = 'f27b53ad-c63d-49a0-8c0f-9f297e6cc520';

function StringToBool(input: String) {
  if (input == '1') {
    return true;
  } else {
    return false;
  }
}

function BoolToString(input: boolean) {
  if (input == true) {
    return '1';
  } else {
    return '0';
  }
}

export default function App() {
  //Is a device connected?
  const [isConnected, setIsConnected] = useState(false);

  //What device is connected?
  const [connectedDevice, setConnectedDevice] = useState<Device>();

  const [message, setMessage] = useState('Nothing Yet');
  const [boxvalue, setBoxValue] = useState(false);

  // Scans availbale BLT Devices and then call connectDevice
  async function scanDevices() {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Permission Localisation Bluetooth',
        message: 'Requirement for Bluetooth',
        buttonNeutral: 'Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    ).then(answere => {
      console.log('scanning');
      // display the Activityindicator

      BLTManager.startDeviceScan(null, null, (error, scannedDevice) => {
        if (error) {
          console.warn(error);
        }

        if (scannedDevice && scannedDevice.name == 'Proflo-U') {
          BLTManager.stopDeviceScan();
          connectDevice(scannedDevice);
        }
      });

      // stop scanning devices after 5 seconds
      setTimeout(() => {
        BLTManager.stopDeviceScan();
      }, 5000);
    });
  }

  // handle the device disconnection (poorly)
  async function disconnectDevice() {
    console.log('Disconnecting start');

    if (connectedDevice != null) {
      const isDeviceConnected = await connectedDevice.isConnected();
      if (isDeviceConnected) {
        BLTManager.cancelTransaction('messagetransaction');
        BLTManager.cancelTransaction('nightmodetransaction');

        BLTManager.cancelDeviceConnection(connectedDevice.id).then(() =>
          console.log('DC completed'),
        );
      }

      const connectionStatus = await connectedDevice.isConnected();
      if (!connectionStatus) {
        setIsConnected(false);
      }
    }
  }

  //Function to send data to ESP32
  async function readdata() {
    console.log('Reading data');
  }

  //Connect the device and start monitoring characteristics
  async setupNotifications(device) {

    device
      .connect()
      .then(device => {
        setConnectedDevice(device);
        setIsConnected(true);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        //  Set what to do when DC is detected
        BLTManager.onDeviceDisconnected(device.id, (error, device) => {
          console.log('Device DC');
          setIsConnected(false);
        });

        //Read inital values
        console.log('Writing');
        //monitor values and tell what to do when receiving an update
        const data = stringToBytes("R");



        device.monitorCharacteristicForService(
          SERVICE_UUID,
          MESSAGE_UUID,
          (error, characteristic) => {
            if (characteristic?.value != null) {
              setMessage(base64.decode(characteristic?.value));
              console.log(
                'Message update received: ',
                base64.decode(characteristic?.value),
              );
            }
          },
        );

        //BoxValue

        console.log('Connection established');
      });
  }

  return (
    <View>
      <View style={{ paddingBottom: 200 }}></View>

      {/* Title */}
      <View style={styles.rowView}>
        <Text style={styles.titleText}>BLE Example</Text>
      </View>

      <View style={{ paddingBottom: 20 }}></View>

      {/* Connect Button */}
      <View style={styles.rowView}>
        <TouchableOpacity style={{ width: 120 }}>
          {!isConnected ? (
            <Button
              title="Connect"
              onPress={() => {
                scanDevices();
              }}
              disabled={false}
            />
          ) : (
            <Button
              title="Disonnect"
              onPress={() => {
                disconnectDevice();
              }}
              disabled={false}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ paddingBottom: 20 }}></View>

      {/* Monitored Value */}

      <View style={styles.rowView}>
        <Text style={styles.baseText}>{message}</Text>
      </View>

      <View style={{ paddingBottom: 20 }}></View>

      {/* Checkbox */}
      <View style={styles.rowView}>
        <Button
          title="Read"
          onPress={() => {
            readdata();
          }}
          disabled={false}
        />
      </View>
    </View>
  );
}

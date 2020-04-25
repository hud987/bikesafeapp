import React from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from "react-native";
import {Button} from 'native-base';
import RNLocation from 'react-native-location';
import AsyncStorage from '@react-native-community/async-storage';

import firebase from '../database/firebaseDb'
import { GeoFirestore } from 'geofirestore';

export default class Biker extends React.Component {
  state = {
    buttonText: "Start Sending Location",
    sendingLocation: false,
    lat: null,
    lng: null,
    speed: 0,
    course: null,
    documentId: null,
    lastSentLat: null,
    lastSentLng: null,
  }
  
  onLocationsReceived = locationList => {
    console.log(locationList)
  };

  componentWillUnmount() {
    if (this.locationSubscription) {
      this.locationSubscription();
    }
  }

  componentDidMount() {
    const removeItemValue = async () => {
      try {
          await AsyncStorage.removeItem('documentId');
          return true;
      }
      catch(exception) {
          return false;
      }
    }
    const getDocumentId = async () => {
      let documentId = '';
      try {
        documentId = await AsyncStorage.getItem('documentId') || null;
        console.log('state document id: ' + this.state.documentId)
        console.log('document id: ' + documentId)
        console.log('doc id in api'+documentId)
        this.setState({documentId: documentId})
      } catch (error) {
        console.log(error.message);
      }
    }
    getDocumentId()
    let geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maxAge: 60*60
    }
    
    RNLocation.configure({
      distanceFilter: 0
    })
    console.log('did mount')
    RNLocation.checkPermission({
      ios: 'whenInUse', // or 'always'
      android: {
        detail: 'coarse' // or 'fine'
      }
    }).then(granted => {
      if (granted) {
        this.startLocationSubscription()
      } else {
        RNLocation.requestPermission({
          ios: "whenInUse",
          android: {
            detail: "coarse"
          }
        }).then(granted => {
            if (granted) {
              this.startLocationSubscription()
            }
          })
        }
    })  
  }

  startLocationSubscription = () => {
    this.locationSubscription = RNLocation.subscribeToLocationUpdates(locations => {
      console.log('location')
      console.log(locations)
      this.setState({
        speed: locations[0].speed,
        course: locations[0].course,
        lat: locations[0].latitude,
        lng: locations[0].longitude
      }, )//this.mergeCoords)
      console.log('doc id in location sub'+this.state.documentId)
      var firebaseRef = firebase.firestore();
      const geofirestore = new GeoFirestore(firebaseRef);
      const geocollection = geofirestore.collection('Locations');
      if (this.state.documentId != null && this.state.sendingLocation == true) {
        console.log('updating data')
        geocollection.doc(this.state.documentId).update({
          'coordinates': new firebase.firestore.GeoPoint(this.state.lat, this.state.lng)
        })
      }
    })
  }

  onSendLocation = () => {
    if (this.state.sendingLocation) {
      this.setState({buttonText: "Start Sending Location"})
    } else {
      this.setState({buttonText: "Stop Sending Location"})

      if (
        this.state.lastSentLat != this.state.lat &&
        this.state.lastSentLng != this.state.lng
      ) {
        var firebaseRef = firebase.firestore();
        const geofirestore = new GeoFirestore(firebaseRef);
        const geocollection = geofirestore.collection('Locations');

        if (this.state.documentId == null) {
          console.log('sending data')
          geocollection.add({
            //speed: 100,
            //heading: 100,
            coordinates: new firebase.firestore.GeoPoint(this.state.lat, this.state.lng)
          }).then((res) => {
            console.log('sent data to '+res.id);
            const saveDocumentId = async () => {
              try {
                await AsyncStorage.setItem('documentId', res.id);
              } catch (error) {
                console.log(error.message);
              }
              console.log('logged document id')
            };
            saveDocumentId()
            this.setState({documentId: res.id});
          })
        } 
        this.setState({
          lastSentLat: this.state.lat,
          lastSentLng: this.state.lng,
        })
      } else {
        console.log("not sending")
      }
    }
    this.setState({sendingLocation: !this.state.sendingLocation})
  }

  render() {
    return(
        <View style={styles.screen}>
          <Button
            full
            success={!this.state.sendingLocation}
            danger={this.state.sendingLocation} 
            style={styles.buttonBackground} 
            onPress={() => this.onSendLocation()}>
            <Text style={styles.buttonText}>{ this.state.buttonText }</Text>
          </Button> 
        </View>
    );
  }
};

const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: 'white',
      justifyContent: "center",
    },
    buttonBackground: {
      marginBottom: 90,
      width: 250,
      height: 100,
      marginHorizontal: '20%',
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 20,
      color: 'white',
    },
});
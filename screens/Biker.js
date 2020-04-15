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
    //getLocations(onLocationsReceived);

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
        console.log('granted')
        this.locationSubscription = RNLocation.subscribeToLocationUpdates(locations => {
          console.log('location')
          console.log(locations)
          this.setState({
            speed: locations[0].speed,
            course: locations[0].course,
            lat: locations[0].latitude,
            lng: locations[0].longitude
          }, )//this.mergeCoords)
        })
      } else {
        RNLocation.requestPermission({
          ios: "whenInUse",
          android: {
            detail: "coarse"
          }
        }).then(granted => {
            if (granted) {
              this.locationSubscription = RNLocation.subscribeToLocationUpdates(locations => {
                console.log('location')
                console.log(locations)
                this.setState({
                  speed: locations[0].speed,
                  course: locations[0].course,
                  lat: locations[0].latitude,
                  lng: locations[0].longitude
                }, )//this.mergeCoords)
                if (this.state.documentId != null && this.state.sendingLocation == true) {
                  console.log('updating data')
                  geocollection.doc(this.state.documentId).update({
                    'coordinates': new firebase.firestore.GeoPoint(this.state.lat, this.state.lng)
                  }).then((res) => {
                    console.log('updated data at '+res.id);
                  })
                }
              })
            }
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
            success={this.state.sendingLocation} 
            style={styles.buttonText} 
            onPress={() => this.onSendLocation()}>
            <Text>{ this.state.buttonText }</Text>
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
    buttonText: {
      marginBottom: 90,
      height: 70,
      marginHorizontal: '20%',
      justifyContent: 'center',
    },
    geoText: {
      textAlign: 'center',
    }
});
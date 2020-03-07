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

//import { addLocation, getLocations } from '../api/LocationsApi'
import firebase from '../database/firebaseDb'

export default class Biker extends React.Component {
  state = {
    transmitting: false,
    lat: null,
    lng: null,
    speed: 0,
    course: null,
    geolocationDisp: null,
  }
  
  onLocationsReceived = locationList => {
    console.log(locationList)
  };

  componentDidMount() {
    //getLocations(onLocationsReceived);

    let geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maxAge: 60*60
    }
    this.setState({ready: false, error: null})
    
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
        RNLocation.getLatestLocation({ timeout: 60000 })
        .then(location => {
          console.log('location')
          console.log(location)
          this.setState({
            speed: location.speed,
            course: location.course,
            lat: location.latitude,
            lng: location.longitude
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
              })
            }
          })
        }
    })  
  }

  onSendLocation = () => {
    console.log('start sending location')
    dbRef = firebase.firestore().collection('Locations');
    dbRef.add({
      lat: this.state.lat,
      lng: this.state.lng,
    }).then((res) => {
      console.log('sent data');
    })
    this.setState({geolocationDisp: 
      <Text style={styles.buttonText} >
        speed: { this.state.speed }{"\n"}
        course: { this.state.course }{"\n"}
        latitude: { this.state.lat }{"\n"}
        longitude: { this.state.lng }{"\n"}
      </Text>
    })
    /*addLocation({
      lat: this.state.lat,
      lng: this.state.lng,
    })*/
  }

  render() {
    return(
        <View style={styles.screen}>
          <Button
            full 
            style={styles.buttonText} 
            onPress={() => this.onSendLocation()}>
            <Text>Start Sending Location</Text>
          </Button> 
         { this.state.geolocationDisp }
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
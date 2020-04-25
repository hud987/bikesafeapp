import React, { Component } from "react";

import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from "react-native";

import {Container, Content, Button} from 'native-base';
//import Colors from '../constants/colors'


class BikerOrDriver extends Component {
  static navigationOptions = {
    title: 'Home',
    headerTintColor: '#ffffff',
    headerStyle: {
      backgroundColor: '#5cb85c',
    },

  };

  render () {
    return(
      <View style={styles.screen}>
        <View style={styles.buttonContainer}>
          <View style={styles.singleButtonContainer}>
          <Button 
            success={true}
            style={styles.buttonBackground} 
            onPress={() => this.props.navigation.navigate('Biker')}>
            <Text style={styles.buttonText} >Bicyclist</Text>
          </Button> 
          </View>
          <View style={styles.singleButtonContainer}>
          <Button 
            success={true}
            style={styles.buttonBackground} 
            onPress={() => this.props.navigation.navigate('Driver')}>
            <Text style={styles.buttonText}>Driver</Text>
          </Button> 
          </View>
        </View>
      </View>

    );
  }
};

export default  BikerOrDriver;


const styles = StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      justifyContent:'center',
      //backgroundColor: Colors.background
    },
    buttonContainer: {
      //width: 175,
      justifyContent: 'center',
    },
    singleButtonContainer: {
      padding: 15,
    },
    buttonBackground: {
      width: 250,
      height: 100,
      justifyContent: 'center',
    },
    buttonText: {
      fontSize: 20,
      color: 'white',
    },
});


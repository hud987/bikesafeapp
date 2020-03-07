/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useState, Component} from 'react';
//import 'react-native-gesture-handler';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  FlatList,
  View,
  Text,
  StatusBar,
  Button,
  TextInput,
} from 'react-native';

//import Login from './screens/Login';
import Navigator from './routes/homeStack';

export default function App() {
  return (
    <Navigator />
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});


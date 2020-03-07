import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import Driver from '../screens/Driver';
import Biker from '../screens/Biker';
import BikerOrDriver from '../screens/BikerOrDriver';
//import Login from '../screens/Login';

const screens = {
    BikerOrDriver: {screen: BikerOrDriver},
    //Login: {screen: Login},
    Biker: {screen: Biker},
    Driver: {screen: Driver},
}

const Navigator = createStackNavigator(screens);

export default createAppContainer(Navigator);  
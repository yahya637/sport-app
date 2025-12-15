import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ExploreScreen from './screens/SportFritid/ExploreScreen';
import FacilityDetailsScreen from './screens/SportFritid/FacilityDetailsScreen';
import BookingScreen from './screens/SportFritid/BookingScreen';
import PreviousScreen from './screens/SportFritid/PreviousScreen';
import ProfileScreen from './screens/SportFritid/ProfileScreen';
import MapScreen from './screens/SportFritid/MapScreen';
import EditProfileScreen from './screens/SportFritid/EditProfileScreen';

import { BookingsProvider } from './store/bookings';
import { FiltersProvider } from './store/filters';

//nide
const Root = createNativeStackNavigator();
const Stack = createNativeStackNavigator();

function ExploreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={({ navigation }) => ({
          title: 'Vælg sportsgren',
          headerRight: () => (
            <Ionicons
              name="map-outline"
              size={22}
              onPress={() => navigation.navigate('Map')}
            />
          ),
        })}
      />
      <Stack.Screen
        name="FacilityDetails"
        component={FacilityDetailsScreen}
        options={{ title: 'Vælg bane' }}
      />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book' }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Kort' }} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Previous"
        component={PreviousScreen}
        options={{ title: 'Mine bookinger' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Rediger profil' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <BookingsProvider>
      <FiltersProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Root.Navigator screenOptions={{ headerShown: false }}>
              <Root.Screen name="TabExplore" component={ExploreStack} />
              <Root.Screen name="TabBookings" component={BookingsStack} />
              <Root.Screen name="TabProfile" component={ProfileStack} />
            </Root.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </FiltersProvider>
    </BookingsProvider>
  );
}


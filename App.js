import "react-native-gesture-handler";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import AccountScreen from "./screens/SportFritid/AccountScreen";
import ExploreScreen from "./screens/SportFritid/ExploreScreen";
import FacilityDetailsScreen from "./screens/SportFritid/FacilityDetailsScreen";
import BookingScreen from "./screens/SportFritid/BookingScreen";
import PreviousScreen from "./screens/SportFritid/PreviousScreen";
import ProfileScreen from "./screens/SportFritid/ProfileScreen";
import MapScreen from "./screens/SportFritid/MapScreen";

// tilføj disse hvis du har dem
import AuthScreen from "./screens/SportFritid/AuthScreen";
import EditProfileScreen from "./screens/SportFritid/EditProfileScreen";

import { BookingsProvider } from "./store/bookings";
import { FiltersProvider } from "./store/filters";

const Root = createNativeStackNavigator();
const Stack = createNativeStackNavigator();

function ExploreStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={({ navigation }) => ({
          title: "Vælg sportsgren",
          headerRight: () => (
            <Ionicons
              name="map-outline"
              size={22}
              onPress={() => navigation.navigate("Map")}
            />
          ),
        })}
      />
      <Stack.Screen name="FacilityDetails" component={FacilityDetailsScreen} options={{ title: "Vælg bane" }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: "Book" }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: "Kort" }} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Previous" component={PreviousScreen} options={{ title: "Mine bookinger" }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profil" }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Rediger profil" }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: "Konto" }} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      <Root.Screen name="TabExplore" component={ExploreStack} />
      <Root.Screen name="TabBookings" component={BookingsStack} />
      <Root.Screen name="TabProfile" component={ProfileStack} />
    </Root.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={AuthScreen} options={{ title: "Login" }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = React.useState(undefined); // undefined = loading

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return unsub;
  }, []);

  return (
    <BookingsProvider>
      <FiltersProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            {user === undefined ? null : user ? <AppStack /> : <AuthStack />}
          </NavigationContainer>
        </SafeAreaProvider>
      </FiltersProvider>
    </BookingsProvider>
  );
}


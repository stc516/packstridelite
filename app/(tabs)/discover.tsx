import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import Colors from '@/constants/colors';

type Spot = {
  id: string;
  name: string;
  distance: string;
  rating: number;
  latitude: number;
  longitude: number;
};

const SAN_DIEGO_REGION: Region = {
  latitude: 32.7157,
  longitude: -117.1611,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const DOG_FRIENDLY_SPOTS: Spot[] = [
  {
    id: 'torrey-pines',
    name: 'Torrey Pines',
    distance: '3.2 mi',
    rating: 4.8,
    latitude: 32.9213,
    longitude: -117.2512,
  },
  {
    id: 'mission-trails',
    name: 'Mission Trails',
    distance: '5.6 mi',
    rating: 4.7,
    latitude: 32.8397,
    longitude: -117.0421,
  },
  {
    id: 'dog-beach-ob',
    name: 'Dog Beach OB',
    distance: '6.1 mi',
    rating: 4.9,
    latitude: 32.7525,
    longitude: -117.2528,
  },
  {
    id: 'balboa-park',
    name: 'Balboa Park',
    distance: '2.4 mi',
    rating: 4.6,
    latitude: 32.7341,
    longitude: -117.1446,
  },
  {
    id: 'lake-miramar',
    name: 'Lake Miramar',
    distance: '7.8 mi',
    rating: 4.7,
    latitude: 32.9179,
    longitude: -117.0898,
  },
];

function stars(rating: number): string {
  const rounded = Math.round(rating);
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
}

export default function DiscoverScreen() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<Region>(SAN_DIEGO_REGION);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCurrentLocation() {
      setLocationLoading(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!active) return;

      if (status !== 'granted') {
        setLocationError('Location permission not granted. Showing San Diego area.');
        setLocationLoading(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      if (!active) return;

      setRegion({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      });
      setLocationLoading(false);
    }

    loadCurrentLocation().catch((error: unknown) => {
      if (!active) return;
      setLocationError(error instanceof Error ? error.message : 'Unable to fetch location.');
      setLocationLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredSpots = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return DOG_FRIENDLY_SPOTS;
    return DOG_FRIENDLY_SPOTS.filter((spot) => spot.name.toLowerCase().includes(term));
  }, [search]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 24, color: Colors.navy, marginBottom: 4 }}>
          Discover
        </Text>
        <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 16 }}>
          Find dog-friendly places near your current area.
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search spots in San Diego"
          placeholderTextColor={Colors.mist}
          style={{
            height: 52,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: Colors.sky,
            backgroundColor: Colors.white,
            paddingHorizontal: 16,
            fontFamily: 'Outfit_400Regular',
            fontSize: 15,
            color: Colors.navy,
            marginBottom: 14,
          }}
        />

        <View
          className="rounded-3xl overflow-hidden mb-4"
          style={{
            backgroundColor: Colors.white,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          {locationLoading ? (
            <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={Colors.ocean} />
            </View>
          ) : (
            <MapView
              style={{ height: 220, width: '100%' }}
              initialRegion={region}
              region={region}
              scrollEnabled
              zoomEnabled
            >
              <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} title="You are here" />
              {filteredSpots.map((spot) => (
                <Marker
                  key={spot.id}
                  coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
                  title={spot.name}
                />
              ))}
            </MapView>
          )}
        </View>

        {locationError && (
          <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#C0392B', marginBottom: 10 }}>
            {locationError}
          </Text>
        )}

        <View className="gap-3">
          {filteredSpots.map((spot) => (
            <View
              key={spot.id}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: Colors.white,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: Colors.navy, marginBottom: 2 }}>
                {spot.name}
              </Text>
              <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.mist, marginBottom: 6 }}>
                Distance: {spot.distance}
              </Text>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 13, color: Colors.gold }}>
                {stars(spot.rating)} {spot.rating.toFixed(1)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

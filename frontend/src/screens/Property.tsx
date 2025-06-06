import React, { useContext, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Button } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import Map from "../components/Map";
import { getProperty, removeBooking } from "../utils/api";
import useAuthCheck from "../hooks/useAuthCheck";
// import { useAuth0 } from "@auth0/auth0-react";
import BookingModal from "../components/BookingModal";
import UserDetailContext from "../context/UserDetailContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HeartBtn from "../components/HeartBtn";
import { useRoute } from "@react-navigation/native";

const Property = ({ navigation }) => {
  const route = useRoute();
  const id = route.params?.id;
  const { data, isLoading, isError } = useQuery(["resd", id], () => getProperty(id));
  const [modalOpened, setModalOpened] = useState(false);
  const { validateLogin } = useAuthCheck();
  // const { user } = useAuth0();

  const {
    userDetails: { token, bookings = [] },
    setUserDetails,
  } = useContext(UserDetailContext);

  const { mutate: cancelBooking, isLoading: cancelling } = useMutation({
    mutationFn: () => removeBooking(id, user?.email, token),
    onSuccess: () => {
      setUserDetails((prev) => ({
        ...prev,
        bookings: prev.bookings.filter((booking) => booking?.id !== id),
      }));
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text>Error while fetching data</Text>
      </View>
    );
  }

  const isBooked = bookings?.map((booking) => booking.id).includes(id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: data?.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.heartBtn}>
          <HeartBtn id={id} />
        </View>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.city}>{data?.city}</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{data?.title}</Text>
          <Text style={styles.price}>${data?.price}.00</Text>
        </View>
        <View style={styles.facilitiesRow}>
          <Text style={styles.facility}>
            <MaterialCommunityIcons name="bed-outline" size={18} /> {data?.facilities.bedrooms}
          </Text>
          <Text style={styles.facility}>
            <MaterialCommunityIcons name="shower" size={18} /> {data?.facilities.bathrooms}
          </Text>
          <Text style={styles.facility}>
            <MaterialCommunityIcons name="garage" size={18} /> {data?.facilities.parkings}
          </Text>
          <Text style={styles.facility}>
            <MaterialCommunityIcons name="ruler-square" size={18} /> 0
          </Text>
        </View>
        <Text style={styles.description}>{data?.description}</Text>
        <View style={styles.addressRow}>
          <MaterialCommunityIcons name="map-marker" size={18} color="#007bff" />
          <Text style={styles.addressText}>
            {data?.address} {data?.city} {data?.country}
          </Text>
        </View>
        <View style={styles.bookingSection}>
          {isBooked ? (
            <>
              <Button
                title="Cancel booking"
                onPress={() => cancelBooking()}
                color="#ff0000"
                disabled={cancelling}
              />
              <Text style={styles.bookedText}>
                You've Already booked visit for{" "}
                {bookings?.filter((booking) => booking?.id === id)[0]?.date}
              </Text>
            </>
          ) : (
            <Button
              title="Book the visit"
              onPress={() => {
                if (validateLogin()) setModalOpened(true);
              }}
              color="#007bff"
            />
          )}
          <BookingModal
            opened={modalOpened}
            setOpened={setModalOpened}
            propertyId={id}
            email={user?.email}
          />
        </View>
      </View>
      <View style={styles.mapSection}>
        <Map
          address={data?.address}
          city={data?.city}
          country={data?.country}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 16,
  },
  heartBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  city: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  facilitiesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  facility: {
    fontSize: 14,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  addressText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#333",
  },
  bookingSection: {
    marginTop: 16,
  },
  bookedText: {
    color: "#ff0000",
    marginTop: 8,
    fontSize: 15,
    fontWeight: "500",
  },
  mapSection: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
    height: 220,
  },
});

export default Property;

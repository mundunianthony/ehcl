import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import Searchbar from "../components/Searchbar";
import useProperties from "../hooks/useProperties";
import Item from "../components/Item";
import UserDetailContext from "../context/UserDetailContext";

const Bookings = ({ navigation }) => {
  const { data, isError, isLoading } = useProperties();
  const [filter, setFilter] = useState("");
  const { userDetails: { bookings = [] } } = useContext(UserDetailContext);

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text>Error while fetching data</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  // Filter properties that are booked by the user
  const bookedPropertyIds = bookings.map((booking) => booking.id);
  const filteredProperties = (data || [])
    .filter((property) => bookedPropertyIds.includes(property.id))
    .filter((property) =>
      property.title.toLowerCase().includes(filter.toLowerCase()) ||
      property.city.toLowerCase().includes(filter.toLowerCase()) ||
      property.country.toLowerCase().includes(filter.toLowerCase())
    );

  return (
    <View style={styles.container}>
      <Searchbar filter={filter} setFilter={setFilter} />
      <FlatList
        data={filteredProperties}
        keyExtractor={(item, i) => item.id?.toString() || i.toString()}
        renderItem={({ item }) => <Item property={item} navigation={navigation} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 32,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingTop: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 32,
    fontSize: 16,
  },
});

export default Bookings;

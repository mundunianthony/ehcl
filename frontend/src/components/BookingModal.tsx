import React, { useContext, useState } from "react";
import { View, Text, Modal, Button, StyleSheet, Platform } from "react-native";
import DatePicker from "react-native-date-picker";
import { useMutation } from "@tanstack/react-query";
import UserDetailContext from "../context/UserDetailContext";
import { bookVisit } from "../utils/api";
import dayjs from "dayjs";
import { getAccessibleModalProps } from "../utils/accessibility";

// Make sure you have installed the dependency:
// npx expo install react-native-date-picker
// or
// npm install react-native-date-picker

const BookingModal = ({ opened, setOpened, email, propertyId }) => {
  const [date, setDate] = useState(new Date());
  const [isDateSelected, setIsDateSelected] = useState(false);
  const {
    userDetails: { token },
    setUserDetails,
  } = useContext(UserDetailContext);

  const handleBookingSuccess = () => {
    console.warn("You have successfully booked visit");
    setUserDetails((prev) => ({
      ...prev,
      bookings: [
        ...prev.bookings,
        {
          id: propertyId,
          date: dayjs(date).format("DD/MM/YYYY"),
        },
      ],
    }));
  };

  const { mutate, isLoading } = useMutation({
    mutationFn: () => bookVisit(date, propertyId, email, token),
    onSuccess: () => handleBookingSuccess(),
    onError: ({ response }) => console.warn(response?.data?.message),
    onSettled: () => setOpened(false),
  });

  const handleBooking = () => {
    mutate();
  };

  // Add accessibility props for web
  const accessibleModalProps = getAccessibleModalProps();

  return (
    <Modal 
      visible={opened} 
      animationType="slide" 
      onRequestClose={() => setOpened(false)}
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View 
          style={styles.container}
          {...accessibleModalProps}
        >
          <Text style={styles.title}>Select your date of visit</Text>
          <DatePicker
            date={date}
            onDateChange={(selectedDate) => {
              setDate(selectedDate);
              setIsDateSelected(true);
            }}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => setOpened(false)}
              color="#888"
            />
            <Button
              title="Book Visit"
              onPress={handleBooking}
              disabled={!isDateSelected || isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    width: Platform.OS === 'web' ? '80%' : '100%',
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
});

export default BookingModal;

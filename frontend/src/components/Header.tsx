import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth0 } from "@auth0/auth0-react";

// Note: react-icons is not supported in React Native. We'll use simple text/icons instead.

const Header = ({ navigation }) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();

  const toggleMenu = () => setMenuOpened(!menuOpened);

  return (
    <View style={styles.header}>
      <Text style={styles.logo}>Homely.com</Text>
      <TouchableOpacity onPress={toggleMenu}>
        <Text style={{ fontSize: 24 }}>
          {menuOpened ? "✕" : "☰"}
        </Text>
      </TouchableOpacity>
      {!isAuthenticated ? (
        <TouchableOpacity onPress={loginWithRedirect}>
          <Text style={styles.loginButton}>Login</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => logout({ returnTo: window.location.origin })}>
          <Text style={styles.logoutButton}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  loginButton: {
    color: "#007bff",
  },
  logoutButton: {
    color: "#ff0000",
  },
});

export default Header;

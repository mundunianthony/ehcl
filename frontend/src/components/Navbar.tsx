import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../context/AuthContext";

type NavbarRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;

type NavbarProps = {
  containerStyles?: object;
};

type NavigationProp = StackNavigationProp<RootStackParamList, keyof RootStackParamList>;

const Navbar: React.FC<NavbarProps> = ({
  containerStyles,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<NavbarRouteProp>();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const isStaff = user?.is_staff || false;
  
  // Helper function to navigate to Hospitals screen with current route params
  const navigateToHospitals = () => {
    const params = route.params as RootStackParamList['Hospitals'];
    navigation.navigate("Hospitals", params);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    navigation.navigate("Login");
  };

  return (
    <View style={[styles.navbar, containerStyles]}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Home")}
      >
        <View style={styles.iconContainer}>
          <Icon name="home" size={24} color="#4F46E5" />
        </View>
        <Text style={[styles.navText, { color: "#4F46E5" }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Hospitals")}
      >
        <View style={styles.iconContainer}>
          <Icon name="hospital" size={24} color="#14B8A6" />
        </View>
        <Text style={[styles.navText, { color: "#14B8A6" }]}>Hospitals</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Profile")}
      >
        <View style={styles.iconContainer}>
          <Icon name="account" size={24} color="#64748B" />
        </View>
        <Text style={[styles.navText, { color: "#64748B" }]}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("About" as keyof RootStackParamList)}
      >
        <View style={styles.iconContainer}>
          <Icon name="information" size={24} color="#64748B" />
        </View>
        <Text style={[styles.navText, { color: "#64748B" }]}>About</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => setMenuVisible(true)}
      >
        <View style={styles.iconContainer}>
          <Icon name="menu" size={24} color="#64748B" />
        </View>
        <Text style={[styles.navText, { color: "#64748B" }]}>Menu</Text>
      </TouchableOpacity>

      {/* Menu Modal */}
      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Home" as keyof RootStackParamList);
              }}
            >
              <Icon name="home" size={20} color="#4F46E5" style={styles.menuIcon} />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Hospitals");
              }}
            >
              <Icon name="hospital" size={20} color="#14B8A6" style={styles.menuIcon} />
              <Text style={styles.menuText}>Hospitals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Profile");
              }}
            >
              <Icon name="account" size={20} color="#64748B" style={styles.menuIcon} />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("About" as keyof RootStackParamList);
              }}
            >
              <Icon name="information" size={20} color="#64748B" style={styles.menuIcon} />
              <Text style={styles.menuText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Icon name="logout" size={20} color="#EF4444" style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: "#EF4444" }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: "100%",
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navItem: {
    flexDirection: "column",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  navText: {
    fontSize: 12,
    fontWeight: "500",
  },
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  menuIcon: {
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default Navbar;
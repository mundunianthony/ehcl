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
import { useAuth } from "../contexts/AuthContext";

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
    // Navigate to SignUp page on logout
    navigation.navigate("SignUp");
  };

  return (
    <View style={[styles.navbar, containerStyles]}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Home")}
      >
        <View style={styles.iconContainer}>
          <Icon name="home-city" size={24} color="#4F46E5" />
        </View>
        <Text style={[styles.navText, { color: "#4F46E5" }]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={navigateToHospitals}
      >
        <View style={styles.iconContainer}>
          <Icon name="view-grid" size={24} color="#14B8A6" />
        </View>
        <Text style={[styles.navText, { color: "#14B8A6" }]}>Hospitals</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("About")}
      >
        <View style={styles.iconContainer}>
          <Icon name="information" size={24} color="#F59E42" />
        </View>
        <Text style={[styles.navText, { color: "#F59E42" }]}>About</Text>
      </TouchableOpacity>

      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <View style={styles.iconContainer}>
          <Icon name="dots-vertical" size={24} color="#64748B" />
        </View>
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
              onPress={handleLogout}
            >
              <View style={styles.iconContainer}>
                <Icon name="logout" size={20} color="#EF4444" style={styles.menuIcon} />
              </View>
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
    paddingVertical: 4,
    backgroundColor: "#fff",
    elevation: 4,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: "100%",
    paddingBottom: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginVertical: 25,
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    marginLeft: 6,
    fontSize: 16,
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
    width: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default Navbar;
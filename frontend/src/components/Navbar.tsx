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
import { useNotifications } from '../context/NotificationContext';

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
  const { unreadCount } = useNotifications();
  
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
        onPress={() => navigation.navigate({ name: "Hospitals", params: {} })}
      >
        <View style={styles.iconContainer}>
          <Icon name="hospital" size={24} color="#14B8A6" />
        </View>
        <Text style={[styles.navText, { color: "#14B8A6" }]}>Hospitals</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate("Notifications")}
      >
        <View style={styles.iconContainer}>
          <Icon name="bell" size={24} color="#F59E42" />
          {unreadCount > 0 && (
            <View style={badgeStyle.badge}>
              <Text style={badgeStyle.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.navText, { color: "#F59E42" }]}>Notifications</Text>
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
        onPress={() => navigation.navigate("About")}
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
          <Icon name="menu" size={24} color="#000" />
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
                navigation.navigate("Home");
              }}
            >
              <Icon name="home" size={20} color="#000" style={styles.menuIcon} />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate({ name: "Hospitals", params: {} });
              }}
            >
              <Icon name="hospital" size={20} color="#000" style={styles.menuIcon} />
              <Text style={styles.menuText}>Hospitals</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Notifications");
              }}
            >
              <Icon name="bell" size={20} color="#000" style={styles.menuIcon} />
              <Text style={styles.menuText}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={badgeStyle.badgeSmall}>
                  <Text style={badgeStyle.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("Profile");
              }}
            >
              <Icon name="account" size={20} color="#000" style={styles.menuIcon} />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate("About");
              }}
            >
              <Icon name="information" size={20} color="#000" style={styles.menuIcon} />
              <Text style={styles.menuText}>About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Icon name="logout" size={20} color="#000" style={styles.menuIcon} />
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
    backgroundColor: '#000', // Set menu background to black
    borderRadius: 12,
    padding: 16,
    margin: 32,
    alignItems: 'flex-start',
    elevation: 8,
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
    width: 28,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

const badgeStyle = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  badgeSmall: {
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Navbar;
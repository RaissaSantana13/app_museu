import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../constants/theme";

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export function MenuModal({ visible, onClose }: MenuModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.menuContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={32} color={COLORS.secondaryBeige} />
          </TouchableOpacity>

          <View style={styles.menuItems}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Acervo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Tour Virtual</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Histórias</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Suporte</Text>
            </TouchableOpacity>

            {/* Nova opção adicionada: Contato */}
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Contato</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton}>
            <Ionicons
              name="log-in-outline"
              size={24}
              color={COLORS.secondaryBeige}
              style={styles.loginIcon}
            />
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Área clicável fora do menu para fechar o modal */}
        <TouchableOpacity
          style={styles.dismissArea}
          onPress={onClose}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    flexDirection: "row",
  },
  menuContainer: {
    backgroundColor: COLORS.primaryBrown,
    width: "75%",
    height: "100%",
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  dismissArea: {
    flex: 1,
    height: "100%",
  },
  closeButton: {
    alignSelf: "flex-start",
    marginBottom: 40,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(227, 218, 201, 0.2)",
  },
  menuText: {
    color: COLORS.secondaryBeige,
    fontSize: 20,
    fontWeight: "500",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(227, 218, 201, 0.2)",
    marginBottom: 20,
  },
  loginIcon: {
    marginRight: 12,
  },
  loginText: {
    color: COLORS.secondaryBeige,
    fontSize: 20,
    fontWeight: "bold",
  },
});

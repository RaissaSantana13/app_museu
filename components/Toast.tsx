import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/theme";

export type ToastType = "success" | "error";

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

const ERROR_COLOR = "#B3261E";

export function Toast({
  visible,
  type = "success",
  message,
  actionLabel,
  onAction,
  onClose,
  duration = 0,
}: ToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible || duration <= 0) return;

    const timeout = setTimeout(onClose, duration);

    return () => clearTimeout(timeout);
  }, [visible, duration, message, onClose]);

  if (!visible) return null;

  const isSuccess = type === "success";

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + 24 }]}
    >
      <View
        accessibilityLiveRegion="polite"
        style={[styles.card, isSuccess ? styles.successCard : styles.errorCard]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isSuccess ? COLORS.accentGreen : ERROR_COLOR },
          ]}
        >
          <Ionicons
            name={isSuccess ? "checkmark" : "alert"}
            size={18}
            color={COLORS.textLight}
          />
        </View>

        <Text style={styles.message}>{message}</Text>

        <TouchableOpacity
          accessibilityLabel="Fechar aviso"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
        >
          <Ionicons name="close" size={20} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {!!actionLabel && !!onAction && (
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.actionButton}
          onPress={onAction}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 10,
    elevation: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondaryBeige,
    borderRadius: 16,
    borderLeftWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  successCard: {
    borderLeftColor: COLORS.accentGreen,
  },

  errorCard: {
    borderLeftColor: ERROR_COLOR,
  },

  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  message: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
    marginRight: 8,
  },

  actionButton: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.yellowIcon,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },

  actionButtonText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "900",
  },
});

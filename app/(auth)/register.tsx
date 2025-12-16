import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

type Gender = "male" | "female";

export default function RegisterScreen() {
  const { signUp, isLoading, justRegistered, registeredUsername, clearJustRegistered } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!username) {
      setError("Username is required");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    const { error } = await signUp(username, password, gender, email || undefined);
    if (error) {
      if (error.message.includes("already registered")) {
        setError("This username is already taken");
      } else {
        setError(error.message);
      }
    }
  };

  const handleGoToLogin = () => {
    clearJustRegistered();
    router.replace("/(auth)/login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <View className="mb-10">
            <Text className="text-text-primary text-3xl font-bold">Create account</Text>
            <Text className="text-text-secondary mt-2">
              Claim your handle and jump in.
            </Text>
          </View>

          <View className="bg-surface border border-border-subtle rounded-2xl p-5 gap-4">
            <Input
              label="Username *"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Email (optional)"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Input
              label="Password *"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View className="gap-2">
              <Text className="text-text-secondary text-sm font-semibold ml-0.5">
                I am a...
              </Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setGender("male")}
                  className={`flex-1 px-4 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                    gender === "male"
                      ? "border-primary bg-surface-light"
                      : "border-border-subtle bg-surface"
                  } active:opacity-90`}
                >
                  <Ionicons
                    name="man-outline"
                    size={18}
                    color={gender === "male" ? "#ef233c" : "#a17b88"}
                  />
                  <Text
                    className={`font-semibold ${
                      gender === "male" ? "text-primary" : "text-text-secondary"
                    }`}
                  >
                    Male
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setGender("female")}
                  className={`flex-1 px-4 py-4 rounded-2xl border flex-row items-center justify-center gap-2 ${
                    gender === "female"
                      ? "border-primary bg-surface-light"
                      : "border-border-subtle bg-surface"
                  } active:opacity-90`}
                >
                  <Ionicons
                    name="woman-outline"
                    size={18}
                    color={gender === "female" ? "#ef233c" : "#a17b88"}
                  />
                  <Text
                    className={`font-semibold ${
                      gender === "female"
                        ? "text-primary"
                        : "text-text-secondary"
                    }`}
                  >
                    Female
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? <Text className="text-danger text-sm">{error}</Text> : null}

            <Button
              onPress={handleRegister}
              title={isLoading ? "Creating account..." : "Create account"}
              variant="primary"
              size="lg"
              loading={isLoading}
              className="mt-1"
            />
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-text-secondary">Already playing? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable className="active:opacity-80">
                <Text className="text-primary font-semibold ml-1">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={justRegistered}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-background/95 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.duration(400)}
            className="bg-surface rounded-2xl p-6 w-full max-w-sm items-center border border-border-subtle"
          >
            <View className="w-20 h-20 rounded-2xl bg-surface-light border border-border-subtle items-center justify-center mb-6">
              <Ionicons name="checkmark" size={44} color="#ef233c" />
            </View>

            <Text className="text-text-primary text-2xl font-bold text-center mb-2">
              Welcome, {registeredUsername || username}!
            </Text>

            <Text className="text-text-secondary text-center mb-8">
              Your account has been created successfully. Please sign in to start playing.
            </Text>

            <Button
              onPress={handleGoToLogin}
              title="Go to login"
              variant="primary"
              size="lg"
              className="w-full"
            />
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

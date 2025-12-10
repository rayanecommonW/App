import { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
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
        <View className="flex-1 justify-center px-8 py-12">
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-text-primary mb-2">
              JOIN THE TEST
            </Text>
            <Text className="text-text-secondary text-center">
              Create your account and prove you are human
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-text-secondary text-sm mb-2 ml-1">
                USERNAME <Text className="text-danger">*</Text>
              </Text>
              <TextInput
                className="bg-surface border border-muted rounded-xl px-4 py-4 text-text-primary text-base"
                placeholder="Choose a username"
                placeholderTextColor="#666680"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="mt-4">
              <Text className="text-text-secondary text-sm mb-2 ml-1">
                EMAIL <Text className="text-muted">(optional)</Text>
              </Text>
              <TextInput
                className="bg-surface border border-muted rounded-xl px-4 py-4 text-text-primary text-base"
                placeholder="Enter your email"
                placeholderTextColor="#666680"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="mt-4">
              <Text className="text-text-secondary text-sm mb-2 ml-1">
                PASSWORD <Text className="text-danger">*</Text>
              </Text>
              <TextInput
                className="bg-surface border border-muted rounded-xl px-4 py-4 text-text-primary text-base"
                placeholder="Create a password"
                placeholderTextColor="#666680"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View className="mt-4">
              <Text className="text-text-secondary text-sm mb-3 ml-1">
                I AM A...
              </Text>
              <View className="flex-row space-x-3">
                <Pressable
                  onPress={() => setGender("male")}
                  className={`flex-1 py-4 rounded-xl border-2 items-center ${
                    gender === "male"
                      ? "border-primary bg-primary/10"
                      : "border-muted bg-surface"
                  }`}
                >
                  <Text
                    className={`font-semibold text-lg ${
                      gender === "male" ? "text-primary" : "text-text-secondary"
                    }`}
                  >
                    👨 Male
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setGender("female")}
                  className={`flex-1 py-4 rounded-xl border-2 items-center ${
                    gender === "female"
                      ? "border-secondary bg-secondary/10"
                      : "border-muted bg-surface"
                  }`}
                >
                  <Text
                    className={`font-semibold text-lg ${
                      gender === "female"
                        ? "text-secondary"
                        : "text-text-secondary"
                    }`}
                  >
                    👩 Female
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? (
              <Text className="text-danger text-sm mt-2 ml-1">{error}</Text>
            ) : null}

            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              className="mt-6"
            >
              <LinearGradient
                colors={
                  gender === "female"
                    ? ["#ff00aa", "#cc0088"]
                    : ["#00ff88", "#00cc6a"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 items-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="#0a0a0f" />
                ) : (
                  <Text className="text-background font-bold text-lg">
                    CREATE ACCOUNT
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-text-secondary">Already playing? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-primary font-semibold">Sign In</Text>
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
        <View className="flex-1 bg-black/90 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.duration(400)}
            className="bg-surface rounded-3xl p-8 w-full max-w-sm items-center border border-surface-light"
          >
            <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={50} color="#00ff88" />
            </View>

            <Text className="text-text-primary text-2xl font-bold text-center mb-2">
              Welcome, {registeredUsername || username}!
            </Text>

            <Text className="text-text-secondary text-center mb-8">
              Your account has been created successfully. Please sign in to start playing.
            </Text>

            <Pressable onPress={handleGoToLogin} className="w-full">
              <LinearGradient
                colors={["#00ff88", "#00cc6a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 items-center"
              >
                <Text className="text-background font-bold text-lg">
                  GO TO LOGIN
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

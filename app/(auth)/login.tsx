import { useAuth } from "@/providers/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    const { error } = await signIn(username, password);
    if (error) {
      setError("Invalid username or password");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-8">
        {/* Logo/Title */}
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-primary mb-2">TURING</Text>
          <Text className="text-text-secondary text-lg">
            Can you tell the difference?
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-text-secondary text-sm mb-2 ml-1">
              USERNAME
            </Text>
            <TextInput
              className="bg-surface border border-muted rounded-xl px-4 py-4 text-text-primary text-base"
              placeholder="Enter your username"
              placeholderTextColor="#666680"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="mt-4">
            <Text className="text-text-secondary text-sm mb-2 ml-1">
              PASSWORD
            </Text>
            <TextInput
              className="bg-surface border border-muted rounded-xl px-4 py-4 text-text-primary text-base"
              placeholder="Enter your password"
              placeholderTextColor="#666680"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text className="text-danger text-sm mt-2 ml-1">{error}</Text>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className="mt-6"
          >
            <LinearGradient
              colors={["#00ff88", "#00cc6a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl py-4 items-center"
            >
              {isLoading ? (
                <ActivityIndicator color="#0a0a0f" />
              ) : (
                <Text className="text-background font-bold text-lg">
                  ENTER THE GAME
                </Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Register Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-text-secondary">New player? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="text-primary font-semibold">Create Account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

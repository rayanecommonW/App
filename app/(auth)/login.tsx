import Button from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
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
      <LinearGradient
        colors={["#fff3f6", "#ffffff"]}
        className="absolute inset-0"
      />

      <View className="flex-1 justify-center px-6 py-12">
        <View className="items-center gap-3 mb-10">
          <View className="px-3 py-1 rounded-full bg-primary/15 border border-primary/40">
            <Text className="text-primary text-xs font-semibold">
              Welcome back
            </Text>
          </View>
          <Text className="text-4xl font-bold text-text-primary">Turing</Text>
          <Text className="text-text-secondary text-center px-6">
            Sign in to keep guessing who is human and who is your charming AI.
          </Text>
        </View>

        <View className="bg-surface border border-border-subtle rounded-3xl p-5 space-y-4 shadow-md">
          <View className="gap-2">
            <Text className="text-text-secondary text-sm ml-1">Username</Text>
            <TextInput
              className="bg-surface border border-border-subtle rounded-2xl px-4 py-4 text-text-primary text-base"
              placeholder="e.g. redpanda_lover"
              placeholderTextColor="#a698b7"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="gap-2">
            <Text className="text-text-secondary text-sm ml-1">Password</Text>
            <TextInput
              className="bg-surface border border-border-subtle rounded-2xl px-4 py-4 text-text-primary text-base"
              placeholder="Enter your password"
              placeholderTextColor="#a698b7"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text className="text-danger text-sm ml-1">{error}</Text>
          ) : null}

          <Button
            onPress={handleLogin}
            title={isLoading ? "Signing you in..." : "Enter the arena"}
            variant="primary"
            size="lg"
            loading={isLoading}
            className="mt-2"
          />
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-text-secondary">New player? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="text-primary font-semibold ml-1">
                Create account
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

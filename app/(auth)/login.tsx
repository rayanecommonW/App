import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/providers/AuthProvider";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
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
      <View className="flex-1 justify-center px-6 py-12">
        <View className="mb-10">
          <Text className="text-text-primary text-3xl font-bold">Sign in</Text>
          <Text className="text-text-secondary mt-2">
            Jump back into the arena.
          </Text>
        </View>

        <View className="bg-surface border border-border-subtle rounded-2xl p-5 gap-4">
          <Input
            label="Username"
            placeholder="e.g. redpanda_lover"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text className="text-danger text-sm">{error}</Text> : null}

          <Button
            onPress={handleLogin}
            title={isLoading ? "Signing you in..." : "Sign in"}
            variant="primary"
            size="lg"
            loading={isLoading}
            className="mt-1"
          />
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-text-secondary">New player? </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable className="active:opacity-80">
              <Text className="text-primary font-semibold ml-1">Create account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

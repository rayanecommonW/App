import ChatBubble, { TypingIndicator } from "@/components/chat/ChatBubble";
import ChatTimer from "@/components/chat/ChatTimer";
import DecisionModal from "@/components/DecisionModal";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { sendMessageLocal } from "@/lib/ai";
import { ChatMessage } from "@/lib/database.types";
import { useChatStore } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const MAX_TIME = 60; // 1 minute
const MAX_MESSAGES = 20;

export default function ChatScreen() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();
  const {
    persona,
    messages,
    isTyping,
    timeRemaining,
    messageCount,
    isSessionEnded,
    showDecisionModal,
    addMessage,
    setTyping,
    setTimeRemaining,
    incrementMessageCount,
    endSession,
    setShowDecisionModal,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasGreeted = useRef(false);
  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 0);
  }, []);

  // Memoized greeting function
  const sendInitialGreeting = useCallback(async () => {
    if (!persona || !sessionId) return;
    setTyping(true);
    
    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    
    const greetings = [
      `hey, it's ${persona.name}`,
      `${persona.name}. you look like trouble`,
      `yo. ${persona.name} here`,
      `hey. you're kinda my type`,
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    const greetingMessage: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionId,
      role: "assistant",
      content: greeting,
      created_at: new Date().toISOString(),
    };

    setTyping(false);
    addMessage(greetingMessage);
    incrementMessageCount();
    scrollToBottom(false);
  }, [
    persona,
    sessionId,
    setTyping,
    addMessage,
    incrementMessageCount,
    scrollToBottom,
  ]);

  // Start countdown timer - runs once on mount
  useEffect(() => {
    if (isSessionEnded) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev: number) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionEnded, setTimeRemaining]);

  // Check if session should end
  useEffect(() => {
    if (timeRemaining <= 0 || messageCount >= MAX_MESSAGES) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      endSession();
    }
  }, [timeRemaining, messageCount, endSession]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) scrollToBottom(true);
  }, [messages.length, isTyping, scrollToBottom]);

  // Send initial AI greeting
  useEffect(() => {
    if (persona && !hasGreeted.current) {
      hasGreeted.current = true;
      sendInitialGreeting();
    }
  }, [persona, sendInitialGreeting]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending || isSessionEnded || !persona) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsSending(true);

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionId!,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);
    incrementMessageCount();

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Show typing indicator
    setTyping(true);

    try {
      // Get AI response with typing delay
      const { message: aiResponse, typingDelay } = await sendMessageLocal(
        sessionId!,
        userMessage,
        persona.id,
        messages.map((m) => ({ role: m.role, content: m.content })),
        persona
      );

      // Wait for "typing" simulation
      await new Promise((r) => setTimeout(r, typingDelay));

      if (!isSessionEnded) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          session_id: sessionId!,
          role: "assistant",
          content: aiResponse,
          created_at: new Date().toISOString(),
        };
        addMessage(aiMsg);
        incrementMessageCount();
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
    } finally {
      setTyping(false);
      setIsSending(false);
    }
  };

  const handleBack = () => {
    if (!isSessionEnded) {
      // Show confirmation or just end
      endSession();
    } else {
      router.back();
    }
  };

  const handleSurrender = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeRemaining(0);
    endSession();
    setShowDecisionModal(true);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatBubble
      content={item.content}
      isUser={item.role === "user"}
      timestamp={new Date(item.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      {/* Header */}
      <View className="pt-14 pb-4 px-4 flex-row items-center justify-between">
        <IconButton icon="chevron-back" label="Back" onPress={handleBack} />
        <View className="items-center flex-1">
          <Text className="text-text-primary font-semibold text-lg">
            {persona?.name || "Match"}
          </Text>
          <ChatTimer timeRemaining={timeRemaining} maxTime={MAX_TIME} />
        </View>
        <View className="w-11">
          <Pressable
            onPress={handleSurrender}
            disabled={isSessionEnded}
            className={`px-3 py-2 rounded-2xl border ${
              isSessionEnded
                ? "border-border-subtle bg-surface"
                : "border-border-subtle bg-surface-light"
            } active:opacity-85`}
          >
            <Text className="text-text-primary font-semibold text-sm">End</Text>
          </Pressable>
        </View>
      </View>

      {/* Session ended overlay */}
      {isSessionEnded && !showDecisionModal && (
        <Animated.View
          entering={FadeIn}
          className="absolute inset-0 z-10 bg-background/92 items-center justify-center px-6"
        >
          <Text className="text-text-primary text-xl font-bold mb-4">
            Session Ended
          </Text>
          <Button
            onPress={() => setShowDecisionModal(true)}
            title="Make your guess"
            variant="primary"
            size="lg"
          />
        </Animated.View>
      )}

      {/* Messages + Input (flex layout so nothing renders behind/under anything) */}
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
          }}
          onContentSizeChange={() => scrollToBottom(true)}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        <View className="bg-background/95 border-t border-border-subtle px-4 pt-3 pb-8">
          <View className="flex-row items-end space-x-3">
            <View className="flex-1 bg-surface border border-border-subtle rounded-2xl px-4 py-3 max-h-32">
              <TextInput
                className="text-text-primary text-base"
                placeholder={isSessionEnded ? "Chat ended" : "Type a message..."}
                placeholderTextColor="#a698b7"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isSessionEnded}
              />
            </View>
            {inputText.trim() && !isSessionEnded ? (
              <Pressable
                onPress={handleSend}
                disabled={isSending}
                className="w-12 h-12 rounded-2xl overflow-hidden active:opacity-85 bg-primary items-center justify-center"
              >
                <Ionicons name="send" size={20} color="#ffffff" />
              </Pressable>
            ) : (
              <View className="w-12 h-12 rounded-2xl bg-surface border border-border-subtle items-center justify-center">
                <Ionicons name="send" size={20} color="#c7a9b2" />
              </View>
            )}
          </View>

          {/* Message count indicator */}
          <Text className="text-muted text-xs text-center mt-2">
            {messageCount}/{MAX_MESSAGES} messages
          </Text>
        </View>
      </View>

      {/* Decision Modal */}
      <DecisionModal
        visible={showDecisionModal}
        sessionId={sessionId!}
        onClose={() => {
          setShowDecisionModal(false);
          router.replace("/(main)/(tabs)");
        }}
      />
    </KeyboardAvoidingView>
  );
}


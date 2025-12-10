import ChatBubble, { TypingIndicator } from "@/components/chat/ChatBubble";
import ChatTimer from "@/components/chat/ChatTimer";
import DecisionModal from "@/components/DecisionModal";
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

const MAX_TIME = 300; // 5 minutes
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

  // Memoized greeting function
  const sendInitialGreeting = useCallback(async () => {
    if (!persona || !sessionId) return;
    setTyping(true);
    
    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    
    const greetings = [
      `hey! i'm ${persona.name} 😊 how's it going?`,
      `hi there! ${persona.name} here. what's up?`,
      `heyy, nice to match with you! i'm ${persona.name}`,
      `oh hey! i'm ${persona.name}. so tell me about yourself!`,
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
  }, [persona, sessionId, setTyping, addMessage, incrementMessageCount]);

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
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isTyping]);

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
      <View className="pt-14 pb-4 px-4 bg-surface border-b border-surface-light">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={handleBack} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={28} color="#666680" />
          </Pressable>

          <View className="items-center">
            <Text className="text-text-primary font-semibold text-lg">
              {persona?.name || "Match"}
            </Text>
            <ChatTimer timeRemaining={timeRemaining} maxTime={MAX_TIME} />
          </View>

          <View className="w-10" />
        </View>
      </View>

      {/* Session ended overlay */}
      {isSessionEnded && !showDecisionModal && (
        <Animated.View
          entering={FadeIn}
          className="absolute inset-0 z-10 bg-background/90 items-center justify-center"
        >
          <Text className="text-text-primary text-xl font-bold mb-4">
            Session Ended
          </Text>
          <Pressable
            onPress={() => setShowDecisionModal(true)}
            className="bg-primary px-8 py-4 rounded-xl"
          >
            <Text className="text-background font-bold text-lg">
              Make Your Guess
            </Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-surface-light px-4 pt-3 pb-8">
        <View className="flex-row items-end space-x-3">
          <View className="flex-1 bg-surface-light rounded-2xl px-4 py-3 max-h-32">
            <TextInput
              className="text-text-primary text-base"
              placeholder={
                isSessionEnded ? "Chat ended" : "Type a message..."
              }
              placeholderTextColor="#666680"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isSessionEnded}
              onSubmitEditing={handleSend}
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || isSending || isSessionEnded}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              inputText.trim() && !isSessionEnded
                ? "bg-primary"
                : "bg-surface-light"
            }`}
          >
            <Ionicons
              name="send"
              size={20}
              color={
                inputText.trim() && !isSessionEnded ? "#0a0a0f" : "#666680"
              }
            />
          </Pressable>
        </View>

        {/* Message count indicator */}
        <Text className="text-muted text-xs text-center mt-2">
          {messageCount}/{MAX_MESSAGES} messages
        </Text>
      </View>

      {/* Decision Modal */}
      <DecisionModal
        visible={showDecisionModal}
        sessionId={sessionId!}
        onClose={() => {
          setShowDecisionModal(false);
          router.replace("/(main)");
        }}
      />
    </KeyboardAvoidingView>
  );
}


import ChatBubble, { TypingIndicator } from "@/components/chat/ChatBubble";
import ChatTimer from "@/components/chat/ChatTimer";
import DecisionModal from "@/components/DecisionModal";
import { sendMessageLocal } from "@/lib/ai";
import { ChatMessage } from "@/lib/database.types";
import { shadowStyle } from "@/lib/shadow";
import { useChatStore } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
      <LinearGradient
        colors={["#fff2f6", "#ffffff"]}
        className="absolute inset-0"
      />
      <View className="absolute -right-16 -top-10 w-44 h-44 rounded-full bg-primary/10" />
      <View className="absolute -left-16 bottom-28 w-40 h-40 rounded-full bg-primary-soft/25" />

      {/* Header */}
      <View className="pt-14 pb-3 px-4">
        <View
          className="bg-surface rounded-3xl px-4 py-3 border border-border-subtle flex-row items-center justify-between"
          style={shadowStyle({
            color: "#ef233c",
            opacity: 0.06,
            radius: 10,
            offsetY: 8,
            elevation: 4,
          })}
        >
          <Pressable
            onPress={handleBack}
            className="w-10 h-10 rounded-2xl bg-surface-light/90 border border-border-subtle items-center justify-center active:scale-95"
          >
            <Ionicons name="chevron-back" size={22} color="#ef233c" />
          </Pressable>

          <View className="items-center flex-1">
            <Text className="text-text-primary font-semibold text-lg">
              {persona?.name || "Match"}
            </Text>
            <ChatTimer timeRemaining={timeRemaining} maxTime={MAX_TIME} />
          </View>

          <Pressable
            onPress={handleSurrender}
            disabled={isSessionEnded}
            className={`px-4 py-2 rounded-2xl border ${
              isSessionEnded ? "border-border-subtle bg-surface-light" : "border-primary/30 bg-primary/10"
            } active:scale-95`}
          >
            <Text className="text-primary font-semibold text-sm">End</Text>
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
          <Pressable
            onPress={() => setShowDecisionModal(true)}
            className="bg-primary px-8 py-4 rounded-2xl shadow-glow active:scale-[0.98]"
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
          paddingHorizontal: 16,
          paddingBottom: 120,
          paddingTop: 8,
        }}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-border-subtle px-4 pt-3 pb-8">
        <View className="flex-row items-end space-x-3">
          <View className="flex-1 bg-surface border border-border-subtle rounded-3xl px-4 py-3 max-h-32">
            <TextInput
              className="text-text-primary text-base"
              placeholder={
                isSessionEnded ? "Chat ended" : "Type a message..."
              }
              placeholderTextColor="#a698b7"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isSessionEnded}
              onSubmitEditing={handleSend}
            />
          </View>
          {inputText.trim() && !isSessionEnded ? (
            <Pressable
              onPress={handleSend}
              disabled={isSending}
              className="w-12 h-12 rounded-full overflow-hidden active:scale-95"
            >
              <LinearGradient
                colors={["#ef233c", "#ff6b6b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 items-center justify-center"
              >
                <Ionicons name="send" size={20} color="#ffffff" />
              </LinearGradient>
            </Pressable>
          ) : (
            <View className="w-12 h-12 rounded-full bg-surface border border-border-subtle items-center justify-center">
              <Ionicons name="send" size={20} color="#c7a9b2" />
            </View>
          )}
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


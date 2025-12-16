import ChatBubble, { TypingIndicator } from "@/components/chat/ChatBubble";
import ChatTimer from "@/components/chat/ChatTimer";
import DecisionModal from "@/components/DecisionModal";
import Button from "@/components/ui/Button";
import { sendMessageLocal } from "@/lib/ai";
import { ChatMessage } from "@/lib/database.types";
import { useChatStore } from "@/lib/store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_TIME = 60;
const MAX_MESSAGES = 20;

export default function ChatScreen() {
  const { id: sessionId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
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
    }, 50);
  }, []);

  const sendInitialGreeting = useCallback(async () => {
    if (!persona || !sessionId) return;
    setTyping(true);

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
  }, [persona, sessionId, setTyping, addMessage, incrementMessageCount, scrollToBottom]);

  // Timer
  useEffect(() => {
    if (isSessionEnded) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev: number) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionEnded, setTimeRemaining]);

  // End session check
  useEffect(() => {
    if (timeRemaining <= 0 || messageCount >= MAX_MESSAGES) {
      if (timerRef.current) clearInterval(timerRef.current);
      endSession();
    }
  }, [timeRemaining, messageCount, endSession]);

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0) scrollToBottom(true);
  }, [messages.length, isTyping, scrollToBottom]);

  // Initial greeting
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

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionId!,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);
    incrementMessageCount();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTyping(true);

    try {
      const { message: aiResponse, typingDelay } = await sendMessageLocal(
        sessionId!,
        userMessage,
        persona.id,
        messages.map((m) => ({ role: m.role, content: m.content })),
        persona
      );

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
      endSession();
    } else {
      router.back();
    }
  };

  const handleSurrender = () => {
    if (timerRef.current) clearInterval(timerRef.current);
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

  const canSend = inputText.trim() && !isSessionEnded && !isSending;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="pb-3 px-4 flex-row items-center border-b border-border-subtle/50"
      >
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-light"
        >
          <Ionicons name="chevron-back" size={24} color="#14060f" />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-text-primary font-semibold text-base">
            {persona?.name || "Match"}
          </Text>
          <ChatTimer timeRemaining={timeRemaining} maxTime={MAX_TIME} />
        </View>

        <Pressable
          onPress={handleSurrender}
          disabled={isSessionEnded}
          hitSlop={8}
          className={`px-3 py-1.5 rounded-full ${
            isSessionEnded
              ? "bg-surface-light opacity-50"
              : "bg-surface-light active:bg-surface-strong"
          }`}
        >
          <Text className="text-text-secondary font-medium text-sm">End</Text>
        </Pressable>
      </View>

      {/* Session ended overlay */}
      {isSessionEnded && !showDecisionModal && (
        <Animated.View
          entering={FadeIn}
          className="absolute inset-0 z-10 bg-background/95 items-center justify-center px-6"
          style={{ paddingTop: insets.top }}
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

      {/* Chat area with keyboard avoiding */}
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
            flexGrow: 1,
          }}
          onContentSizeChange={() => scrollToBottom(true)}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        />

        {/* Input area */}
        <View
          className="border-t border-border-subtle/50 bg-background px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row items-end gap-2">
            <View className="flex-1 bg-surface-light rounded-2xl px-4 min-h-[44px] max-h-28 justify-center">
              <TextInput
                className="text-text-primary text-base py-3"
                placeholder={isSessionEnded ? "Chat ended" : "Message..."}
                placeholderTextColor="#a17b88"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                blurOnSubmit={false}
                multiline
                maxLength={500}
                editable={!isSessionEnded}
              />
            </View>

            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                canSend
                  ? "bg-primary active:bg-primary-dim"
                  : "bg-surface-light"
              }`}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={canSend ? "#ffffff" : "#a17b88"}
              />
            </Pressable>
          </View>

          {/* Message count */}
          <Text className="text-muted text-xs text-center mt-2">
            {messageCount}/{MAX_MESSAGES}
          </Text>
        </View>
      </KeyboardAvoidingView>

      {/* Decision Modal */}
      <DecisionModal
        visible={showDecisionModal}
        sessionId={sessionId!}
        onClose={() => {
          setShowDecisionModal(false);
          router.replace("/(main)/(tabs)");
        }}
      />
    </View>
  );
}

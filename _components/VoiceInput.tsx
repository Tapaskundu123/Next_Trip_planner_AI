'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Extend Window type for browser speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast('🎤 Listening... speak now', { duration: 2000 });
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      if (event.results[0].isFinal) {
        onTranscript(transcript);
        toast.success(`Heard: "${transcript}"`);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (event.error !== 'aborted') {
        toast.error('Voice input failed. Please try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      title={isListening ? 'Stop listening' : 'Voice input'}
      className={`
        relative px-3 py-3 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-md
        ${isListening
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-2xl bg-red-400 animate-ping opacity-40" />
      )}
      {isListening ? (
        <MicOff className="w-5 h-5 relative z-10" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}

import { createSignal, Show } from 'solid-js';
import { createEvent } from './supabaseClient';

function App() {
  const [userSpeech, setUserSpeech] = createSignal('');
  const [aiResponse, setAIResponse] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [audioUrl, setAudioUrl] = createSignal('');
  const [isRecording, setIsRecording] = createSignal(false);

  let recognition;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserSpeech(transcript);
    };

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      handleSendToAI();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };
  } else {
    alert('متصفحك لا يدعم التعرف على الكلام.');
  }

  const handleStartRecording = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const handleSendToAI = async () => {
    setLoading(true);

    try {
      const aiResult = await createEvent('chatgpt_request', {
        prompt: userSpeech(),
        response_type: 'text'
      });

      setAIResponse(aiResult);

      const audioResult = await createEvent('text_to_speech', {
        text: aiResult
      });

      setAudioUrl(audioResult);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = () => {
    const audio = new Audio(audioUrl());
    audio.play();
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold mb-6 text-purple-600">مساعد المكفوفين الذكي</h1>

      <button
        class={`bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${isRecording() || loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleStartRecording}
        disabled={isRecording() || loading()}
      >
        <Show when={!isRecording()} fallback={'جاري التسجيل...'}>
          ابدأ التحدث
        </Show>
      </button>

      <Show when={loading()}>
        <p class="mt-4 text-purple-600">جاري المعالجة...</p>
      </Show>

      <Show when={aiResponse()}>
        <div class="mt-6 text-center">
          <p class="text-xl font-semibold mb-4 text-purple-600">الرد:</p>
          <p class="text-gray-700 mb-4">{aiResponse()}</p>
          <button
            class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={handlePlayAudio}
          >
            استمع للرد
          </button>
        </div>
      </Show>
    </div>
  );
}

export default App;
import { createSignal, Show } from 'solid-js';
import { createEvent } from './supabaseClient';

function App() {
  const [userSpeech, setUserSpeech] = createSignal('');
  const [aiResponse, setAIResponse] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [audioUrl, setAudioUrl] = createSignal('');
  const [isRecording, setIsRecording] = createSignal(false);
  const [inputMethod, setInputMethod] = createSignal(null);
  const [userText, setUserText] = createSignal('');

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
      handleSendToAI(userSpeech());
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

  const handleSendToAI = async (inputText) => {
    setLoading(true);

    try {
      const aiResult = await createEvent('chatgpt_request', {
        prompt: inputText,
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

  const handleTextSubmit = (e) => {
    e.preventDefault();
    handleSendToAI(userText());
    setUserText('');
  };

  const resetInteraction = () => {
    setInputMethod(null);
    setUserSpeech('');
    setAIResponse('');
    setAudioUrl('');
    setUserText('');
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 flex flex-col items-center justify-center">
      <h1 class="text-3xl font-bold mb-6 text-purple-600">مساعد المكفوفين الذكي</h1>
      <Show when={!inputMethod()}>
        <div class="flex flex-col space-y-4">
          <button
            class={`bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer`}
            onClick={() => setInputMethod('voice')}
          >
            ابدأ التحدث
          </button>
          <button
            class={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer`}
            onClick={() => setInputMethod('text')}
          >
            اكتب سؤالك
          </button>
        </div>
      </Show>

      <Show when={inputMethod() === 'voice'}>
        <div class="flex flex-col items-center">
          <button
            class={`mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${isRecording() || loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleStartRecording}
            disabled={isRecording() || loading()}
          >
            <Show when={!isRecording()} fallback={'جاري التسجيل...'}>
              ابدأ التحدث
            </Show>
          </button>
          <button
            class="mt-2 text-blue-500 hover:underline cursor-pointer"
            onClick={resetInteraction}
          >
            العودة
          </button>
        </div>
      </Show>

      <Show when={inputMethod() === 'text'}>
        <div class="mt-4 w-full max-w-md">
          <form onSubmit={handleTextSubmit} class="flex flex-col items-center space-y-4">
            <textarea
              placeholder="اكتب سؤالك هنا..."
              value={userText()}
              onInput={(e) => setUserText(e.target.value)}
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
              required
            />
            <button
              type="submit"
              class={`bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${loading() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading()}
            >
              إرسال
            </button>
            <button
              class="mt-2 text-blue-500 hover:underline cursor-pointer"
              onClick={resetInteraction}
            >
              العودة
            </button>
          </form>
        </div>
      </Show>

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
          <button
            class="mt-2 text-blue-500 hover:underline cursor-pointer"
            onClick={resetInteraction}
          >
            طرح سؤال آخر
          </button>
        </div>
      </Show>
    </div>
  );
}

export default App;
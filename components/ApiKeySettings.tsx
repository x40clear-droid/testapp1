import React, { useState, useEffect } from 'react';
import { X, Save, Wifi, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { saveApiKey, getApiKey } from '../services/storageService';
import { testConnection } from '../services/geminiService';

interface ApiKeySettingsProps {
  onClose: () => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ onClose }) => {
  const [key, setKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = getApiKey();
    if (stored) setKey(stored);
  }, []);

  const handleTest = async () => {
    if (!key.trim()) {
      setStatus('error');
      setMessage('API Key를 입력해주세요.');
      return;
    }

    setStatus('testing');
    setMessage('연결 확인 중...');

    const success = await testConnection(key);
    
    if (success) {
      setStatus('success');
      setMessage('연결 성공! 사용 가능한 키입니다.');
    } else {
      setStatus('error');
      setMessage('연결 실패. 키를 확인해주세요.');
    }
  };

  const handleSave = () => {
    if (!key.trim()) {
      setStatus('error');
      setMessage('키를 입력해주세요.');
      return;
    }
    saveApiKey(key);
    setStatus('success');
    setMessage('안전하게 저장되었습니다.');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1 text-white">API Key 설정</h2>
        <p className="text-xs text-neutral-400 mb-6">
          Gemini API Key를 입력하세요. 키는 로컬 드라이브에 암호화되어 저장됩니다.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <input
              type={isVisible ? "text" : "password"}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setStatus('idle');
              }}
              placeholder="AIzaSy..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none pr-10"
            />
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`flex items-center gap-2 text-xs p-3 rounded-lg ${
              status === 'success' ? 'bg-green-500/10 text-green-400' :
              status === 'error' ? 'bg-red-500/10 text-red-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              {status === 'testing' && <Wifi size={14} className="animate-pulse" />}
              {status === 'success' && <Check size={14} />}
              {status === 'error' && <AlertCircle size={14} />}
              <span>{message}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleTest}
              disabled={status === 'testing' || !key}
              className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Wifi size={16} />
              연결 테스트
            </button>
            <button
              onClick={handleSave}
              disabled={status === 'testing' || !key}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} />
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;

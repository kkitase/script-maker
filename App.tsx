
import React, { useState, useCallback, FC, useMemo } from 'react';
import { enhanceNotesWithGemini } from './services/geminiService';
import { SparklesIcon, ClipboardIcon, CheckIcon, LoadingSpinnerIcon, InfoIcon, DocumentDuplicateIcon, XMarkIcon } from './components/icons';

// --- Helper Components ---

interface OutputBlockProps {
  title: string;
  content: string;
  onCopy: () => void;
  isCopied: boolean;
  icon?: React.ReactNode;
}

const OutputBlock: FC<OutputBlockProps> = ({ title, content, onCopy, isCopied, icon }) => (
  <div className="bg-gray-800 rounded-lg shadow-lg mt-6">
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center space-x-2">
        {icon}
        <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
      </div>
      <button
        onClick={onCopy}
        className="flex items-center px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50"
        disabled={!content}
      >
        {isCopied ? <CheckIcon className="w-4 h-4 mr-1.5 text-green-400" /> : <ClipboardIcon className="w-4 h-4 mr-1.5" />}
        {isCopied ? 'コピーしました！' : 'コピー'}
      </button>
    </div>
    <div className="p-4 prose prose-invert max-w-none prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-md">
      <pre className="whitespace-pre-wrap break-words"><code>{content}</code></pre>
    </div>
  </div>
);

interface GasHelperModalProps {
  slideId: string;
  onClose: () => void;
}

const GasHelperModal: FC<GasHelperModalProps> = ({ slideId, onClose }) => {
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  const gasCode = useMemo(() => `
function getSpeakerNotes() {
  try {
    const presentationId = "${slideId}";
    const presentation = SlidesApp.openById(presentationId);
    const slides = presentation.getSlides();
    const allNotes = [];

    slides.forEach((slide, index) => {
      const notes = slide.getNotesPage().getSpeakerNotesShape().getText().asString();
      allNotes.push(notes.trim());
    });

    const output = allNotes.join('\\n---\\n');
    Logger.log(output);
    
    // Show a sidebar with the notes as SlidesApp does not support showModalDialog
    const htmlContent = '<h3>コピー用のスピーカーノート:</h3>' +
                        '<textarea style="width: 95%; height: 80vh;" readonly>' + 
                        output.replace(/\\n/g, '&#10;') + 
                        '</textarea>' +
                        '<p>上のテキストをコピーして、前のタブに戻り貼り付けてください。</p>';

    const html = HtmlService.createHtmlOutput(htmlContent)
      .setTitle('スピーカーノート');
    
    SlidesApp.getUi().showSidebar(html);

  } catch (e) {
    Logger.log('Error: ' + e.toString());
    SlidesApp.getUi().alert('エラーが発生しました。プレゼンテーションIDが正しいこと、およびアクセス権があることを確認してください。');
  }
}
`.trim(), [slideId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode).then(() => {
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
          <h2 className="text-xl font-bold text-white">スクリプトでノートを抽出</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 text-gray-300 space-y-4">
          <p>スライドのスピーカーノートにアクセスするには、簡単なGoogle Apps Scriptを実行する必要があります。これはセキュリティ上の理由から必要です。</p>
          
          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-lg text-white mt-4">手順</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Googleスライドのプレゼンテーションに移動し、<code className="bg-gray-700 text-indigo-300 px-1 py-0.5 rounded text-xs">拡張機能 &gt; Apps Script</code> をクリックします。</li>
              <li>新しいスクリプトエディタのタブが開きます。既存のコードをすべて削除してください。</li>
              <li>以下のスクリプトをコピーして、エディタに貼り付けます。</li>
              <li>上部にある <code className="bg-gray-700 text-indigo-300 px-1 py-0.5 rounded text-xs">実行</code> ボタン（▶ アイコン）をクリックします。</li>
              <li>初回実行時には、スクリプトの承認が必要です。画面の指示に従ってください。</li>
              <li>実行後、右側にすべてのノートが含まれたサイドバーが表示されます。その中のテキストをコピーしてください。</li>
              <li>このウィンドウを閉じ、「手動で貼り付け」タブにノートを貼り付けてください。</li>
            </ol>
          </div>
          
          <div className="relative mt-4">
            <button onClick={handleCopyCode} className="absolute top-3 right-3 flex items-center px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-md z-10">
              {isCodeCopied ? <CheckIcon className="w-4 h-4 mr-1 text-green-400" /> : <DocumentDuplicateIcon className="w-4 h-4 mr-1" />}
              {isCodeCopied ? 'コピーしました' : 'コードをコピー'}
            </button>
            <textarea
              readOnly
              rows={15}
              className="w-full p-4 bg-gray-900 border-gray-700 rounded-md shadow-sm transition-colors duration-200 text-gray-300 placeholder-gray-500 font-mono text-sm border-none focus:ring-0 resize-none"
              value={gasCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [rawNotes, setRawNotes] = useState<string>('');
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [enhancedOutput, setEnhancedOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<'markdown' | 'ai' | null>(null);
  
  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('url');
  const [slideUrl, setSlideUrl] = useState('');
  const [modalSlideId, setModalSlideId] = useState<string | null>(null);

  const handleExtractNotes = () => {
    setError(null);
    const regex = /presentation\/d\/([a-zA-Z0-9_-]+)/;
    const match = slideUrl.match(regex);
    if (match && match[1]) {
      setModalSlideId(match[1]);
    } else {
      setError("無効なGoogleスライドURLです。有効なリンクであることを確認してください。");
    }
  };

  const handleConvert = useCallback(() => {
    setError(null);
    setMarkdownOutput('');
    setEnhancedOutput('');

    if (!rawNotes.trim()) {
      setError("最初にノートを貼り付けてください。");
      return;
    }

    const slides = rawNotes.split(/\n---\n/).filter(slide => slide.trim() !== '');
    
    if (slides.length === 0) {
        setError("有効なスライドの内容が見つかりません。各スライドが'---'（それぞれが新しい行にあること）で区切られていることを確認してください。");
        return;
    }

    const formattedMarkdown = slides.map((note, index) => {
      return `## スライド ${index + 1}\n\n${note.trim()}`;
    }).join('\n\n---\n\n');

    setMarkdownOutput(formattedMarkdown);
  }, [rawNotes]);

  const handleEnhance = useCallback(async () => {
    if (!markdownOutput) {
      setError("最初にノートをマークダウンに変換してください。");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEnhancedOutput('');

    try {
      const result = await enhanceNotesWithGemini(markdownOutput);
      setEnhancedOutput(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("不明なエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  }, [markdownOutput]);

  const handleCopy = useCallback((text: string, section: 'markdown' | 'ai') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans">
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            スライドのノートをマークダウンへ
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Googleスライドのスピーカーノートを簡単に変換・AIで強化。
          </p>
        </header>

        {modalSlideId && <GasHelperModal slideId={modalSlideId} onClose={() => setModalSlideId(null)} />}

        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <div className="flex border-b border-gray-700">
                <button onClick={() => setActiveTab('url')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'url' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                    GoogleスライドURLから
                </button>
                <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'manual' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                    手動で貼り付け
                </button>
            </div>

            <div className="mt-6">
                {activeTab === 'url' ? (
                    <div className="space-y-4">
                        <label htmlFor="url-input" className="block text-sm font-medium text-gray-400">
                            GoogleスライドのURLをここに貼り付けてください：
                        </label>
                        <input
                            id="url-input"
                            type="url"
                            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
                            placeholder="https://docs.google.com/presentation/d/..."
                            value={slideUrl}
                            onChange={(e) => setSlideUrl(e.target.value)}
                        />
                        <button
                            onClick={handleExtractNotes}
                            disabled={!slideUrl}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            抽出スクリプトを取得
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label htmlFor="notes-input" className="block text-sm font-medium text-gray-400">
                            スピーカーノートをここに貼り付けてください：
                        </label>
                        <textarea
                            id="notes-input"
                            rows={10}
                            className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-200 placeholder-gray-500"
                            placeholder="スライド1のノート...&#10;---&#10;スライド2のノート..."
                            value={rawNotes}
                            onChange={(e) => setRawNotes(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>


        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleConvert}
            disabled={activeTab === 'manual' && !rawNotes}
            className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-gray-600 disabled:transform-none disabled:cursor-not-allowed"
          >
            マークダウンに変換
          </button>
          <button
            onClick={handleEnhance}
            disabled={!markdownOutput || isLoading}
            className="w-full sm:w-auto flex-1 flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <LoadingSpinnerIcon className="w-5 h-5 mr-2 animate-spin" />
                強化中...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2" />
                AIで強化
              </>
            )}
          </button>
        </div>

        {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg">
                <strong>エラー：</strong> {error}
            </div>
        )}

        {markdownOutput && (
          <OutputBlock
            title="整形済みマークダウン"
            content={markdownOutput}
            onCopy={() => handleCopy(markdownOutput, 'markdown')}
            isCopied={copiedSection === 'markdown'}
          />
        )}

        {enhancedOutput && (
          <OutputBlock
            title="AIによる要約"
            content={enhancedOutput}
            onCopy={() => handleCopy(enhancedOutput, 'ai')}
            isCopied={copiedSection === 'ai'}
            icon={<SparklesIcon className="w-5 h-5 text-teal-400" />}
          />
        )}
      </main>
      <footer className="text-center py-6 text-sm text-gray-600">
        <p>Gemini API を利用しています</p>
      </footer>
    </div>
  );
};

export default App;
'use client';

import { useEffect, useRef, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DragDropData {
  items: string[];
  categories: string[];
  answers: Record<string, string>;
}

interface TimelineEvent {
  label: string;
  year: string;
  fact: string;
}

interface LabelDiagramLabel {
  id: number;
  x: number;
  y: number;
  answer: string;
  hint: string;
}

interface FlashCard {
  front: string;
  back: string;
}

interface WordScrambleWord {
  scrambled: string;
  answer: string;
  hint: string;
}

interface FillBlanksData {
  sentence: string;
  blanks: string[];
}

interface MatchPair {
  term: string;
  match: string;
}

interface SortingData {
  prompt: string;
  items: string[];
  correct: number[];
}

interface MapTapData {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface FormulaBuilderData {
  formula: string;
  components: string[];
  explanation: string;
}

interface InteractiveElementData {
  type: string;
  title: string;
  description: string;
  data:
    | { items: string[]; categories: string[]; answers: Record<string, string> }
    | { events: TimelineEvent[] }
    | { image: string; labels: LabelDiagramLabel[] }
    | { cards: FlashCard[] }
    | { words: WordScrambleWord[] }
    | FillBlanksData
    | { pairs: MatchPair[] }
    | SortingData
    | MapTapData
    | FormulaBuilderData;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DragDrop({ data, onComplete }: { data: DragDropData; onComplete?: () => void }) {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const unplaced = data.items.filter(i => !placements[i]);
  const score = Object.entries(placements).filter(([k, v]) => data.answers[k] === v).length;

  return (
    <div className="space-y-4">
      {/* Unplaced items */}
      <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        {unplaced.length === 0 && <span className="text-gray-400 text-sm">All items placed!</span>}
        {unplaced.map(item => (
          <div
            key={item}
            draggable
            onDragStart={() => setDragItem(item)}
            onClick={() => setDragItem(dragItem === item ? null : item)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-grab active:cursor-grabbing select-none transition-all ${
              dragItem === item
                ? 'bg-indigo-600 text-white scale-105 shadow-lg'
                : 'bg-white border-2 border-indigo-200 text-indigo-800 hover:border-indigo-400'
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 gap-3">
        {data.categories.map(cat => {
          const itemsHere = Object.entries(placements).filter(([, v]) => v === cat).map(([k]) => k);
          return (
            <div
              key={cat}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (dragItem) {
                  setPlacements(p => ({ ...p, [dragItem]: cat }));
                  setDragItem(null);
                  setChecked(false);
                }
              }}
              onClick={() => {
                if (dragItem) {
                  setPlacements(p => ({ ...p, [dragItem]: cat }));
                  setDragItem(null);
                  setChecked(false);
                }
              }}
              className={`p-3 rounded-xl border-2 transition-all min-h-[60px] ${
                dragItem ? 'border-indigo-400 bg-indigo-50 scale-[1.01]' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {itemsHere.map(item => (
                  <div
                    key={item}
                    onClick={e => {
                      e.stopPropagation();
                      setPlacements(p => { const n = { ...p }; delete n[item]; return n; });
                      setChecked(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
                      checked
                        ? data.answers[item] === cat
                          ? 'bg-green-100 border-2 border-green-400 text-green-800'
                          : 'bg-red-100 border-2 border-red-400 text-red-800'
                        : 'bg-white border-2 border-indigo-200 text-indigo-800'
                    }`}
                  >
                    {item} {checked && (data.answers[item] === cat ? '✓' : '✗')}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setChecked(true);
            const currentScore = Object.entries(placements).filter(([k, v]) => data.answers[k] === v).length;
            if (currentScore === data.items.length) onComplete?.();
          }}
          disabled={unplaced.length > 0}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40 active:scale-95 transition-all"
        >
          Check Answers
        </button>
        <button
          onClick={() => { setPlacements({}); setChecked(false); }}
          className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold active:scale-95 transition-all"
        >
          Reset
        </button>
      </div>
      {checked && (
        <p className="text-center font-bold text-lg">
          {score === data.items.length ? '🎉 Perfect!' : `${score}/${data.items.length} correct`}
        </p>
      )}
    </div>
  );
}

function Timeline({ data, onComplete }: { data: { events: TimelineEvent[] }; onComplete?: () => void }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-200" />
      <div className="space-y-4">
        {data.events.map((ev, i) => (
          <div key={i} className="flex gap-4 pl-2">
            <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
              {ev.year.slice(-2)}
            </div>
            <button
              onClick={() => setRevealed(r => {
                const n = new Set(r);
                n.has(i) ? n.delete(i) : n.add(i);
                if (n.size === data.events.length) onComplete?.();
                return n;
              })}
              className="flex-1 text-left p-3 bg-white rounded-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all active:scale-[0.99]"
            >
              <p className="text-xs text-indigo-500 font-semibold">{ev.year}</p>
              <p className="font-semibold text-gray-800 text-sm">{ev.label}</p>
              {revealed.has(i) && (
                <p className="text-gray-600 text-xs mt-1 leading-relaxed">{ev.fact}</p>
              )}
              {!revealed.has(i) && (
                <p className="text-indigo-400 text-xs mt-1">Tap to learn more →</p>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabelDiagram({ data, onComplete }: { data: { image: string; labels: LabelDiagramLabel[] }; onComplete?: () => void }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const allRevealed = revealed.size === data.labels.length;
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 italic text-center">{data.image}</p>
      <div className="grid grid-cols-1 gap-2">
        {data.labels.map(label => (
          <button
            key={label.id}
            onClick={() => setRevealed(r => {
              const n = new Set(r);
              n.has(label.id) ? n.delete(label.id) : n.add(label.id);
              if (n.size === data.labels.length) onComplete?.();
              return n;
            })}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-[0.99] ${
              revealed.has(label.id)
                ? 'bg-green-50 border-green-300'
                : 'bg-gray-50 border-gray-200 hover:border-indigo-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              revealed.has(label.id) ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-600'
            }`}>
              {label.id}
            </div>
            <div className="flex-1">
              {revealed.has(label.id) ? (
                <p className="font-bold text-green-800">{label.answer}</p>
              ) : (
                <p className="text-gray-400 text-sm">{label.hint}</p>
              )}
            </div>
            <span className="text-gray-400 text-sm">{revealed.has(label.id) ? '✓' : '?'}</span>
          </button>
        ))}
      </div>
      {allRevealed && <p className="text-center text-green-600 font-bold">🎉 All labels revealed!</p>}
    </div>
  );
}

function Flashcards({ data, onComplete }: { data: { cards: FlashCard[] }; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState<Set<number>>(new Set());
  const card = data.cards[index];

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-500">
        <span>{index + 1} / {data.cards.length}</span>
        <span>{done.size} mastered</span>
      </div>

      <button
        onClick={() => setFlipped(f => !f)}
        className="w-full min-h-[140px] rounded-2xl shadow-lg transition-all active:scale-[0.98] relative"
        style={{ perspective: '1000px' }}
      >
        <div className={`w-full h-full rounded-2xl p-6 flex items-center justify-center text-center transition-all duration-300 ${
          flipped
            ? 'bg-indigo-600 text-white'
            : 'bg-white border-2 border-indigo-200 text-gray-800'
        }`}>
          <div>
            <p className="text-xs uppercase tracking-wide mb-2 opacity-60">{flipped ? 'Answer' : 'Question'}</p>
            <p className="text-base font-semibold leading-relaxed">{flipped ? card.back : card.front}</p>
          </div>
        </div>
      </button>

      <p className="text-center text-xs text-gray-400">Tap card to flip</p>

      <div className="flex gap-3">
        <button
          onClick={() => {
            setDone(d => {
              const n = new Set(d);
              n.add(index);
              if (n.size === data.cards.length) onComplete?.();
              return n;
            });
            setIndex(i => (i + 1) % data.cards.length);
            setFlipped(false);
          }}
          className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-semibold active:scale-95 transition-all"
        >
          ✓ Got it
        </button>
        <button
          onClick={() => { setIndex(i => (i + 1) % data.cards.length); setFlipped(false); }}
          className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold active:scale-95 transition-all"
        >
          → Next
        </button>
      </div>
    </div>
  );
}

function WordScramble({ data, onComplete }: { data: { words: WordScrambleWord[] }; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const word = data.words[index];

  const check = () => {
    const ok = input.trim().toUpperCase() === word.answer.toUpperCase();
    setResult(ok ? 'correct' : 'wrong');
    if (ok) onComplete?.();
  };

  const next = () => {
    setIndex(i => (i + 1) % data.words.length);
    setInput('');
    setResult(null);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-indigo-50 rounded-xl text-center">
        <p className="text-xs text-indigo-500 mb-1">Hint: {word.hint}</p>
        <p className="text-3xl font-bold tracking-[0.3em] text-indigo-800">
          {word.scrambled.split('').join(' ')}
        </p>
      </div>
      <input
        type="text"
        value={input}
        onChange={e => { setInput(e.target.value.toUpperCase()); setResult(null); }}
        placeholder="Type your answer..."
        className="w-full p-3 border-2 border-gray-200 rounded-xl text-center text-lg font-bold uppercase focus:border-indigo-400 focus:outline-none"
        onKeyDown={e => e.key === 'Enter' && check()}
      />
      {result === 'correct' && <p className="text-center text-green-600 font-bold text-lg">🎉 Correct! Well done!</p>}
      {result === 'wrong' && <p className="text-center text-red-500 font-bold">Not quite... try again!</p>}
      {result === 'correct' && data.words.length > 1 && (
        <button onClick={next} className="w-full py-2.5 bg-green-500 text-white rounded-xl font-semibold">Next Word →</button>
      )}
      {result !== 'correct' && (
        <button onClick={check} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-semibold active:scale-95 transition-all">
          Check Answer
        </button>
      )}
    </div>
  );
}

function FillBlanks({ data, onComplete }: { data: FillBlanksData; onComplete?: () => void }) {
  const parts = data.sentence.split('___');
  const [inputs, setInputs] = useState<string[]>(data.blanks.map(() => ''));
  const [checked, setChecked] = useState(false);
  const score = inputs.filter((v, i) => v.trim().toLowerCase() === data.blanks[i].toLowerCase()).length;

  return (
    <div className="space-y-4">
      <div className="p-5 bg-white rounded-2xl border-2 border-violet-100 shadow-sm text-base leading-loose text-gray-900 font-medium">
        {parts.map((part, i) => (
          <span key={i}>
            <span className="text-gray-900">{part}</span>
            {i < data.blanks.length && (
              <input
                type="text"
                value={inputs[i]}
                onChange={e => { const n = [...inputs]; n[i] = e.target.value; setInputs(n); setChecked(false); }}
                placeholder="..."
                className={`inline-block w-32 mx-2 px-3 py-1 border-2 text-center font-bold focus:outline-none rounded-xl text-sm transition-all ${
                  checked
                    ? inputs[i].trim().toLowerCase() === data.blanks[i].toLowerCase()
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-red-400 bg-red-50 text-red-800'
                    : 'border-indigo-400 bg-indigo-50 text-indigo-900 focus:border-indigo-600 focus:bg-white'
                }`}
              />
            )}
          </span>
        ))}
      </div>
      <button
        onClick={() => {
          setChecked(true);
          const currentScore = inputs.filter((v, i) => v.trim().toLowerCase() === data.blanks[i].toLowerCase()).length;
          if (currentScore === data.blanks.length) onComplete?.();
        }}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold text-base active:scale-95 transition-all shadow-lg shadow-indigo-200"
      >
        Check Answers
      </button>
      {checked && (
        <div className={`text-center p-4 rounded-2xl border-2 ${score === data.blanks.length ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
          <p className={`font-bold text-lg ${score === data.blanks.length ? 'text-green-700' : 'text-amber-700'}`}>
            {score === data.blanks.length ? '🎉 Perfect!' : `${score}/${data.blanks.length} correct`}
          </p>
          {score < data.blanks.length && (
            <p className="text-sm text-gray-600 mt-1">✅ Answers: <span className="font-semibold text-gray-800">{data.blanks.join(', ')}</span></p>
          )}
        </div>
      )}
    </div>
  );
}

function MatchPairs({ data, onComplete }: { data: { pairs: MatchPair[] }; onComplete?: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const terms = data.pairs.map(p => p.term);
  const matchOptions = [...data.pairs.map(p => p.match)].sort(() => Math.random() - 0.5);
  const [shuffled] = useState(matchOptions);

  const score = Object.entries(matches).filter(([term, match]) =>
    data.pairs.find(p => p.term === term && p.match === match)
  ).length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase text-center">Terms</p>
          {terms.map(term => (
            <button
              key={term}
              onClick={() => { if (!matches[term]) { setSelected(s => s === term ? null : term); setChecked(false); }}}
              className={`w-full p-2.5 rounded-xl text-sm font-medium text-left transition-all active:scale-[0.98] ${
                matches[term]
                  ? checked
                    ? data.pairs.find(p => p.term === term && p.match === matches[term])
                      ? 'bg-green-100 border-2 border-green-400 text-green-800'
                      : 'bg-red-100 border-2 border-red-400 text-red-800'
                    : 'bg-indigo-100 border-2 border-indigo-300 text-indigo-800'
                  : selected === term
                  ? 'bg-indigo-600 text-white border-2 border-indigo-600'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-200'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase text-center">Matches</p>
          {shuffled.map(match => {
            const matchedTerm = Object.entries(matches).find(([, v]) => v === match)?.[0];
            return (
              <button
                key={match}
                onClick={() => {
                  if (selected && !matchedTerm) {
                    setMatches(m => ({ ...m, [selected]: match }));
                    setSelected(null);
                    setChecked(false);
                  }
                }}
                className={`w-full p-2.5 rounded-xl text-sm font-medium text-left transition-all active:scale-[0.98] ${
                  matchedTerm
                    ? 'bg-indigo-100 border-2 border-indigo-300 text-indigo-800 cursor-default'
                    : selected
                    ? 'bg-white border-2 border-indigo-400 text-gray-700 hover:bg-indigo-50'
                    : 'bg-white border-2 border-gray-200 text-gray-700'
                }`}
              >
                {match}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => {
          setChecked(true);
          const currentScore = Object.entries(matches).filter(([term, match]) =>
            data.pairs.find(p => p.term === term && p.match === match)
          ).length;
          if (currentScore === data.pairs.length) onComplete?.();
        }} disabled={Object.keys(matches).length < data.pairs.length}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40 active:scale-95 transition-all">
          Check
        </button>
        <button onClick={() => { setMatches({}); setSelected(null); setChecked(false); }}
          className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold active:scale-95">
          Reset
        </button>
      </div>
      {checked && <p className="text-center font-bold text-lg">{score === data.pairs.length ? '🎉 Perfect!' : `${score}/${data.pairs.length} correct`}</p>}
    </div>
  );
}

function FormulaBuilder({ data, onComplete }: { data: FormulaBuilderData; onComplete?: () => void }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const shuffled = useState([...data.components].sort(() => Math.random() - 0.5))[0];
  const remaining = shuffled.filter(c => !placed.includes(c));
  const isCorrect = placed.join(' ') === data.components.join(' ');

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div className="min-h-[56px] p-3 bg-indigo-50 rounded-xl border-2 border-dashed border-indigo-300 flex flex-wrap gap-2 items-center">
        {placed.length === 0 && <span className="text-indigo-300 text-sm">Tap pieces below to build the formula</span>}
        {placed.map((c, i) => (
          <button key={i} onClick={() => { setPlaced(p => p.filter((_, j) => j !== i)); setChecked(false); }}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold active:scale-95">
            {c}
          </button>
        ))}
      </div>
      {/* Pieces */}
      <div className="flex flex-wrap gap-2">
        {remaining.map((c, i) => (
          <button key={i} onClick={() => { setPlaced(p => [...p, c]); setChecked(false); }}
            className="px-3 py-1.5 bg-white border-2 border-indigo-200 text-indigo-800 rounded-lg text-sm font-bold hover:border-indigo-400 active:scale-95 transition-all">
            {c}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => {
          setChecked(true);
          if (placed.join(' ') === data.components.join(' ')) onComplete?.();
        }} disabled={placed.length !== data.components.length}
          className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold disabled:opacity-40 active:scale-95 transition-all">
          Check
        </button>
        <button onClick={() => { setPlaced([]); setChecked(false); }}
          className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold active:scale-95">
          Reset
        </button>
      </div>
      {checked && (
        <div className="text-center space-y-1">
          <p className="font-bold text-lg">{isCorrect ? '🎉 Correct!' : '❌ Not quite, try again'}</p>
          {isCorrect && <p className="text-sm text-gray-600 italic">{data.explanation}</p>}
          {!isCorrect && <p className="text-xs text-gray-400">Correct: {data.formula}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function InteractiveElement({
  element,
  onComplete,
}: {
  element: InteractiveElementData;
  onComplete?: () => Promise<void> | void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);

  const handleComplete = async () => {
    if (!onComplete || activityCompleted || isSavingCompletion) return;

    try {
      setIsSavingCompletion(true);
      await onComplete();
      setActivityCompleted(true);
    } catch (error) {
      console.error('Failed to save interactive activity completion:', error);
      alert('Could not save interactive activity progress. Please try again.');
    } finally {
      setIsSavingCompletion(false);
    }
  };

  if (dismissed) return null;

  const renderActivity = () => {
    switch (element.type) {
      case 'drag-drop':
        return <DragDrop data={element.data as DragDropData} onComplete={handleComplete} />;
      case 'timeline':
        return <Timeline data={element.data as { events: TimelineEvent[] }} onComplete={handleComplete} />;
      case 'label-diagram':
        return <LabelDiagram data={element.data as { image: string; labels: LabelDiagramLabel[] }} onComplete={handleComplete} />;
      case 'quiz-flashcard':
        return <Flashcards data={element.data as { cards: FlashCard[] }} onComplete={handleComplete} />;
      case 'word-scramble':
        return <WordScramble data={element.data as { words: WordScrambleWord[] }} onComplete={handleComplete} />;
      case 'fill-blanks':
        return <FillBlanks data={element.data as FillBlanksData} onComplete={handleComplete} />;
      case 'match-pairs':
        return <MatchPairs data={element.data as { pairs: MatchPair[] }} onComplete={handleComplete} />;
      case 'formula-builder':
        return <FormulaBuilder data={element.data as FormulaBuilderData} onComplete={handleComplete} />;
      default:
        return <p className="text-gray-500 text-sm">Interactive activity coming soon!</p>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <h3 className="text-white font-extrabold text-lg">{element.title}</h3>
            </div>
            <p className="text-blue-100 text-sm mt-0.5">{element.description}</p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-blue-200 hover:text-white text-2xl leading-none font-light">×</button>
        </div>
      </div>
      {/* Body */}
      <div className="p-6 space-y-4">
        {renderActivity()}

        {onComplete && (
          <button
            onClick={handleComplete}
            disabled={activityCompleted || isSavingCompletion}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
              activityCompleted
                ? 'bg-green-50 text-green-700 border-2 border-green-200 cursor-default'
                : isSavingCompletion
                ? 'bg-indigo-300 text-white cursor-wait'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 active:scale-95'
            }`}
          >
            {activityCompleted
              ? '✅ Activity completed!'
              : isSavingCompletion
              ? 'Saving...'
              : '✅ Mark complete'}
          </button>
        )}
      </div>
    </div>
  );
}

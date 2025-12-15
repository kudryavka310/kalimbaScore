import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PIXELS_PER_BEAT = 48;
const OCTAVE_SHIFT = 0;
const A4_FREQUENCY = 440;
const NOTE_OFFSETS_FROM_A = {
  C: -9,
  'C#': -8,
  DB: -8,
  D: -7,
  'D#': -6,
  EB: -6,
  E: -5,
  F: -4,
  'F#': -3,
  GB: -3,
  G: -2,
  'G#': -1,
  AB: -1,
  A: 0,
  'A#': 1,
  BB: 1,
  B: 2,
};

const KALIMBA_TINES = [
  { note: 'D', octave: 6, degree: '2' },
  { note: 'B', octave: 5, degree: '7' },
  { note: 'G', octave: 5, degree: '5' },
  { note: 'E', octave: 5, degree: '3' },
  { note: 'C', octave: 5, degree: '1' },
  { note: 'A', octave: 4, degree: '6' },
  { note: 'F', octave: 4, degree: '4' },
  { note: 'D', octave: 4, degree: '2' },
  { note: 'C', octave: 4, degree: '1' },
  { note: 'E', octave: 4, degree: '3' },
  { note: 'G', octave: 4, degree: '5' },
  { note: 'B', octave: 4, degree: '7' },
  { note: 'D', octave: 5, degree: '2' },
  { note: 'F', octave: 5, degree: '4' },
  { note: 'A', octave: 5, degree: '6' },
  { note: 'C', octave: 6, degree: '1' },
  { note: 'E', octave: 6, degree: '3' },
];

function noteToFrequency(note, octave) {
  if (!note || typeof octave !== 'number') return null;
  const key = note.toUpperCase();
  const semitoneFromA4 = (octave - 4) * 12 + (NOTE_OFFSETS_FROM_A[key] ?? 0);
  return A4_FREQUENCY * Math.pow(2, semitoneFromA4 / 12);
}

function scheduleNote(ctx, destination, frequency, startTime, durationSeconds, style) {
  if (!ctx || !Number.isFinite(frequency)) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const attack = 0.008;
  const release = 0.18;
  const sustainDuration = Math.max(durationSeconds, 0.08);
  const isAccent = style === 'accent';
  const isHollow = style === 'hollow';
  const peak = isAccent ? 0.4 : 0.28;

  osc.type = isHollow ? 'triangle' : 'sine';
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(peak, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + sustainDuration + release,
  );

  osc.connect(gain);
  gain.connect(destination ?? ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + sustainDuration + release + 0.05);
}

function useKalimbaPlayer(tineFrequencies) {
  const ctxRef = useRef(null);
  const stopTimerRef = useRef(null);
  const masterGainRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const startAtRef = useRef(null);
  const beatSecondsRef = useRef(null);

  const stop = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    masterGainRef.current = null;
    startAtRef.current = null;
    beatSecondsRef.current = null;
    setIsPlaying(false);
  }, []);

  const setVolume = useCallback((value) => {
    const vol = Math.min(Math.max(value ?? 0, 0), 1);
    if (masterGainRef.current && ctxRef.current) {
      masterGainRef.current.gain.setValueAtTime(vol, ctxRef.current.currentTime);
    }
  }, []);

  const play = useCallback(
    (notes, tempo, totalBeatsHint = 0, volume = 1) => {
      if (!Array.isArray(notes) || !notes.length) {
        return;
      }

      stop();

      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const masterGain = ctx.createGain();
      const safeVolume = Math.min(Math.max(volume ?? 1, 0), 1);
      masterGain.gain.value = safeVolume;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;
      const beatSeconds = 60 / Math.max(tempo || 1, 1);
      beatSecondsRef.current = beatSeconds;
      const startAt = ctx.currentTime + 0.1;
      startAtRef.current = startAt;
      const scoreBeats = Math.max(
        totalBeatsHint,
        Math.max(...notes.map((note) => note.start + note.duration)),
      );

      notes.forEach((note) => {
        const noteFrequency = tineFrequencies[note.tine];
        const noteStart = startAt + note.start * beatSeconds;
        const noteDuration = note.duration * beatSeconds;
        scheduleNote(ctx, masterGain, noteFrequency, noteStart, noteDuration, note.style);
      });

      stopTimerRef.current = setTimeout(() => {
        stop();
      }, (scoreBeats * beatSeconds + 0.5) * 1000);

      setIsPlaying(true);
    },
    [stop, tineFrequencies],
  );

  useEffect(() => () => stop(), [stop]);

  const getCurrentBeat = useCallback(() => {
    if (
      !isPlaying ||
      !ctxRef.current ||
      startAtRef.current == null ||
      !beatSecondsRef.current
    ) {
      return 0;
    }
    const elapsed = ctxRef.current.currentTime - startAtRef.current;
    return Math.max(0, elapsed / beatSecondsRef.current);
  }, [isPlaying]);

  return { play, stop, isPlaying, setVolume, getCurrentBeat };
}

function KalimbaScore({ score }) {
  const scrollRef = useRef(null);
  const beatsPerMeasure = score.timeSignature.beats;
  const fallbackBeats = score.notes.length
    ? Math.max(...score.notes.map((note) => note.start + note.duration))
    : beatsPerMeasure;
  const totalBeats = score.totalBeats ? score.totalBeats : fallbackBeats;
  const measureCount = Math.ceil(totalBeats / beatsPerMeasure);
  const gridHeight = totalBeats * PIXELS_PER_BEAT;

  const notesByTine = KALIMBA_TINES.map((_, index) =>
    score.notes.filter((note) => note.tine === index),
  );

  const tineFrequencies = useMemo(
    () => KALIMBA_TINES.map((tine) => noteToFrequency(tine.note, tine.octave + OCTAVE_SHIFT)),
    [],
  );

  const [volume, setVolume] = useState(1);
  const { play, stop, isPlaying, setVolume: setPlayerVolume, getCurrentBeat } =
    useKalimbaPlayer(tineFrequencies);

  const handleVolumeChange = (event) => {
    const value = Number(event.target.value);
    const clamped = Math.min(Math.max(value, 0), 1);
    setVolume(clamped);
    setPlayerVolume(clamped);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gridHeight, score]);

  useEffect(() => {
    if (!isPlaying || !scrollRef.current) {
      return;
    }
    let rafId;
    const scrollEl = scrollRef.current;
    const tick = () => {
      const beatPos = getCurrentBeat();
      const baseBottom = scrollEl.scrollHeight - scrollEl.clientHeight;
      const target = Math.max(0, baseBottom - beatPos * PIXELS_PER_BEAT);
      scrollEl.scrollTop = target;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [getCurrentBeat, isPlaying]);

  return (
    <section className="kalimba-score">
      <div className="score-meta">
        <div>
          <p className="score-title">{score.title}</p>
          {score.subtitle ? <p className="score-subtitle">{score.subtitle}</p> : null}
        </div>
        <div className="score-info">
          <span>
            {score.timeSignature.beats}/{score.timeSignature.noteValue}
          </span>
          <span>{score.tempo} BPM</span>
          <span>{score.scale} key</span>
        </div>
        <div className="score-controls">
          <button
            type="button"
            className={`score-play${isPlaying ? ' is-playing' : ''}`}
            onClick={() =>
              isPlaying
                ? stop()
                : play(
                    score.notes,
                    score.tempo,
                    totalBeats,
                    volume,
                  )
            }
          >
            {isPlaying ? '停止' : '再生'}
          </button>
          <label className="score-volume">
            <span>音量</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="音量"
            />
          </label>
        </div>
      </div>
      <div className="score-surface">
        <div ref={scrollRef} className="score-scroll">
          <div className="measure-rail" style={{ height: gridHeight }}>
            {Array.from({ length: measureCount }).map((_, index) => (
              <div
                key={`measure-${index + 1}`}
                className="measure-block"
                style={{ height: PIXELS_PER_BEAT * beatsPerMeasure }}
              >
                <span>{index + 1}</span>
              </div>
            ))}
          </div>
          <div
            className="grid-wrapper"
            style={{
              height: gridHeight,
              '--px-per-beat': `${PIXELS_PER_BEAT}px`,
              '--beats-per-measure': beatsPerMeasure,
              '--tine-count': KALIMBA_TINES.length,
            }}
          >
            <div className="score-grid">
              {notesByTine.map((trackNotes, tineIndex) => (
                <div key={KALIMBA_TINES[tineIndex].note + tineIndex} className="tine-track">
                  {trackNotes.map((note) => {
                    const noteHeight = Math.max(note.duration * PIXELS_PER_BEAT - 6, 18);
                    const noteTop = gridHeight - (note.start + note.duration) * PIXELS_PER_BEAT;

                    return (
                      <div
                        key={note.id}
                        className={`note note-${note.style ?? 'solid'}`}
                        style={{
                          top: noteTop,
                          height: noteHeight,
                        }}
                      >
                        <span>{note.label}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="score-footer">
          <div className="footer-spacer" aria-hidden />
          <div className="tine-footer" style={{ '--tine-count': KALIMBA_TINES.length }}>
            {KALIMBA_TINES.map((tine, index) => (
              <div key={`label-${tine.note}-${index}`} className="tine-label">
                <span className="degree">{tine.degree}</span>
                <span className="note-name">
                  {tine.note}
                  <small>{tine.octave + OCTAVE_SHIFT}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default KalimbaScore;

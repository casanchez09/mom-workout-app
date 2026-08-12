import { useState, useEffect, useRef } from "react";
import { ChevronDown, Play, CircleCheck, Circle, Home as HomeIcon, Dumbbell, Sun, Clock, ExternalLink, RotateCcw, Copy, StickyNote, Check } from "lucide-react";

// ─── STORAGE ─────────────────────────────────────────────────────────────
const DATA_KEY = "momfit_data_v1";
const HISTORY_KEY = "momfit_history_v1";
const LOC_KEY = "momfit_location_v1";

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// ─── PROGRAM DATA ────────────────────────────────────────────────────────
const DAYS = [
  {
    id: "day1",
    label: "Day 1",
    title: "Full-Body Strength",
    subtitle: "Bone-loading focus",
    color: "#E0824A",
    type: "strength",
    hasLocation: true,
  },
  {
    id: "day2",
    label: "Day 2",
    title: "Hip & Back Mobility",
    subtitle: "Mobility — or swap for a vest walk",
    color: "#7F9E82",
    type: "mobility",
    hasLocation: false,
    hasActivityToggle: true,
  },
  {
    id: "day3",
    label: "Day 3",
    title: "Lower Body + Stretch",
    subtitle: "Strength + cooldown",
    color: "#A97DA0",
    type: "strength",
    hasLocation: true,
  },
  {
    id: "day4",
    label: "Day 4",
    title: "Standing Mobility",
    subtitle: "Mobility — or swap for a vest walk",
    color: "#6B9AA8",
    type: "mobility",
    hasLocation: false,
    hasActivityToggle: true,
  },
  {
    id: "day5",
    label: "Day 5",
    title: "Upper Body + Core",
    subtitle: "Strength — optional 3rd day",
    color: "#D4A24C",
    type: "strength",
    hasLocation: true,
    optional: true,
  },
];

// Each day is an array of BLOCKS. A block is either:
//   type: "superset" — 2 exercises done back-to-back, alternating, for N rounds
//   type: "solo"      — 1 exercise, done as straight sets before moving on
//   type: "flow"       — a sequence with no meaningful rest (stretches, warm-up)
const BLOCKS = {
  day1: [
    {
      id: "d1_A", type: "superset",
      restBetweenMoves: "15-20 sec — just enough to switch weights",
      restBetweenRounds: "60-90 sec after finishing both moves",
      exercises: [
        {
          id: "d1_squat", label: "1A", name: "Goblet Squat", sets: 3, reps: "10-12",
          muscles: "Quads + Glutes",
          tip: "Hold the weight at chest height, sit your hips back, keep your chest tall. Go as low as feels comfortable.",
          weightGuide: "8-10 lb dumbbell — once that feels easy, add the weighted vest",
          video: "https://www.youtube.com/watch?v=JO7D6GJ98wY",
          gymVariant: {
            name: "Leg Press",
            reps: "12-15",
            tip: "Feet shoulder-width on the platform, lower until knees hit about 90°, press through your heels. The seat back supports your spine, so it's a good option for going heavier.",
            weightGuide: "Start on a lighter pin setting, add weight once form feels solid",
            video: "https://www.youtube.com/watch?v=ETOAyWM6i6A",
          },
        },
        {
          id: "d1_press", label: "1B", name: "Standing Shoulder Press", sets: 3, reps: "10",
          muscles: "Shoulders + Triceps",
          tip: "Press straight up overhead, avoid arching your lower back. Exhale as you push.",
          weightGuide: "6-10 lb dumbbells",
          video: "https://www.youtube.com/watch?v=6eDlfTDb7Po",
          gymVariant: { weightGuide: "8-10 lb dumbbells" },
        },
      ],
    },
    {
      id: "d1_B", type: "superset",
      restBetweenMoves: "15-20 sec — just enough to switch weights",
      restBetweenRounds: "60-90 sec after finishing both moves",
      exercises: [
        {
          id: "d1_row", label: "2A", name: "Bent-Over Row", sets: 3, reps: "12",
          muscles: "Back + Biceps",
          tip: "Hinge at the hips, keep your back flat, pull your elbows straight back. With the tube band, stand on the center and hinge forward before pulling.",
          weightGuide: "Red tube band with handles, or 8-10 lb dumbbells",
          video: "https://www.youtube.com/watch?v=6TSP1TRMUzs",
          gymVariant: {
            name: "Seated Cable Row",
            reps: "12",
            tip: "Sit tall, pull the handle to your stomach, squeeze your shoulder blades together, control the return.",
            weightGuide: "Start on a light-to-moderate stack setting",
            video: "https://www.youtube.com/watch?v=EU7bOadUsNI",
          },
        },
        {
          id: "d1_bridge", label: "2B", name: "Glute Bridge (loaded)", sets: 3, reps: "12",
          muscles: "Glutes + Hamstrings",
          tip: "Squeeze your glutes hard at the top. Don't overarch your lower back.",
          weightGuide: "Weighted vest, or a dumbbell across hips",
          video: "https://www.youtube.com/watch?v=wPM8icPu6H8",
          gymVariant: { weightGuide: "Heavier dumbbell across hips" },
        },
      ],
    },
    {
      id: "d1_C", type: "superset",
      restBetweenMoves: "15-20 sec — just enough to switch position",
      restBetweenRounds: "60-90 sec after finishing both moves",
      exercises: [
        {
          id: "d1_pushup", label: "3A", name: "Wall or Knee Push-Up", sets: 3, reps: "10-12",
          muscles: "Chest + Triceps",
          tip: "Keep a straight line from head to knees (or hands to feet if against a wall).",
          weightGuide: "Bodyweight — add the weighted vest once this feels easy",
          video: "https://www.youtube.com/watch?v=z8nUnCdZXQI",
          gymVariant: { weightGuide: "Bodyweight — use a bench for an easier incline version" },
        },
        {
          id: "d1_carry", label: "3B", name: "Farmer's Carry", sets: 3, reps: "30 sec walk",
          muscles: "Grip + Core + Full Body",
          tip: "Stand tall, shoulders back, walk with control — no leaning side to side.",
          weightGuide: "2 dumbbells (up to 10 lb each), or wear the weighted vest for extra load",
          video: "https://www.youtube.com/watch?v=z7E_YU9P1jU", isTimed: true, timedSeconds: 30,
        },
      ],
    },
  ],
  day2: [
    {
      id: "d2_warmup", type: "solo",
      restBetweenSets: "No rest needed — move right into the next round",
      exercises: [
        { id: "d2_catcow", label: "1", name: "Cat-Cow", sets: 1, reps: "8-10 reps", tip: "Move slowly with your breath — inhale as you arch, exhale as you round.", video: "https://www.youtube.com/watch?v=y39PrKY_4JM" },
      ],
    },
    {
      id: "d2_core", type: "superset",
      restBetweenMoves: "10-15 sec — flow straight from one to the next",
      restBetweenRounds: "30-45 sec after finishing both moves",
      exercises: [
        { id: "d2_birddog", label: "2A", name: "Bird Dog", sets: 3, reps: "8 / side", tip: "Keep your hips level — don't let them rotate as you extend arm and leg.", video: "https://www.youtube.com/watch?v=ZdAHe9_HeEw" },
        { id: "d2_deadbug", label: "2B", name: "Dead Bug", sets: 3, reps: "10 / side", tip: "Press your lower back into the floor the whole time.", video: "https://www.youtube.com/watch?v=bxn9FBrt4-A" },
      ],
    },
    {
      id: "d2_clamshell", type: "solo",
      restBetweenSets: "30-45 sec between sets",
      exercises: [
        { id: "d2_clamshell", label: "3", name: "Band Clamshell", sets: 3, reps: "15 / side", tip: "Loop the sculpt band above your knees. Keep feet together, rotate from the hip — not the lower back.", video: "https://www.youtube.com/watch?v=1MJC6gyP-ig" },
      ],
    },
    {
      id: "d2_stretch", type: "flow",
      restBetweenMoves: "No rest — move straight into the next stretch",
      exercises: [
        { id: "d2_hipflexor", label: "4", name: "Standing Hip Flexor Stretch", sets: 2, reps: "30 sec / side", tip: "Gently tuck your pelvis under to deepen the stretch.", isTimed: true, timedSeconds: 30, video: "https://www.youtube.com/watch?v=5w_WRPqYZW4" },
        { id: "d2_piriformis", label: "5", name: "Piriformis (Figure-4) Stretch", sets: 2, reps: "30 sec / side", tip: "Sit or lie down, gently pull the crossed leg toward your chest.", isTimed: true, timedSeconds: 30, video: "https://www.youtube.com/watch?v=-g0nuyTHMrI" },
        { id: "d2_childspose", label: "6", name: "Child's Pose Flow", sets: 1, reps: "60 sec", tip: "Breathe deeply, let your hips sink back toward your heels.", isTimed: true, timedSeconds: 60, video: "https://www.youtube.com/watch?v=_ZX_zTOBgp8" },
      ],
    },
  ],
  day3: [
    {
      id: "d3_A", type: "superset",
      restBetweenMoves: "15-20 sec — just enough to switch weights",
      restBetweenRounds: "60-90 sec after finishing both moves",
      exercises: [
        {
          id: "d3_stepup", label: "1A", name: "Step-Up", sets: 3, reps: "10 / side",
          muscles: "Quads + Glutes",
          tip: "Drive through the heel of the top foot — avoid pushing off the bottom foot.",
          weightGuide: "DB in each hand (up to 10 lb), sturdy step",
          video: "https://www.youtube.com/watch?v=DxUNi119Qzs",
          gymVariant: { weightGuide: "Heavier DBs, use a gym bench or step platform" },
        },
        {
          id: "d3_rdl", label: "1B", name: "Romanian Deadlift", sets: 3, reps: "10",
          muscles: "Hamstrings + Glutes",
          tip: "Soft knee bend, hinge at the hips, keep the weight close to your legs.",
          weightGuide: "2 dumbbells (up to 10 lb each), or add the weighted vest",
          video: "https://www.youtube.com/watch?v=aa57T45iFSE",
          gymVariant: {
            name: "Cable Pull-Through",
            reps: "12",
            tip: "Face away from the low cable, hinge at the hips with a soft knee bend, drive your hips forward to standing. Gentler on the low back than a loaded dumbbell hinge.",
            weightGuide: "Start on a light-to-moderate stack setting",
            video: "https://www.youtube.com/watch?v=4oZ_0_bQcOg",
          },
        },
      ],
    },
    {
      id: "d3_B", type: "superset",
      restBetweenMoves: "15-20 sec — just enough to switch",
      restBetweenRounds: "60-90 sec after finishing both moves",
      exercises: [
        {
          id: "d3_calf", label: "2A", name: "Calf Raise", sets: 3, reps: "15",
          muscles: "Calves",
          tip: "Rise slowly onto your toes, pause at the top, lower with control.",
          weightGuide: "Bodyweight, or hold dumbbells / wear the vest",
          video: "https://www.youtube.com/watch?v=ndQc4mz4mBU",
          gymVariant: { weightGuide: "Bodyweight, or hold heavier dumbbells" },
        },
        {
          id: "d3_lateral", label: "2B", name: "Band Lateral Walk", sets: 3, reps: "10 steps / side",
          muscles: "Hips + Glutes",
          tip: "Loop the sculpt band above your knees — this is exactly what it's designed for. Stay low, keep knees pressed outward against the band.",
          weightGuide: "Sculpt band above knees",
          video: "https://www.youtube.com/watch?v=y_bqFDQZSHQ",
        },
      ],
    },
    {
      id: "d3_cooldown", type: "flow",
      restBetweenMoves: "No rest — move straight into the next stretch",
      exercises: [
        {
          id: "d3_cooldown_ex", label: "C", name: "Cooldown Stretch Flow", sets: 1, reps: "30 sec each: hamstring, quad, seated twist",
          tip: "Breathe slowly. Don't force any stretch.",
          isTimed: true, timedSeconds: 30, video: null,
        },
      ],
    },
  ],
  day4: [
    {
      id: "d4_standing", type: "solo",
      restBetweenSets: "No rest needed — move right into the next round",
      exercises: [
        { id: "d4_pelvictilt", label: "1", name: "Standing Pelvic Tilts", sets: 1, reps: "8-10 reps", tip: "Hands on hips, gently rock your pelvis forward and back — great after sitting in the car all day.", video: "https://www.youtube.com/watch?v=jjLy--g4DHc" },
      ],
    },
    {
      id: "d4_upperflow", type: "flow",
      restBetweenMoves: "No rest — move straight into the next stretch",
      exercises: [
        { id: "d4_wallangel", label: "2", name: "Wall Angels", sets: 2, reps: "10 reps", tip: "Back flat against a wall, slide arms up and down like a snow angel. Resets rounded shoulders from driving/sitting.", video: "https://www.youtube.com/watch?v=1UU4VvklQ44" },
        { id: "d4_chest", label: "3", name: "Doorway Chest Stretch", sets: 2, reps: "30 sec", tip: "Forearm on a doorframe, gently lean forward until you feel a stretch across your chest.", isTimed: true, timedSeconds: 30, video: "https://www.youtube.com/watch?v=M850sCj9LHQ" },
      ],
    },
    {
      id: "d4_hipbalance", type: "solo",
      restBetweenSets: "No rest needed between sides",
      exercises: [
        { id: "d4_hipcircle", label: "4", name: "Standing Hip Circles", sets: 2, reps: "8 circles / direction / side", tip: "Hold onto a counter or chair back for balance if needed. Big, slow, controlled circles.", video: "https://www.youtube.com/watch?v=Uq8QR1_N65U" },
      ],
    },
    {
      id: "d4_marching", type: "solo",
      restBetweenSets: "30 sec rest between sets",
      exercises: [
        { id: "d4_march", label: "5", name: "Standing March + Balance", sets: 2, reps: "10 / side", tip: "Lift knee to hip height, pause a beat at the top, lower with control. Light touch on a counter is fine if needed.", video: "https://www.youtube.com/watch?v=AcFdxoS7s-Q" },
      ],
    },
    {
      id: "d4_twist", type: "flow",
      restBetweenMoves: "No rest — hold and switch sides",
      exercises: [
        { id: "d4_spinaltwist", label: "6", name: "Standing Spinal Twist", sets: 2, reps: "20 sec / side", tip: "Feet planted, gently rotate your upper body side to side, letting your arms swing loosely.", isTimed: true, timedSeconds: 20, video: "https://www.youtube.com/watch?v=TQB1hzU1S5U" },
      ],
    },
  ],
  day5: [
    {
      id: "d5_A", type: "superset",
      restBetweenMoves: "15-20 sec — just enough to switch",
      restBetweenRounds: "60-90 sec after finishing both moves",
      exercises: [
        {
          id: "d5_curlpress", label: "1A", name: "Bicep Curl to Overhead Press", sets: 3, reps: "10",
          muscles: "Biceps + Shoulders",
          tip: "Curl the dumbbells to your shoulders, then press straight overhead. Smooth, controlled — no swinging.",
          weightGuide: "6-10 lb dumbbells",
          video: "https://www.youtube.com/watch?v=MkSxYPEnpws",
          gymVariant: { weightGuide: "10-15 lb dumbbells" },
        },
        {
          id: "d5_pullapart", label: "1B", name: "Band Pull-Apart", sets: 3, reps: "12-15",
          muscles: "Upper Back + Rear Shoulders",
          tip: "Arms straight out in front, pull the tube band apart until it touches your chest. Great posture fix for commute days.",
          weightGuide: "Red tube band with handles",
          video: "https://www.youtube.com/watch?v=WqdNDTTe-9g",
          gymVariant: {
            name: "Face Pull",
            reps: "12-15",
            tip: "Set the cable at face height, pull the rope toward your face with elbows high, squeeze your shoulder blades together at the end.",
            weightGuide: "Start on a light stack setting",
            video: "https://www.youtube.com/watch?v=eTCBSFlCJ_s",
          },
        },
      ],
    },
    {
      id: "d5_B", type: "superset",
      restBetweenMoves: "15-20 sec — just enough to switch",
      restBetweenRounds: "45-60 sec after finishing both moves",
      exercises: [
        {
          id: "d5_ringsqueeze", label: "2A", name: "Pilates Ring Inner Thigh Squeeze", sets: 3, reps: "15",
          muscles: "Inner Thighs + Core",
          tip: "Lying on your back, ring between your knees, squeeze and release with control. Keep your lower back pressed down.",
          weightGuide: "Pilates ring",
          video: "https://www.youtube.com/watch?v=ojMOSBTYH9Q",
          gymVariant: {
            name: "Seated Inner/Outer Thigh Machine",
            reps: "15",
            tip: "Adjust the machine to a comfortable range, squeeze in (or press out, depending on which pad you use) with control — no jerky movements.",
            weightGuide: "Start on a light-to-moderate stack setting",
            video: "https://www.youtube.com/watch?v=2zqXU95SSqM",
          },
        },
        {
          id: "d5_deadbugball", label: "2B", name: "Dead Bug with Medicine Ball", sets: 3, reps: "10 / side",
          muscles: "Core",
          tip: "Hold the ball between your hands overhead, press it slightly as you extend the opposite arm and leg — it keeps your core braced.",
          weightGuide: "8 lb medicine ball",
          video: "https://www.youtube.com/watch?v=dTDn8sj2Wf4",
          gymVariant: { weightGuide: "Grab a light medicine ball from the rack" },
        },
      ],
    },
    {
      id: "d5_C", type: "solo",
      restBetweenSets: "45-60 sec between sets",
      exercises: [
        {
          id: "d5_woodchop", label: "3", name: "Standing Med Ball Woodchopper", sets: 3, reps: "10 / side",
          muscles: "Obliques + Core",
          tip: "Rotate the ball from high on one side down to the opposite hip, pivoting your back foot naturally. Controlled, not fast.",
          weightGuide: "8 lb medicine ball",
          video: "https://www.youtube.com/watch?v=fbdwUb14E3M",
          gymVariant: {
            name: "Cable Woodchopper",
            reps: "10 / side",
            tip: "Set the cable high, rotate and pull it diagonally down across your body to the opposite hip, pivoting your back foot naturally.",
            weightGuide: "Start on a light stack setting",
            video: "https://www.youtube.com/watch?v=he4IhLc1d5k",
          },
        },
      ],
    },
    {
      id: "d5_cooldown", type: "flow",
      restBetweenMoves: "No rest — move straight into the next stretch",
      exercises: [
        {
          id: "d5_cooldown_ex", label: "C", name: "Cooldown Stretch Flow", sets: 1, reps: "30 sec each: chest, shoulders, seated twist",
          tip: "Breathe slowly. Don't force any stretch.",
          isTimed: true, timedSeconds: 30, video: null,
        },
      ],
    },
  ],
};

// Vest walk — the "easy cardio" alternative for mobility days (Day 2 and Day 4)
const WALK_INFO = {
  title: "Weighted Vest Walk",
  tip: "Take the dog for a walk wearing the weighted vest — same route you'd normally do, just with a bit of extra load for bone and cardio benefit.",
  suggestedMinutes: 25,
};

// Flatten helper — the rest of the app still wants a simple exercise list per day in places
const EXERCISES = Object.fromEntries(
  Object.entries(BLOCKS).map(([day, blocks]) => [day, blocks.flatMap((b) => b.exercises)])
);

const BLOCK_LABELS = { superset: "Superset", solo: "Do alone", flow: "Stretch flow" };

// ─── TIMER HOOK ──────────────────────────────────────────────────────────
function useCountdown(initialSeconds) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && seconds > 0) {
      ref.current = setTimeout(() => setSeconds((s) => s - 1), 1000);
    } else if (seconds === 0) {
      setRunning(false);
    }
    return () => clearTimeout(ref.current);
  }, [running, seconds]);

  const start = () => { if (seconds === 0) setSeconds(initialSeconds); setRunning(true); };
  const reset = () => { setRunning(false); setSeconds(initialSeconds); };

  return { seconds, running, start, reset };
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

// ─── WEEKLY STREAK (signature element) ──────────────────────────────────
function WeekStreak({ history }) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const thisWeekCount = history.filter((h) => new Date(h.date) >= startOfWeek).length;

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Sun
          key={i}
          size={15}
          className={i < thisWeekCount ? "" : "opacity-25"}
          style={{ color: i < thisWeekCount ? "#E0824A" : "#6B7280" }}
          fill={i < thisWeekCount ? "#E0824A" : "none"}
        />
      ))}
      <span className="text-xs text-neutral-400 ml-1">{thisWeekCount}/5</span>
    </div>
  );
}

// ─── EXERCISE CARD ───────────────────────────────────────────────────────
function ExerciseCard({ ex, color, location, hasLocation, data, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const setsData = data?.sets || Array.from({ length: ex.sets }, () => ({ reps: "", weight: "", done: false }));
  const doneCount = setsData.filter((s) => s.done).length;

  const variant = hasLocation && location === "gym" && ex.gymVariant ? { ...ex, ...ex.gymVariant } : ex;
  const isDifferentMovement = variant.name !== ex.name;

  const timer = useCountdown(variant.timedSeconds || ex.timedSeconds || 30);

  const updateSet = (i, patch) => {
    const updated = [...setsData];
    updated[i] = { ...updated[i], ...patch };
    onUpdate({ sets: updated });
  };

  return (
    <div className="rounded-2xl mb-3 overflow-hidden" style={{ backgroundColor: "#252A32", border: "1px solid #333A45" }}>
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
            style={{ width: 28, height: 28, backgroundColor: color, color: "#fff" }}
          >
            {ex.label}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="text-neutral-50 font-semibold truncate">{variant.name}</div>
              {isDifferentMovement && (
                <span className="font-semibold px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: color + "33", color, fontSize: 10 }}>
                  gym sub
                </span>
              )}
            </div>
            {variant.muscles && <div className="text-xs text-neutral-400">{variant.muscles}</div>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-neutral-400">{ex.sets}×{variant.reps}</span>
          <span className="text-xs font-semibold" style={{ color }}>{doneCount}/{ex.sets}</span>
          <ChevronDown size={18} className={`text-neutral-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {variant.weightGuide && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: color + "1A" }}>
              {location === "home" ? <HomeIcon size={14} style={{ color }} /> : <Dumbbell size={14} style={{ color }} />}
              <span className="text-xs" style={{ color }}>{variant.weightGuide}</span>
            </div>
          )}

          <p className="text-sm text-neutral-300 mb-3">{variant.tip}</p>

          {variant.video ? (
            <a
              href={variant.video}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-sm font-medium w-fit"
              style={{ backgroundColor: color, color: "#fff" }}
            >
              <Play size={14} /> Watch demo <ExternalLink size={12} />
            </a>
          ) : (
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-sm w-fit" style={{ backgroundColor: "#333A45", color: "#7B8290" }}>
              <Play size={14} /> Demo video coming soon
            </div>
          )}

          {ex.isTimed ? (
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg mb-2" style={{ backgroundColor: "#1D2127" }}>
              <Clock size={18} style={{ color }} />
              <span className="text-xl font-mono text-neutral-50">{formatTime(timer.seconds)}</span>
              <button
                className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: timer.running ? "#333A45" : color, color: timer.running ? "#9CA3AF" : "#fff" }}
                onClick={timer.running ? timer.reset : timer.start}
              >
                {timer.running ? "Pause" : "Start"}
              </button>
              <button className="p-1.5 rounded-lg" style={{ backgroundColor: "#333A45" }} onClick={timer.reset}>
                <RotateCcw size={14} className="text-neutral-400" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {setsData.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 w-10 flex-shrink-0">Set {i + 1}</span>
                  {!variant.weightGuide ? null : (
                    <input
                      type="number"
                      placeholder="lb"
                      value={s.weight}
                      onChange={(e) => updateSet(i, { weight: e.target.value })}
                      className="w-16 rounded-lg px-2 py-1.5 text-sm text-neutral-50 text-center"
                      style={{ backgroundColor: "#1D2127", border: "1px solid #333A45" }}
                    />
                  )}
                  <input
                    type="number"
                    placeholder="reps"
                    value={s.reps}
                    onChange={(e) => updateSet(i, { reps: e.target.value })}
                    className="w-16 rounded-lg px-2 py-1.5 text-sm text-neutral-50 text-center"
                    style={{ backgroundColor: "#1D2127", border: "1px solid #333A45" }}
                  />
                  {i === 0 && ex.sets > 1 && (s.weight || s.reps) ? (
                    <button
                      className="flex items-center gap-1 font-medium px-2 py-1 rounded-md flex-shrink-0"
                      style={{ backgroundColor: color + "22", color, fontSize: 10 }}
                      onClick={() => {
                        const updated = setsData.map((set, idx) => (idx === 0 ? set : { ...set, weight: s.weight, reps: s.reps }));
                        onUpdate({ sets: updated });
                      }}
                    >
                      <Copy size={11} /> Copy to all
                    </button>
                  ) : (
                    <span className="flex-shrink-0" style={{ width: 74 }} />
                  )}
                  <button className="ml-auto" onClick={() => updateSet(i, { done: !s.done })}>
                    {s.done ? <CircleCheck size={24} style={{ color }} /> : <Circle size={24} className="text-neutral-600" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BLOCK CARD ──────────────────────────────────────────────────────────
function BlockCard({ block, color, location, hasLocation, dayData, onUpdate }) {
  const isSuperset = block.type === "superset";
  const isFlow = block.type === "flow";

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span
          className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-md"
          style={{ backgroundColor: color + "22", color }}
        >
          {BLOCK_LABELS[block.type]}
        </span>
        {isSuperset && (
          <span className="text-xs text-neutral-400">
            Rest between moves: {block.restBetweenMoves} · Rest between rounds: {block.restBetweenRounds}
          </span>
        )}
        {block.type === "solo" && block.restBetweenSets && (
          <span className="text-xs text-neutral-400">Rest between sets: {block.restBetweenSets}</span>
        )}
        {isFlow && (
          <span className="text-xs text-neutral-400">{block.restBetweenMoves}</span>
        )}
      </div>

      {block.exercises.map((ex, i) => (
        <div key={ex.id}>
          <ExerciseCard
            ex={ex}
            color={color}
            location={location}
            hasLocation={hasLocation}
            data={dayData[ex.id]}
            onUpdate={(patch) => onUpdate(ex.id, patch)}
          />
          {isSuperset && i === 0 && (
            <div className="flex items-center gap-2 -mt-1 mb-1 pl-2">
              <div className="flex-1 h-px" style={{ backgroundColor: color + "44" }} />
              <span className="font-semibold uppercase" style={{ color, fontSize: 10 }}>then</span>
              <div className="flex-1 h-px" style={{ backgroundColor: color + "44" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── SIMPLE LOG CARD (vest walk — no sets, just duration) ────────────────
function SimpleLogCard({ info, color, value, onUpdate }) {
  const minutes = value?.minutes ?? "";
  const done = value?.done ?? false;

  return (
    <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#252A32", border: "1px solid #333A45" }}>
      <div className="text-neutral-50 font-semibold mb-1">{info.title}</div>
      <p className="text-sm text-neutral-300 mb-4">{info.tip}</p>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-neutral-400 flex-shrink-0">Minutes</label>
        <input
          type="number"
          placeholder={info.suggestedMinutes ? String(info.suggestedMinutes) : "0"}
          value={minutes}
          onChange={(e) => onUpdate({ minutes: e.target.value, done })}
          className="w-20 rounded-lg px-2 py-1.5 text-sm text-neutral-50 text-center"
          style={{ backgroundColor: "#1D2127", border: "1px solid #333A45" }}
        />
      </div>

      <button
        className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
        style={{ backgroundColor: done ? "#333A45" : color, color: done ? "#9CA3AF" : "#fff" }}
        onClick={() => onUpdate({ minutes, done: !done })}
      >
        {done ? <CircleCheck size={16} /> : <Circle size={16} />} {done ? "Done" : "Mark complete"}
      </button>
    </div>
  );
}

// ─── DAY NOTES (bottom of every day — what's working, what's not) ────────
function DayNotes({ color, value, onUpdate }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <StickyNote size={13} style={{ color }} />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>Notes</span>
      </div>
      <textarea
        placeholder="What's working, what's not, how it felt today..."
        value={value || ""}
        onChange={(e) => onUpdate(e.target.value)}
        rows={3}
        className="w-full rounded-xl px-3 py-2.5 text-sm text-neutral-50 resize-none"
        style={{ backgroundColor: "#252A32", border: "1px solid #333A45" }}
      />
    </div>
  );
}

// ─── HISTORY VIEW ────────────────────────────────────────────────────────
function HistoryView({ history, onCopy, copyMsg, onClear }) {
  return (
    <div className="px-5">
      {history.length === 0 ? (
        <div className="text-center text-sm text-neutral-500 py-16">
          No sessions yet.<br />Complete a day to build your history.
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {history.map((h) => {
              const d = DAYS.find((x) => x.id === h.day) || {};
              return (
                <div key={h.id} className="rounded-xl p-3.5" style={{ backgroundColor: "#252A32", border: "1px solid #333A45" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: d.color + "22", color: d.color }}>
                      {d.label || h.day}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-200 font-medium mb-1">{d.title}</div>
                  <div className="text-xs mb-3" style={{ color: d.color }}>
                    {h.isLog ? `${h.minutes || "?"} min` : `${h.doneSets}/${h.totalSets} sets`}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "#333A45", color: "#E5E7EB" }}
                      onClick={() => onCopy(h)}
                    >
                      <Copy size={12} /> Copy for Claude
                    </button>
                    {copyMsg === h.id && <span className="text-xs font-semibold" style={{ color: d.color }}>Copied!</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center pb-2">
            <button className="text-xs text-neutral-500 underline" onClick={onClear}>Clear all history</button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────
const ACTIVITY_KEY = "momfit_activity_v1";

export default function MomWorkoutApp() {
  const [mainTab, setMainTab] = useState("today");
  const [activeDay, setActiveDay] = useState("day1");
  const [location, setLocation] = useState(() => load(LOC_KEY, "home"));
  const [activity, setActivity] = useState(() => load(ACTIVITY_KEY, {}));
  const [data, setData] = useState(() => load(DATA_KEY, {}));
  const [history, setHistory] = useState(() => load(HISTORY_KEY, []));
  const [savedFlash, setSavedFlash] = useState(false);
  const [autosaved, setAutosaved] = useState(false);
  const hasMounted = useRef(false);
  const [copyMsg, setCopyMsg] = useState("");

  useEffect(() => {
    save(DATA_KEY, data);
    if (hasMounted.current) {
      setAutosaved(true);
      const t = setTimeout(() => setAutosaved(false), 1400);
      return () => clearTimeout(t);
    }
    hasMounted.current = true;
  }, [data]);
  useEffect(() => save(LOC_KEY, location), [location]);
  useEffect(() => save(ACTIVITY_KEY, activity), [activity]);
  useEffect(() => save(HISTORY_KEY, history), [history]);

  const day = DAYS.find((d) => d.id === activeDay);
  const exercises = EXERCISES[activeDay] || [];
  const blocks = BLOCKS[activeDay] || [];
  const dayData = data[activeDay] || {};
  const dayActivity = activity[activeDay] || "flow"; // "flow" or "walk"

  const isLogDay = day.hasActivityToggle && dayActivity === "walk";
  const logInfo = WALK_INFO;

  const updateExercise = (exId, patch) => {
    setData((prev) => ({
      ...prev,
      [activeDay]: { ...(prev[activeDay] || {}), [exId]: { ...(prev[activeDay]?.[exId] || {}), ...patch } },
    }));
  };

  const updateLog = (patch) => {
    setData((prev) => ({ ...prev, [activeDay]: { ...(prev[activeDay] || {}), _log: patch } }));
  };

  const updateNotes = (text) => {
    setData((prev) => ({ ...prev, [activeDay]: { ...(prev[activeDay] || {}), _notes: text } }));
  };

  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = exercises.reduce((a, e) => {
    const sets = dayData[e.id]?.sets || [];
    return a + sets.filter((s) => s.done).length;
  }, 0);

  const completeDay = () => {
    const notes = dayData._notes || "";
    if (isLogDay) {
      const log = dayData._log || {};
      setHistory((prev) => [{ id: Date.now(), date: new Date().toISOString(), day: activeDay, isLog: true, minutes: log.minutes || "", notes }, ...prev]);
    } else {
      const exerciseData = {};
      exercises.forEach((e) => { if (dayData[e.id]) exerciseData[e.id] = dayData[e.id]; });
      setHistory((prev) => [{ id: Date.now(), date: new Date().toISOString(), day: activeDay, doneSets, totalSets, notes, exerciseData }, ...prev]);
    }
    setData((prev) => ({ ...prev, [activeDay]: {} }));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const copySession = (entry) => {
    const dayMeta = DAYS.find((d) => d.id === entry.day) || {};
    const lines = [
      `${dayMeta.title || entry.day} — ${new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      "",
    ];
    if (entry.isLog) {
      const info = WALK_INFO;
      lines.push(`Activity: ${info.title}`);
      lines.push(`Minutes: ${entry.minutes || "—"}`);
    } else {
      const exList = EXERCISES[entry.day] || [];
      exList.forEach((ex) => {
        const exData = entry.exerciseData?.[ex.id];
        if (exData?.sets?.length) {
          const setsStr = exData.sets.map((s) => `${s.weight || "-"}lb x ${s.reps || "-"}`).join(", ");
          lines.push(`${ex.name}: ${setsStr}`);
        }
      });
      lines.push("", `Completed: ${entry.doneSets}/${entry.totalSets} sets`);
    }
    if (entry.notes) lines.push("", `Notes: ${entry.notes}`);
    lines.push("", "---", "Share with Claude for weight recommendations.");
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopyMsg(entry.id);
      setTimeout(() => setCopyMsg(""), 2000);
    });
  };

  const clearHistory = () => {
    if (window.confirm("Delete all saved history? This cannot be undone.")) setHistory([]);
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ backgroundColor: "#1A1D23", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=DM+Sans:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="w-full max-w-md pb-10">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-display text-2xl text-neutral-50">Evening Reset</h1>
            <WeekStreak history={history} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-400">2-3 strength · 1-2 mobility</p>
            <span
              className="flex items-center gap-1 text-xs transition-opacity duration-300"
              style={{ color: "#7F9E82", opacity: autosaved ? 1 : 0 }}
            >
              <Check size={12} /> Saved
            </span>
          </div>
        </div>

        {/* Main tab nav */}
        <div className="px-5 flex gap-2 mb-4">
          {[{ id: "today", label: "Today" }, { id: "history", label: "History" }].map((t) => (
            <button
              key={t.id}
              onClick={() => setMainTab(t.id)}
              className="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-colors"
              style={{
                backgroundColor: mainTab === t.id ? "#333A45" : "transparent",
                color: mainTab === t.id ? "#F4F1EA" : "#6B7280",
                border: "1px solid #333A45",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mainTab === "history" ? (
          <HistoryView history={history} onCopy={copySession} copyMsg={copyMsg} onClear={clearHistory} />
        ) : (
          <>
            {/* Day tabs — scrollable */}
            <div className="px-5 flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              {DAYS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDay(d.id)}
                  className="rounded-xl py-2.5 px-3.5 text-center flex-shrink-0 transition-colors"
                  style={{
                    backgroundColor: activeDay === d.id ? d.color : "#252A32",
                    border: activeDay === d.id ? "none" : `1px solid ${d.optional ? "#3D4552" : "#333A45"}`,
                    borderStyle: !activeDay === d.id && d.optional ? "dashed" : "solid",
                  }}
                >
                  <div className="text-xs font-semibold whitespace-nowrap" style={{ color: activeDay === d.id ? "#fff" : "#9CA3AF" }}>
                    {d.label}{d.optional ? " *" : ""}
                  </div>
                </button>
              ))}
            </div>

            {/* Day title + location/activity toggle */}
            <div className="px-5 mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display text-lg text-neutral-50">{day.title}</div>
                <div className="text-xs text-neutral-400">{day.subtitle}</div>
              </div>

              {day.hasLocation && (
                <div className="flex rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1px solid #333A45" }}>
                  <button
                    onClick={() => setLocation("home")}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
                    style={{ backgroundColor: location === "home" ? day.color : "transparent", color: location === "home" ? "#fff" : "#9CA3AF" }}
                  >
                    <HomeIcon size={13} /> Home
                  </button>
                  <button
                    onClick={() => setLocation("gym")}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
                    style={{ backgroundColor: location === "gym" ? day.color : "transparent", color: location === "gym" ? "#fff" : "#9CA3AF" }}
                  >
                    <Dumbbell size={13} /> Gym
                  </button>
                </div>
              )}

              {day.hasActivityToggle && (
                <div className="flex rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1px solid #333A45" }}>
                  <button
                    onClick={() => setActivity((prev) => ({ ...prev, [activeDay]: "flow" }))}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
                    style={{ backgroundColor: dayActivity === "flow" ? day.color : "transparent", color: dayActivity === "flow" ? "#fff" : "#9CA3AF" }}
                  >
                    Flow
                  </button>
                  <button
                    onClick={() => setActivity((prev) => ({ ...prev, [activeDay]: "walk" }))}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium"
                    style={{ backgroundColor: dayActivity === "walk" ? day.color : "transparent", color: dayActivity === "walk" ? "#fff" : "#9CA3AF" }}
                  >
                    Walk
                  </button>
                </div>
              )}
            </div>

            {/* Progress bar (block days only) */}
            {!isLogDay && (
              <div className="px-5 mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-neutral-500">{doneSets}/{totalSets} sets logged</span>
                  <span
                    className="flex items-center gap-1 text-xs transition-opacity duration-300"
                    style={{ color: day.color, opacity: autosaved ? 1 : 0 }}
                  >
                    <Check size={12} /> Saved
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#252A32" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%`, backgroundColor: day.color }}
                  />
                </div>
              </div>
            )}

            {/* Content: either exercise blocks or a simple log card */}
            <div className="px-5">
              {isLogDay ? (
                <SimpleLogCard info={logInfo} color={day.color} value={dayData._log} onUpdate={updateLog} />
              ) : (
                blocks.map((block) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    color={day.color}
                    location={location}
                    hasLocation={day.hasLocation}
                    dayData={dayData}
                    onUpdate={updateExercise}
                  />
                ))
              )}

              {/* Notes — what's working, what's not */}
              <DayNotes color={day.color} value={dayData._notes} onUpdate={updateNotes} />
            </div>

            {/* Complete day button */}
            <div className="px-5 mt-2">
              <button
                onClick={completeDay}
                className="w-full py-3 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: day.color, color: "#fff" }}
              >
                {savedFlash ? "Saved ✓" : `Finish ${day.label}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

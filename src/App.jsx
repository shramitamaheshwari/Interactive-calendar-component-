import { useState, useEffect, useRef } from "react";
import "./App.css";

const MONTH_IMAGES = [
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800&q=80", // Jan - snow/winter
  "https://images.unsplash.com/photo-1494256997604-768d1f608cac?w=800&q=80", // Feb - cat/cozy
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=80", // Mar - spring flowers
  "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=800&q=80", // Apr - rain/puddle
  "https://images.unsplash.com/photo-1490750967868-88df5691cc8e?w=800&q=80", // May - tulips
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // Jun - beach
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800&q=80", // Jul - summer
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80", // Aug - mountains
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", // Sep - autumn
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", // Oct - fall
  "https://images.unsplash.com/photo-1477601263568-180e2c6d046e?w=800&q=80", // Nov - fog/bare trees
  "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=800&q=80", // Dec - snow
];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const DAY_NAMES = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

const HOLIDAYS = {
  "1-1": "New Year's Day",
  "2-14": "Valentine's Day",
  "3-8": "Women's Day",
  "4-1": "April Fools",
  "5-1": "Labour Day",
  "6-21": "Summer Solstice",
  "10-31": "Halloween",
  "12-25": "Christmas",
  "12-31": "New Year's Eve",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  // 0=Sun..6=Sat → convert to Mon-based (0=Mon..6=Sun)
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBetween(date, start, end) {
  if (!start || !end) return false;
  const d = date.getTime();
  const s = Math.min(start.getTime(), end.getTime());
  const e = Math.max(start.getTime(), end.getTime());
  return d > s && d < e;
}

export default function App() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [notes, setNotes] = useState({});
  const [noteInput, setNoteInput] = useState("");
  const [theme, setTheme] = useState("light");
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState("next");
  const [imgLoaded, setImgLoaded] = useState(false);
  const noteRef = useRef(null);

  const noteKey = rangeStart
    ? `${currentYear}-${currentMonth}-${rangeStart.getDate()}`
    : `${currentYear}-${currentMonth}-general`;

  useEffect(() => {
    setNoteInput(notes[noteKey] || "");
  }, [noteKey, notes]);

  useEffect(() => {
    setImgLoaded(false);
  }, [currentMonth, currentYear]);

  const navigateMonth = (dir) => {
    if (flipping) return;
    setFlipDir(dir === 1 ? "next" : "prev");
    setFlipping(true);
    setTimeout(() => {
      setCurrentMonth((m) => {
        let nm = m + dir;
        if (nm > 11) { setCurrentYear((y) => y + 1); return 0; }
        if (nm < 0) { setCurrentYear((y) => y - 1); return 11; }
        return nm;
      });
      setRangeStart(null);
      setRangeEnd(null);
      setSelecting(false);
      setHoverDate(null);
      setFlipping(false);
    }, 350);
  };

  const handleDayClick = (date) => {
    if (!selecting || !rangeStart) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelecting(true);
    } else {
      if (date < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(date);
      } else {
        setRangeEnd(date);
      }
      setSelecting(false);
    }
  };

  const handleDayHover = (date) => {
    if (selecting) setHoverDate(date);
  };

  const saveNote = () => {
    setNotes((prev) => ({ ...prev, [noteKey]: noteInput }));
  };

  const clearRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setSelecting(false);
    setHoverDate(null);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevMonthDays - firstDay + 1 + i, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  const activeEnd = selecting ? (hoverDate || rangeStart) : rangeEnd;

  const formatRange = () => {
    if (!rangeStart) return null;
    const opts = { month: "short", day: "numeric" };
    if (!activeEnd || isSameDay(rangeStart, activeEnd))
      return rangeStart.toLocaleDateString("en-US", opts);
    const s = Math.min(rangeStart, activeEnd || rangeStart);
    const e = Math.max(rangeStart, activeEnd || rangeStart);
    return `${new Date(s).toLocaleDateString("en-US", opts)} → ${new Date(e).toLocaleDateString("en-US", opts)}`;
  };

  const generalNoteKey = `${currentYear}-${currentMonth}-general`;

  return (
    <div className={`app-root theme-${theme}`}>
      {/* Theme Toggle */}
      <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        title="Toggle theme"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <div className={`calendar-wrapper ${flipping ? `flip-${flipDir}` : ""}`}>
        {/* Spiral binding */}
        <div className="spiral">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="ring" />
          ))}
        </div>

        <div className="calendar-body">
          {/* ── LEFT PANEL ── */}
          <div className="left-panel">
            {/* Hero Image */}
            <div className="hero-image-wrap">
              <img
                src={MONTH_IMAGES[currentMonth]}
                alt={MONTH_NAMES[currentMonth]}
                className={`hero-image ${imgLoaded ? "loaded" : ""}`}
                onLoad={() => setImgLoaded(true)}
              />
              <div className="image-overlay" />
              {/* Diagonal chevron cutout */}
              <div className="chevron-cutout" />
              {/* Month label on image */}
              <div className="month-badge">
                <span className="year-label">{currentYear}</span>
                <span className="month-label">{MONTH_NAMES[currentMonth]}</span>
              </div>
              {/* Nav arrows */}
              <button className="nav-btn nav-prev" onClick={() => navigateMonth(-1)}>‹</button>
              <button className="nav-btn nav-next" onClick={() => navigateMonth(1)}>›</button>
            </div>

            {/* Notes Section */}
            <div className="notes-section">
              <div className="notes-header">
                <span className="notes-title">Notes</span>
                {rangeStart && (
                  <span className="range-label">{formatRange()}</span>
                )}
              </div>
              <div className="notes-lines">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="note-line" />
                ))}
                <textarea
                  ref={noteRef}
                  className="note-textarea"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onBlur={saveNote}
                  placeholder={rangeStart ? "Note for selected range…" : "General monthly notes…"}
                  rows={5}
                />
              </div>
              <div className="notes-actions">
                <button className="btn-save" onClick={saveNote}>Save</button>
                {rangeStart && (
                  <button className="btn-clear" onClick={clearRange}>Clear Range</button>
                )}
              </div>
              {/* Show saved notes indicator */}
              {Object.keys(notes).filter(k => k.startsWith(`${currentYear}-${currentMonth}`)).length > 0 && (
                <div className="saved-notes-list">
                  {Object.entries(notes)
                    .filter(([k, v]) => k.startsWith(`${currentYear}-${currentMonth}`) && v)
                    .map(([k, v]) => (
                      <div key={k} className="saved-note-item">
                        <span className="saved-note-key">
                          {k.endsWith("general") ? "General" : `Day ${k.split("-")[2]}`}
                        </span>
                        <span className="saved-note-text">{v}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="right-panel">
            {/* Day headers */}
            <div className="day-headers">
              {DAY_NAMES.map((d) => (
                <div key={d} className={`day-header ${d === "SAT" || d === "SUN" ? "weekend" : ""}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="calendar-grid" onMouseLeave={() => setHoverDate(null)}>
              {cells.map((cell, idx) => {
                if (!cell.current) {
                  return (
                    <div key={idx} className="day-cell dim">
                      <span className="day-num">{cell.day}</span>
                    </div>
                  );
                }
                const date = new Date(currentYear, currentMonth, cell.day);
                const isToday = isSameDay(date, today);
                // Normalize range direction for display
                const rangeA = (activeEnd && activeEnd < rangeStart) ? activeEnd : rangeStart;
                const rangeB = (activeEnd && activeEnd < rangeStart) ? rangeStart : activeEnd;
                const isStart = isSameDay(date, rangeA);
                const isEnd = isSameDay(date, rangeB);
                const inRange = isBetween(date, rangeA, rangeB);
                const holiday = HOLIDAYS[`${currentMonth + 1}-${cell.day}`];
                const dayOfWeek = (firstDay + cell.day - 1) % 7; // 0=Mon..6=Sun
                const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
                const hasNote = notes[`${currentYear}-${currentMonth}-${cell.day}`];

                const rangeActive = activeEnd && !isSameDay(rangeStart, activeEnd);

                let cls = "day-cell";
                if (isStart) cls += " range-start";
                if (isEnd && rangeActive) cls += " range-end";
                if (inRange && rangeActive) cls += " in-range";
                if (isToday) cls += " today";
                if (isWeekend) cls += " weekend";
                if (holiday) cls += " holiday";

                return (
                  <div
                    key={idx}
                    className={cls}
                    onClick={() => handleDayClick(date)}
                    onMouseEnter={() => handleDayHover(date)}
                    title={holiday || ""}
                  >
                    <span className="day-num">{cell.day}</span>
                    {holiday && <span className="holiday-dot" title={holiday} />}
                    {hasNote && <span className="note-dot" />}
                    {(isStart || isEnd) && (
                      <span className="range-indicator" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="legend">
              <span className="legend-item"><span className="legend-dot today-dot" /> Today</span>
              <span className="legend-item"><span className="legend-dot holiday-dot-l" /> Holiday</span>
              <span className="legend-item"><span className="legend-dot note-dot-l" /> Has note</span>
              <span className="legend-item legend-tip">
                {selecting ? "Click end date" : "Click to start range"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
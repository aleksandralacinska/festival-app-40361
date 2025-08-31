import React, { useEffect, useState, useMemo } from 'react';
import { fetchPublicEvents } from '../services/events';
import { useTranslation } from 'react-i18next';

function formatTimeRange(start, end, locale) {
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const fmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
  return e ? `${fmt.format(s)}–${fmt.format(e)}` : `${fmt.format(s)}`;
}
function dayKey(dtStr) {
  return new Date(dtStr).toISOString().slice(0, 10);
}
function dayTitle(dtStr, locale) {
  const d = new Date(dtStr);
  const fmt = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return fmt.format(d);
}

export default function SchedulePage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en-US' : 'pl-PL';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPublicEvents();
        if (!ignore) setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!ignore) setErr(t('error_schedule'));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [t]);

  const grouped = useMemo(() => {
    const sorted = [...events].sort(
      (a, b) => new Date(a.start_time) - new Date(b.start_time)
    );
    const map = new Map();
    for (const ev of sorted) {
      const k = dayKey(ev.start_time);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(ev);
    }
    return map;
  }, [events]);

  if (loading)
    return (
      <div className="page-message" aria-live="polite">
        {t('loading')}
      </div>
    );
  if (err)
    return (
      <div className="page-message error" role="alert">
        {err}
      </div>
    );

  const dayKeys = [...grouped.keys()];

  return (
    <div className="page-schedule">
      <h1 className="schedule-title">{t('schedule')}</h1>
      <p className="schedule-subtitle">{t('schedule_subtitle')}</p>

      {dayKeys.length === 0 && (
        <div className="card no-events">{t('no_public_events')}</div>
      )}

      {dayKeys.map((k) => {
        const items = grouped.get(k);
        return (
          <section key={k} className="schedule-section">
            <div className="schedule-day-header">
              <div className="accent-bar" />
              <h2 className="schedule-day-title">
                {dayTitle(items[0].start_time, locale)}
              </h2>
            </div>

            <div className="schedule-list">
              {items.map((ev) => (
                <article key={ev.id} className="event-card">
                  <div className="event-time">
                    {formatTimeRange(ev.start_time, ev.end_time, locale)}
                  </div>

                  <div className="event-body">
                    <div className="event-title">{ev.name}</div>
                    <div className="event-meta">{ev.location_name}</div>
                    <div className="event-chip">
                      <span className="chip">
                        {t(`category.${ev.category || 'event'}`)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

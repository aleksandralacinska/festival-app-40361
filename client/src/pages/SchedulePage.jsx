import React, { useEffect, useState, useMemo } from 'react';
import { fetchPublicEvents } from '../services/events';
import { useTranslation } from 'react-i18next';

const palette = {
  accent: '#fbb800',
  text: '#4a4a4a',
  textMuted: '#737373',
  bg: '#ffffff',
  bgAlt: '#ececec',
};

function formatTimeRange(start, end, locale) {
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const fmt = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
  return e ? `${fmt.format(s)}–${fmt.format(e)}` : `${fmt.format(s)}`;
}
function dayKey(dtStr){ return new Date(dtStr).toISOString().slice(0,10); }
function dayTitle(dtStr, locale){
  const d = new Date(dtStr);
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
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
    return () => { ignore = true; };
  }, [t]);

  const grouped = useMemo(() => {
    const sorted = [...events].sort((a,b)=> new Date(a.start_time) - new Date(b.start_time));
    const map = new Map();
    for (const ev of sorted) {
      const k = dayKey(ev.start_time);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(ev);
    }
    return map;
  }, [events]);

  if (loading) return <div style={{ padding: 24, fontFamily: 'Montserrat, sans-serif' }}>{t('loading')}</div>;
  if (err) return <div style={{ padding: 24, fontFamily: 'Montserrat, sans-serif', color: 'crimson' }}>{err}</div>;

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', padding: 24, background: palette.bgAlt, minHeight: '100vh' }}>
      <h1 style={{ margin: 0, marginBottom: 16, color: palette.text }}>{t('schedule')}</h1>
      <p style={{ marginTop: 0, color: palette.textMuted }}>{t('schedule_subtitle')}</p>

      {[...grouped.keys()].length === 0 && (
        <div style={{ background: palette.bg, borderRadius: 12, padding: 16, color: palette.text }}>
          {t('no_public_events')}
        </div>
      )}

      {[...grouped.keys()].map(k => {
        const items = grouped.get(k);
        return (
          <section key={k} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 24, background: palette.accent, borderRadius: 4 }} />
              <h2 style={{ margin: 0, fontSize: 18, color: palette.text }}>{dayTitle(items[0].start_time, locale)}</h2>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {items.map(ev => (
                <article key={ev.id} style={{
                  background: palette.bg,
                  borderRadius: 12,
                  padding: 12,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  display: 'grid',
                  gridTemplateColumns: 'minmax(120px,auto) 1fr',
                  gap: 12,
                  alignItems: 'center'
                }}>
                  <div style={{ color: palette.textMuted, fontWeight: 600 }}>
                    {formatTimeRange(ev.start_time, ev.end_time, locale)}
                  </div>
                  <div>
                    <div style={{ color: palette.text, fontWeight: 700 }}>{ev.name}</div>
                    <div style={{ color: palette.textMuted, fontSize: 12 }}>
                      {ev.location_name}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: 12,
                        background: palette.accent,
                        color: '#000',
                        borderRadius: 999,
                        padding: '2px 8px',
                        fontWeight: 600
                      }}>
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

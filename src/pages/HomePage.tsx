import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import platformLogo from '../assets/logo-main.png';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { useAuth } from '../context/AuthContext';
import { useChildren } from '../hooks/useChildren';
import { useAppointments } from '../hooks/useAppointments';
import { mergeAppointmentsWithExpected } from '../utils/appointmentPlanner';

const WHY_ITEMS = [
    { icon: '🛡️', keyTitle: 'home.why1Title', keyText: 'home.why1Text' },
    { icon: '👥', keyTitle: 'home.why2Title', keyText: 'home.why2Text' },
    { icon: '📋', keyTitle: 'home.why3Title', keyText: 'home.why3Text' },
    { icon: '💰', keyTitle: 'home.why4Title', keyText: 'home.why4Text' },
];

const FEATURES = [
    { icon: '🔐', keyTitle: 'home.cardAuthTitle', keyText: 'home.cardAuthText' },
    { icon: '👶', keyTitle: 'home.cardChildrenTitle', keyText: 'home.cardChildrenText' },
    { icon: '📅', keyTitle: 'home.cardScheduleTitle', keyText: 'home.cardScheduleText' },
];

type TipPhase = 'before' | 'during' | 'after';

interface HomeTip {
    icon: string;
    keyTitle: string;
    keyText: string;
    color: string;
    phase: TipPhase;
}

const VACCINES = [
    { antigen: 'BCG',         keyDisease: 'home.bcgDisease',   keyRoute: 'home.bcgRoute',   keyDoses: 'home.bcgDoses',   keyAge: 'home.bcgAge',   keySideEffects: 'home.bcgSideEffects',   color: '#0f766e' },
    { antigen: 'VPO',         keyDisease: 'home.vpoDisease',   keyRoute: 'home.vpoRoute',   keyDoses: 'home.vpoDoses',   keyAge: 'home.vpoAge',   keySideEffects: 'home.vpoSideEffects',   color: '#0369a1' },
    { antigen: 'Penta',       keyDisease: 'home.pentaDisease', keyRoute: 'home.pentaRoute', keyDoses: 'home.pentaDoses', keyAge: 'home.pentaAge', keySideEffects: 'home.pentaSideEffects', color: '#7c3aed' },
    { antigen: 'Pneumo (PCV)',keyDisease: 'home.pneumoDisease',keyRoute: 'home.pneumoRoute',keyDoses: 'home.pneumoDoses',keyAge: 'home.pneumoAge',keySideEffects: 'home.pneumoSideEffects',color: '#b45309' },
    { antigen: 'Rota',        keyDisease: 'home.rotaDisease',  keyRoute: 'home.rotaRoute',  keyDoses: 'home.rotaDoses',  keyAge: 'home.rotaAge',  keySideEffects: 'home.rotaSideEffects',  color: '#be185d' },
    { antigen: 'RR',          keyDisease: 'home.rrDisease',    keyRoute: 'home.rrRoute',    keyDoses: 'home.rrDoses',    keyAge: 'home.rrAge',    keySideEffects: 'home.rrSideEffects',    color: '#15803d' },
    { antigen: 'VPI',         keyDisease: 'home.vpiDisease',   keyRoute: 'home.vpiRoute',   keyDoses: 'home.vpiDoses',   keyAge: 'home.vpiAge',   keySideEffects: 'home.vpiSideEffects',   color: '#b91c1c' },
    { antigen: 'HB',          keyDisease: 'home.hbDisease',    keyRoute: 'home.hbRoute',    keyDoses: 'home.hbDoses',    keyAge: 'home.hbAge',    keySideEffects: 'home.hbSideEffects',    color: '#0e7490' },
    { antigen: 'HPV',         keyDisease: 'home.hpvDisease',   keyRoute: 'home.hpvRoute',   keyDoses: 'home.hpvDoses',   keyAge: 'home.hpvAge',   keySideEffects: 'home.hpvSideEffects',   color: '#9333ea' },
];

const CAROUSEL_TIPS: HomeTip[] = [
    { icon: '💉', keyTitle: 'home.tip1Title', keyText: 'home.tip1Text', color: '#0f766e', phase: 'before' },
    { icon: '📅', keyTitle: 'home.tip2Title', keyText: 'home.tip2Text', color: '#0369a1', phase: 'before' },
    { icon: '🌡️', keyTitle: 'home.tip3Title', keyText: 'home.tip3Text', color: '#b45309', phase: 'after' },
    { icon: '👶', keyTitle: 'home.tip4Title', keyText: 'home.tip4Text', color: '#7c3aed', phase: 'during' },
    { icon: '🏥', keyTitle: 'home.tip5Title', keyText: 'home.tip5Text', color: '#15803d', phase: 'during' },
    { icon: '📋', keyTitle: 'home.tip6Title', keyText: 'home.tip6Text', color: '#be185d', phase: 'after' },
];

type CalendarColumnKey = 'birth' | 'first4' | 'w8' | 'w10' | 'w12' | 'w16' | 'w18' | 'm6' | 'm9' | 'm12' | 'm18' | 'y5' | 'y11';

interface CalendarDose {
    label: string;
    highlight?: boolean;
}

interface CalendarSubRow {
    labelAr: string;
    labelFr: string;
    doses: Partial<Record<CalendarColumnKey, CalendarDose>>;
}

interface CalendarRow {
    vaccineAr: string;
    vaccineFr: string;
    color: string;
    subRows: CalendarSubRow[];
}

const CALENDAR_COLUMNS: Array<{ key: CalendarColumnKey; group: 'birth' | 'weeks' | 'months' | 'years'; ar: string; fr: string }> = [
    { key: 'birth', group: 'birth', ar: 'الولادة', fr: 'Naissance' },
    { key: 'first4', group: 'weeks', ar: 'أول 4 أسابيع', fr: 'Durant les 4 premières semaines' },
    { key: 'w8', group: 'weeks', ar: '8', fr: '8' },
    { key: 'w10', group: 'weeks', ar: '10', fr: '10' },
    { key: 'w12', group: 'weeks', ar: '12', fr: '12' },
    { key: 'w16', group: 'weeks', ar: '16', fr: '16' },
    { key: 'w18', group: 'weeks', ar: '18', fr: '18' },
    { key: 'm6', group: 'months', ar: '6', fr: '6' },
    { key: 'm9', group: 'months', ar: '9', fr: '9' },
    { key: 'm12', group: 'months', ar: '12', fr: '12' },
    { key: 'm18', group: 'months', ar: '18', fr: '18' },
    { key: 'y5', group: 'years', ar: '5', fr: '5' },
    { key: 'y11', group: 'years', ar: '11', fr: '11' },
];

const CALENDAR_ROWS: CalendarRow[] = [
    {
        vaccineAr: 'التهاب الكبد B (HB)',
        vaccineFr: 'Hépatite B (HB)',
        color: '#d1d5db',
        subRows: [
            { labelAr: 'أُعطي عند الولادة', labelFr: 'Administré à la naissance', doses: { birth: { label: 'HB1n' } } },
            { labelAr: 'لم يُعطَ عند الولادة', labelFr: 'Non administré à la naissance', doses: { first4: { label: 'HB1' } } },
        ],
    },
    {
        vaccineAr: 'السل (BCG)',
        vaccineFr: 'Tuberculose (BCG)',
        color: '#0ea5e9',
        subRows: [{ labelAr: '', labelFr: '', doses: { birth: { label: 'BCG' } } }],
    },
    {
        vaccineAr: 'شلل الأطفال الفموي',
        vaccineFr: 'Poliomyélite (Oral)',
        color: '#fbbf24',
        subRows: [{ labelAr: '', labelFr: '', doses: { birth: { label: 'VPO0' }, first4: { label: 'VPO1' }, w10: { label: 'VPO2' }, w12: { label: 'VPO3' }, y5: { label: 'VPO4' }, y11: { label: 'VPO5' } } }],
    },
    {
        vaccineAr: 'الخماسي DTC-Hib-HB',
        vaccineFr: 'DTC-Hib-HB (Vaccin Pentavalent)',
        color: '#111827',
        subRows: [{ labelAr: '', labelFr: '', doses: { first4: { label: 'Penta1' }, w10: { label: 'Penta2' }, w12: { label: 'Penta3' } } }],
    },
    {
        vaccineAr: 'المكورات الرئوية',
        vaccineFr: 'Pneumococcique',
        color: '#2563eb',
        subRows: [{ labelAr: '', labelFr: '', doses: { w8: { label: 'PCV1' }, w16: { label: 'PCV2' }, w18: { label: 'PCV3' }, m12: { label: 'PCV4' } } }],
    },
    {
        vaccineAr: 'فيروس الروتا',
        vaccineFr: 'Rotavirus',
        color: '#22c55e',
        subRows: [{ labelAr: '', labelFr: '', doses: { first4: { label: 'Rota1' }, w10: { label: 'Rota2' }, w12: { label: 'Rota3' } } }],
    },
    {
        vaccineAr: 'شلل الأطفال المعطل',
        vaccineFr: 'Poliomyélite (Inactive)',
        color: '#fde047',
        subRows: [{ labelAr: '', labelFr: '', doses: { w12: { label: 'VPI1', highlight: true }, m9: { label: 'VPI2', highlight: true } } }],
    },
    {
        vaccineAr: 'الحصبة والحصبة الألمانية',
        vaccineFr: 'Rougeole, Rubéole (RR)',
        color: '#f9a8d4',
        subRows: [{ labelAr: '', labelFr: '', doses: { m9: { label: 'RR1' }, m18: { label: 'RR2' } } }],
    },
    {
        vaccineAr: 'الدفتيريا والكزاز والسعال الديكي',
        vaccineFr: 'Diphtérie, Tétanos, Coqueluche (DTC)',
        color: '#fca5a5',
        subRows: [{ labelAr: '', labelFr: '', doses: { m18: { label: 'DTC1' }, y5: { label: 'DTC2' } } }],
    },
    {
        vaccineAr: 'فيروس الورم الحليمي',
        vaccineFr: 'Papillomavirus (HPV)',
        color: '#86efac',
        subRows: [{ labelAr: '', labelFr: '', doses: { y11: { label: 'HPV' } } }],
    },
];

const GROUP_LABELS = {
    ar: {
        vaccine: 'اللقاح ضد',
        note: 'ملاحظة',
        birth: 'الولادة',
        weeks: 'الأسابيع',
        months: 'الأشهر',
        years: 'السنوات',
        calendarTitle: 'الجدول الوطني للتلقيح 2025',
        tableHint: 'تمثيل مرجعي بصري لمواعيد الجرعات الأساسية حسب التسلسل الوطني',
        phaseBefore: 'قبل الموعد',
        phaseDuring: 'يوم التلقيح',
        phaseAfter: 'بعد التلقيح',
        tipsLead: 'خطوات عملية سريعة تساعدك على التحضير للجرعة ومتابعة الطفل بعدها بشكل صحيح.',
        tipsIndex: 'نصيحة {{index}} من {{total}}',
    },
    fr: {
        vaccine: 'Vaccin contre',
        note: 'Observation',
        birth: 'Naissance',
        weeks: 'Semaines',
        months: 'Mois',
        years: 'Années',
        calendarTitle: 'Calendrier National de Vaccination 2025',
        tableHint: 'Représentation visuelle de référence des principales doses selon le calendrier national',
        phaseBefore: 'Avant le rendez-vous',
        phaseDuring: 'Le jour du vaccin',
        phaseAfter: 'Après la vaccination',
        tipsLead: 'Des gestes simples pour bien préparer la visite vaccinale et surveiller l’enfant après la dose.',
        tipsIndex: 'Conseil {{index}} sur {{total}}',
    },
} as const;

const HomePage: React.FC = () => {
    const { language, t } = useAppPreferences();
    const { isAuthenticated, user } = useAuth();
    const { children } = useChildren();
    const { appointments } = useAppointments(isAuthenticated);
    const localizedGroupLabels = GROUP_LABELS[language];
    const [carouselIndex, setCarouselIndex] = useState(0);
    const activeTip = CAROUSEL_TIPS[carouselIndex];

    const formatInline = (template: string, params: Record<string, string | number>) => {
        return Object.entries(params).reduce((accumulator, [key, value]) => {
            return accumulator.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }, template);
    };

    const getPhaseLabel = (phase: TipPhase) => {
        if (phase === 'before') {
            return localizedGroupLabels.phaseBefore;
        }

        if (phase === 'during') {
            return localizedGroupLabels.phaseDuring;
        }

        return localizedGroupLabels.phaseAfter;
    };

    const mergedAppointments = useMemo(
        () => (isAuthenticated ? mergeAppointmentsWithExpected(appointments, children) : []),
        [appointments, children, isAuthenticated]
    );

    const overdueOrRelanceCount = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        return mergedAppointments.filter(
            (a) => (a.appointmentDate || a.date || '') < today && a.source === 'expected'
        ).length;
    }, [mergedAppointments]);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCarouselIndex((i) => (i + 1) % CAROUSEL_TIPS.length);
        }, 4000);
    };

    useEffect(() => {
        startTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    const goTo = (idx: number) => {
        setCarouselIndex(idx);
        startTimer();
    };
    const prev = () => goTo((carouselIndex - 1 + CAROUSEL_TIPS.length) % CAROUSEL_TIPS.length);
    const next = () => goTo((carouselIndex + 1) % CAROUSEL_TIPS.length);

    return (
        <main className="page page--home">
            <section className="hero">
                <div className="hero__panel">
                    <div className="hero__logo-wrap">
                        <img className="hero__logo" src={platformLogo} alt={t('home.logoAlt')} />
                    </div>
                    <span className="hero__eyebrow">{t('home.eyebrow')}</span>
                    <h2 className="hero__title">{t('home.title')}</h2>
                    <p className="hero__text">{t('home.text')}</p>
                    <div className="hero__actions">
                        {isAuthenticated ? (
                            <div className="hero__welcome-chip">{t('nav.welcomeUser', { name: user?.fullName || '' })}</div>
                        ) : (
                            <>
                                <Link to="/register" className="button button--primary">{t('home.createAccount')}</Link>
                                <Link to="/login" className="button button--secondary">{t('home.login')}</Link>
                            </>
                        )}
                    </div>
                </div>

                <aside className="hero__stats" aria-label={t('home.statsLabel')}>
                    <div className="metric">
                        <span className="metric__value">26</span>
                        <span className="metric__label">{t('home.stat1Label')}</span>
                    </div>
                    <div className="metric">
                        <span className="metric__value">14</span>
                        <span className="metric__label">{t('home.stat2Label')}</span>
                    </div>
                    <div className="metric">
                        <span className="metric__value">100%</span>
                        <span className="metric__label">{t('home.stat3Label')}</span>
                    </div>
                    {isAuthenticated && (
                        <>
                            <div className="metric metric--children">
                                <span className="metric__value">{children.length}</span>
                                <span className="metric__label">{t('home.statChildren')}</span>
                            </div>
                            <div className="metric metric--alert">
                                <span className="metric__value">{overdueOrRelanceCount}</span>
                                <span className="metric__label">{t('home.statRelance')}</span>
                            </div>
                        </>
                    )}
                </aside>
            </section>

            <section className="section">
                <p className="section-intro">{t('home.sectionIntro')}</p>
                <div className="section-grid">
                    {FEATURES.map((feature) => (
                        <article key={feature.keyTitle} className="content-card home-feature-card">
                            <span className="home-feature-card__icon" aria-hidden="true">{feature.icon}</span>
                            <h3>{t(feature.keyTitle)}</h3>
                            <p className="page-copy">{t(feature.keyText)}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="section">
                <div className="home-why-header">
                    <span className="hero__eyebrow">{t('home.pniCalEyebrow')}</span>
                    <h3 className="home-section-title">{t('home.pniCalTitle')}</h3>
                    <p className="section-intro">{t('home.pniCalSubtitle')}</p>
                </div>
                <div className="home-calendar-frame">
                    <div className="home-calendar-frame__header">
                        <div>
                            <h4 className="home-calendar-frame__title">{localizedGroupLabels.calendarTitle}</h4>
                            <p className="home-calendar-frame__hint">{localizedGroupLabels.tableHint}</p>
                        </div>
                    </div>
                    <table className="home-calendar-table">
                        <thead>
                            <tr>
                                <th rowSpan={2}>{localizedGroupLabels.vaccine}</th>
                                <th rowSpan={2}>{localizedGroupLabels.note}</th>
                                <th colSpan={1}>{localizedGroupLabels.birth}</th>
                                <th colSpan={6}>{localizedGroupLabels.weeks}</th>
                                <th colSpan={4}>{localizedGroupLabels.months}</th>
                                <th colSpan={2}>{localizedGroupLabels.years}</th>
                            </tr>
                            <tr>
                                {CALENDAR_COLUMNS.map((column) => (
                                    <th key={column.key}>{language === 'ar' ? column.ar : column.fr}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {CALENDAR_ROWS.flatMap((row) => row.subRows.map((subRow, index) => (
                                <tr key={`${row.vaccineFr}-${index}`}>
                                    {index === 0 ? (
                                        <th rowSpan={row.subRows.length} className="home-calendar-table__vaccine" style={{ '--calendar-row-color': row.color } as React.CSSProperties}>
                                            {language === 'ar' ? row.vaccineAr : row.vaccineFr}
                                        </th>
                                    ) : null}
                                    <td className="home-calendar-table__note">{language === 'ar' ? subRow.labelAr : subRow.labelFr}</td>
                                    {CALENDAR_COLUMNS.map((column) => {
                                        const dose = subRow.doses[column.key as keyof typeof subRow.doses];

                                        return (
                                            <td key={column.key} className="home-calendar-table__slot">
                                                {dose ? (
                                                    <span className={`home-calendar-pill${dose.highlight ? ' home-calendar-pill--highlight' : ''}`}>
                                                        {dose.label}
                                                    </span>
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="section">
                <div className="home-why-header">
                    <span className="hero__eyebrow">{t('home.whyEyebrow')}</span>
                    <h3 className="home-section-title">{t('home.whyTitle')}</h3>
                    <p className="section-intro">{t('home.whySubtitle')}</p>
                </div>
                <div className="home-why-grid">
                    {WHY_ITEMS.map((item) => (
                        <div key={item.keyTitle} className="home-why-card">
                            <span className="home-why-card__icon" aria-hidden="true">{item.icon}</span>
                            <h4 className="home-why-card__title">{t(item.keyTitle)}</h4>
                            <p className="home-why-card__text">{t(item.keyText)}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section">
                <div className="home-why-header">
                    <span className="hero__eyebrow">{t('home.tipsEyebrow')}</span>
                    <h3 className="home-section-title">{t('home.tipsTitle')}</h3>
                    <p className="section-intro">{localizedGroupLabels.tipsLead}</p>
                </div>
                <div className="home-tips-layout" aria-label={t('home.tipsTitle')}>
                    <article className="home-tip-feature" style={{ '--tip-color': activeTip.color } as React.CSSProperties}>
                        <div className="home-tip-feature__meta">
                            <span className={`home-tip-phase home-tip-phase--${activeTip.phase}`}>{getPhaseLabel(activeTip.phase)}</span>
                            <span className="home-tip-feature__progress">
                                {formatInline(localizedGroupLabels.tipsIndex, { index: carouselIndex + 1, total: CAROUSEL_TIPS.length })}
                            </span>
                        </div>
                        <div className="home-tip-feature__body">
                            <span className="home-tip-feature__icon" aria-hidden="true">{activeTip.icon}</span>
                            <div className="home-tip-feature__content">
                                <h4 className="home-tip-feature__title">{t(activeTip.keyTitle)}</h4>
                                <p className="home-tip-feature__text">{t(activeTip.keyText)}</p>
                            </div>
                        </div>
                        <div className="home-tip-feature__controls">
                            <button type="button" className="home-carousel__arrow" onClick={prev} aria-label={t('home.prevTip')}>‹</button>
                            <div className="home-carousel__dots">
                                {CAROUSEL_TIPS.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        className={`home-carousel__dot${idx === carouselIndex ? ' home-carousel__dot--active' : ''}`}
                                        onClick={() => goTo(idx)}
                                        aria-label={t('home.tipNumber', { index: idx + 1 })}
                                    />
                                ))}
                            </div>
                            <button type="button" className="home-carousel__arrow" onClick={next} aria-label={t('home.nextTip')}>›</button>
                        </div>
                    </article>
                    <div className="home-tip-list">
                        {CAROUSEL_TIPS.map((tip, idx) => (
                            <button
                                key={tip.keyTitle}
                                type="button"
                                className={`home-tip-list__item${idx === carouselIndex ? ' home-tip-list__item--active' : ''}`}
                                onClick={() => goTo(idx)}
                            >
                                <span className="home-tip-list__icon" aria-hidden="true">{tip.icon}</span>
                                <span className="home-tip-list__copy">
                                    <span className={`home-tip-phase home-tip-phase--${tip.phase}`}>{getPhaseLabel(tip.phase)}</span>
                                    <strong>{t(tip.keyTitle)}</strong>
                                    <small>{t(tip.keyText)}</small>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="home-why-header">
                    <span className="hero__eyebrow">{t('home.vaccinesEyebrow')}</span>
                    <h3 className="home-section-title">{t('home.vaccinesTitle')}</h3>
                    <p className="section-intro">{t('home.vaccinesSubtitle')}</p>
                </div>
                <div className="home-vaccines-grid">
                    {VACCINES.map((vaccine) => (
                        <article
                            key={vaccine.antigen}
                            className="home-vaccine-card"
                            style={{ '--vaccine-color': vaccine.color } as React.CSSProperties}
                        >
                            <div className="home-vaccine-card__header">
                                <span className="home-vaccine-card__name">{vaccine.antigen}</span>
                            </div>
                            <div className="home-vaccine-card__body">
                                <div className="home-vaccine-card__row">
                                    <span className="home-vaccine-card__label">🦠 {t('home.vaccineDisease')}</span>
                                    <span className="home-vaccine-card__value">{t(vaccine.keyDisease)}</span>
                                </div>
                                <div className="home-vaccine-card__row">
                                    <span className="home-vaccine-card__label">💉 {t('home.vaccineRoute')}</span>
                                    <span className="home-vaccine-card__value">{t(vaccine.keyRoute)}</span>
                                </div>
                                <div className="home-vaccine-card__row">
                                    <span className="home-vaccine-card__label">📋 {t('home.vaccineDoses')}</span>
                                    <span className="home-vaccine-card__value">{t(vaccine.keyDoses)}</span>
                                </div>
                                <div className="home-vaccine-card__row">
                                    <span className="home-vaccine-card__label">👶 {t('home.vaccineAge')}</span>
                                    <span className="home-vaccine-card__value">{t(vaccine.keyAge)}</span>
                                </div>
                                <div className="home-vaccine-card__side-effects">
                                    <span className="home-vaccine-card__label">⚠️ {t('home.vaccineSideEffects')}</span>
                                    <span className="home-vaccine-card__value home-vaccine-card__value--muted">{t(vaccine.keySideEffects)}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default HomePage;

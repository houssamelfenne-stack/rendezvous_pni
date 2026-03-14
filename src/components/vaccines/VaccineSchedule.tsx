import React, { useEffect, useMemo, useState } from 'react';
import { useAppPreferences } from '../../context/AppPreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useChildren } from '../../hooks/useChildren';
import { buildPniSchedule, DEFAULT_PNI_BIRTH_DATE, EXCLUSIVE_PNI_ANTIGEN_GROUPS, normalizePniAntigen } from '../../utils/pniSchedule';
import { getChildVaccineDoses, saveChildVaccineDose } from '../../services/vaccineService';
import { getHealthCenterChildren } from '../../services/healthCenterService';
import { Child } from '../../types/Child';

const getDoseKey = (antigen: string, offsetDays: number) => `${antigen}-${offsetDays}`;

const normalizeExclusiveCompletedDates = (completedDates: Record<string, string>, schedule: ReturnType<typeof buildPniSchedule>) => {
    const nextValue = { ...completedDates };

    EXCLUSIVE_PNI_ANTIGEN_GROUPS.forEach((group) => {
        const completedKeys = group
            .map((antigen) => schedule.find((dose) => dose.antigen === antigen))
            .filter((dose): dose is ReturnType<typeof buildPniSchedule>[number] => Boolean(dose))
            .map((dose) => getDoseKey(dose.antigen, dose.offsetDays))
            .filter((doseKey) => Boolean(nextValue[doseKey]));

        completedKeys.slice(1).forEach((doseKey) => {
            delete nextValue[doseKey];
        });
    });

    return nextValue;
};

const getTodayIso = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${year}-${month}-${day}`;
};

const formatInputDate = (value: string) => {
    if (!value) {
        return '-';
    }

    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
};

const VaccineSchedule: React.FC = () => {
    const { isRtl, t } = useAppPreferences();
    const { isAuthenticated, user } = useAuth();
    const { children: citizenChildren, loading: citizenLoading, error: citizenError } = useChildren(isAuthenticated && user?.role === 'citizen');
    const [healthCenterChildren, setHealthCenterChildren] = useState<Child[]>([]);
    const [healthCenterLoading, setHealthCenterLoading] = useState(false);
    const [healthCenterError, setHealthCenterError] = useState<string | null>(null);
    const [selectedChildId, setSelectedChildId] = useState('manual');
    const [birthDate, setBirthDate] = useState(DEFAULT_PNI_BIRTH_DATE);
    const [completedDoseDates, setCompletedDoseDates] = useState<Record<string, string>>({});
    const [trackingError, setTrackingError] = useState('');
    const [trackingLoading, setTrackingLoading] = useState(false);

    useEffect(() => {
        const loadHealthCenterChildren = async () => {
            if (!isAuthenticated || (user?.role !== 'health-center' && user?.role !== 'admin')) {
                setHealthCenterChildren([]);
                setHealthCenterError(null);
                setHealthCenterLoading(false);
                return;
            }

            try {
                setHealthCenterLoading(true);
                const children = await getHealthCenterChildren();
                setHealthCenterChildren(children);
                setHealthCenterError(null);
            } catch {
                setHealthCenterChildren([]);
                setHealthCenterError('vaccine.healthCenterChildrenError');
            } finally {
                setHealthCenterLoading(false);
            }
        };

        void loadHealthCenterChildren();
    }, [isAuthenticated, user?.role]);

    const children = user?.role === 'health-center' || user?.role === 'admin' ? healthCenterChildren : citizenChildren;
    const loading = user?.role === 'health-center' || user?.role === 'admin' ? healthCenterLoading : citizenLoading;
    const error = user?.role === 'health-center' || user?.role === 'admin' ? healthCenterError : citizenError;

    const effectiveBirthDate = birthDate || DEFAULT_PNI_BIRTH_DATE;
    const schedule = useMemo(() => buildPniSchedule(effectiveBirthDate), [effectiveBirthDate]);
    const selectedChild = children.find((child) => child.id === selectedChildId);
    const trackingKey = selectedChild ? `pni-tracking:${selectedChild.id}` : `pni-tracking:manual:${effectiveBirthDate}`;

    useEffect(() => {
        const loadTracking = async () => {
            setTrackingError('');

            if (selectedChild && selectedChildId !== 'manual') {
                setTrackingLoading(true);

                try {
                    const serverRecords = await getChildVaccineDoses(selectedChildId);
                    const mappedRecords = serverRecords.reduce<Record<string, string>>((accumulator, record) => ({
                        ...accumulator,
                        [getDoseKey(normalizePniAntigen(record.antigen), record.offsetDays)]: record.completedDate
                    }), {});

                    setCompletedDoseDates(normalizeExclusiveCompletedDates(mappedRecords, schedule));
                } catch (loadError) {
                    setTrackingError('vaccine.loadDoseError');
                    setCompletedDoseDates({});
                } finally {
                    setTrackingLoading(false);
                }

                return;
            }

            const savedValue = localStorage.getItem(trackingKey);

            if (!savedValue) {
                setCompletedDoseDates({});
                return;
            }

            try {
                const parsedValue = JSON.parse(savedValue) as Record<string, string>;
                const migratedValue = Object.entries(parsedValue).reduce<Record<string, string>>((accumulator, [doseKey, completedDate]) => {
                    const [antigen, offsetDays] = doseKey.split('-');
                    const normalizedDoseKey = `${normalizePniAntigen(antigen)}-${offsetDays}`;

                    accumulator[normalizedDoseKey] = completedDate;
                    return accumulator;
                }, {});

                setCompletedDoseDates(normalizeExclusiveCompletedDates(migratedValue, schedule));
            } catch {
                setCompletedDoseDates({});
            }
        };

        loadTracking();
    }, [selectedChild, selectedChildId, trackingKey, schedule]);

    useEffect(() => {
        if (selectedChild && selectedChildId !== 'manual') {
            return;
        }

        localStorage.setItem(trackingKey, JSON.stringify(completedDoseDates));
    }, [completedDoseDates, selectedChild, selectedChildId, trackingKey]);

    const handleChildChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextChildId = event.target.value;
        setSelectedChildId(nextChildId);

        if (nextChildId === 'manual') {
            return;
        }

        const child = children.find((entry) => entry.id === nextChildId);

        if (child?.dateOfBirth) {
            setBirthDate(child.dateOfBirth);
        }
    };

    const handleBirthDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedChildId('manual');
        setBirthDate(event.target.value);
    };

    const buildNextCompletedDoseDates = (currentValue: Record<string, string>, doseKey: string, value: string) => {
        const nextValue = {
            ...currentValue,
            [doseKey]: value
        };

        const currentDose = schedule.find((dose) => getDoseKey(dose.antigen, dose.offsetDays) === doseKey);

        if (currentDose && value) {
            EXCLUSIVE_PNI_ANTIGEN_GROUPS.forEach((group) => {
                if (!group.includes(currentDose.antigen)) {
                    return;
                }

                group
                    .filter((antigen) => antigen !== currentDose.antigen)
                    .forEach((antigen) => {
                        const siblingDose = schedule.find((dose) => dose.antigen === antigen);

                        if (siblingDose) {
                            delete nextValue[getDoseKey(siblingDose.antigen, siblingDose.offsetDays)];
                        }
                    });
            });
        }

        if (!value) {
            delete nextValue[doseKey];
        }

        return normalizeExclusiveCompletedDates(nextValue, schedule);
    };

    const handleCompletedDoseDateChange = async (doseKey: string, value: string) => {
        const nextCompletedDoseDates = buildNextCompletedDoseDates(completedDoseDates, doseKey, value);
        const previousValue = completedDoseDates;

        setTrackingError('');
        setCompletedDoseDates(nextCompletedDoseDates);

        if (!selectedChild || selectedChildId === 'manual') {
            return;
        }

        const currentDose = schedule.find((dose) => getDoseKey(dose.antigen, dose.offsetDays) === doseKey);

        if (!currentDose) {
            return;
        }

        try {
            setTrackingLoading(true);
            await saveChildVaccineDose(selectedChildId, {
                antigen: currentDose.antigen,
                offsetDays: currentDose.offsetDays,
                completedDate: value
            });

            const siblingGroup = EXCLUSIVE_PNI_ANTIGEN_GROUPS.find((group) => group.includes(currentDose.antigen));

            if (siblingGroup && value) {
                const siblingDose = siblingGroup
                    .filter((antigen) => antigen !== currentDose.antigen)
                    .map((antigen) => schedule.find((dose) => dose.antigen === antigen))
                    .find((dose) => Boolean(dose));

                if (siblingDose) {
                    await saveChildVaccineDose(selectedChildId, {
                        antigen: siblingDose.antigen,
                        offsetDays: siblingDose.offsetDays,
                        completedDate: ''
                    });
                }
            }
        } catch (saveError) {
            setCompletedDoseDates(previousValue);
            setTrackingError('vaccine.saveDoseError');
        } finally {
            setTrackingLoading(false);
        }
    };

    const todayIso = getTodayIso();
    const visibleSchedule = schedule.filter((dose) => {
        const matchingGroup = EXCLUSIVE_PNI_ANTIGEN_GROUPS.find((group) => group.includes(dose.antigen));

        if (!matchingGroup) {
            return true;
        }

        const completedDose = matchingGroup
            .map((antigen) => schedule.find((entry) => entry.antigen === antigen))
            .filter((entry): entry is ReturnType<typeof buildPniSchedule>[number] => Boolean(entry))
            .find((entry) => Boolean(completedDoseDates[getDoseKey(entry.antigen, entry.offsetDays)]));

        if (!completedDose) {
            return true;
        }

        return completedDose.antigen === dose.antigen;
    });

    return (
        <section className="content-card vaccine-schedule-card" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="vaccine-schedule-card__header">
                <span className="hero__eyebrow">{t('vaccine.eyebrow')}</span>
                <h2>{t('vaccine.title')}</h2>
                <p className="page-copy">{t('vaccine.text')}</p>
            </div>

            <div className="vaccine-schedule-controls">
                {children.length > 0 ? (
                    <label className="form-input">
                        <span>{t('vaccine.selectChild')}</span>
                        <select value={selectedChildId} onChange={handleChildChange}>
                            <option value="manual">{t('vaccine.manual')}</option>
                            {children.map((child) => (
                                <option key={child.id} value={child.id}>
                                    {child.fullName}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : null}

                <label className="form-input">
                    <span>{t('vaccine.birthDate')}</span>
                    <input type="date" value={birthDate} onChange={handleBirthDateChange} />
                </label>
            </div>

            {selectedChild ? (
                <p className="vaccine-schedule-summary">
                    {t('vaccine.selectedSummary', { name: selectedChild.fullName, date: schedule[0].scheduledDate })}
                </p>
            ) : (
                <p className="vaccine-schedule-summary">
                    {t('vaccine.manualSummary', { date: schedule[0].scheduledDate })}
                </p>
            )}

            <div className="vaccine-status-overview">
                <div className="metric vaccine-status-card">
                    <span className="metric__value">{visibleSchedule.filter((dose) => Boolean(completedDoseDates[getDoseKey(dose.antigen, dose.offsetDays)])).length}</span>
                    <span className="metric__label">{t('vaccine.completed')}</span>
                </div>
                <div className="metric vaccine-status-card">
                    <span className="metric__value">{visibleSchedule.filter((dose) => !completedDoseDates[getDoseKey(dose.antigen, dose.offsetDays)] && dose.scheduledDateIso < todayIso).length}</span>
                    <span className="metric__label">{t('vaccine.catchup')}</span>
                </div>
                <div className="metric vaccine-status-card">
                    <span className="metric__value">{visibleSchedule.filter((dose) => !completedDoseDates[getDoseKey(dose.antigen, dose.offsetDays)] && dose.scheduledDateIso >= todayIso).length}</span>
                    <span className="metric__label">{t('vaccine.pending')}</span>
                </div>
            </div>

            {loading || trackingLoading ? <p className="page-copy">{t('vaccine.loading')}</p> : null}
            {error ? <p className="error">{t(error)}</p> : null}
            {trackingError ? <p className="error">{t(trackingError)}</p> : null}

            <div className="vaccine-schedule-table-wrapper">
                <table className="vaccine-schedule-table">
                    <thead>
                        <tr>
                            <th>{t('vaccine.table.order')}</th>
                            <th>{t('vaccine.table.age')}</th>
                            <th>{t('vaccine.table.antigen')}</th>
                            <th>{t('vaccine.table.scheduledDate')}</th>
                            <th>{t('vaccine.table.completedDate')}</th>
                            <th>{t('vaccine.table.catchup')}</th>
                            <th>{t('vaccine.table.relaunch')}</th>
                            <th>{t('vaccine.table.note')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleSchedule.map((dose, index) => {
                            const doseKey = getDoseKey(dose.antigen, dose.offsetDays);
                            const completedDate = completedDoseDates[doseKey] || '';
                            const isOverdue = !completedDate && dose.scheduledDateIso < todayIso;
                            const relanceLabel = completedDate ? t('vaccine.notRequired') : isOverdue ? t('vaccine.inRelaunch') : t('vaccine.underTracking');

                            return (
                                <tr key={`${dose.antigen}-${dose.ageLabel}-${index}`} className={isOverdue ? 'vaccine-schedule-table__row--overdue' : ''}>
                                    <td>{index + 1}</td>
                                    <td>{dose.ageLabel}</td>
                                    <td>{dose.antigen}</td>
                                    <td>{dose.scheduledDate}</td>
                                    <td>
                                        <input
                                            className="vaccine-date-input"
                                            type="date"
                                            value={completedDate}
                                            onChange={(event) => {
                                                void handleCompletedDoseDateChange(doseKey, event.target.value);
                                            }}
                                        />
                                        <div className="vaccine-date-caption">{formatInputDate(completedDate)}</div>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${isOverdue ? 'status-pill--alert' : 'status-pill--ok'}`}>
                                            {isOverdue ? t('vaccine.yes') : t('vaccine.no')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${isOverdue ? 'status-pill--warn' : completedDate ? 'status-pill--ok' : 'status-pill--muted'}`}>
                                            {relanceLabel}
                                        </span>
                                    </td>
                                    <td>{dose.note || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default VaccineSchedule;
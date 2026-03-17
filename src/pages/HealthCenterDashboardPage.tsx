import React, { useEffect, useMemo, useState } from 'react';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { AdminAppointment, AdminChild, AdminVaccineDose } from '../services/adminService';
import {
    createHealthCenterAppointment,
    getHealthCenterAppointments,
    getHealthCenterChildren,
    getHealthCenterVaccineDoses,
    notifyHealthCenterAppointment,
    updateHealthCenterAppointment
} from '../services/healthCenterService';
import { getVaccines } from '../services/vaccineService';
import { Vaccine } from '../types/Vaccine';
import { buildCompletedPniDoseKeys, buildPniSchedule, filterExclusivePniDoses, normalizePniAntigen, PniDoseScheduleEntry } from '../utils/pniSchedule';

interface AppointmentFormState {
    childId: string;
    appointmentDate: string;
    notificationMessage: string;
}

interface SuggestedDoseGroup {
    doses: PniDoseScheduleEntry[];
    primaryDose: PniDoseScheduleEntry;
    primaryVaccineId: string;
    appointmentDate: string;
    notificationMessage: string;
    notes: string;
}

const emptyAppointmentForm: AppointmentFormState = {
    childId: '',
    appointmentDate: '',
    notificationMessage: ''
};

const normalizeSearchValue = (value: string) => value.trim().toLowerCase();

const findSuggestedVaccineId = (antigen: string, vaccines: Vaccine[]) => {
    const normalizedAntigen = normalizeSearchValue(antigen);
    const directMatch = vaccines.find((vaccine) => {
        const normalizedName = normalizeSearchValue(vaccine.name);
        return normalizedName === normalizedAntigen
            || normalizedName.includes(normalizedAntigen)
            || vaccine.schedule.some((entry) => normalizeSearchValue(entry).includes(normalizedAntigen));
    });

    if (directMatch) {
        return directMatch.id;
    }

    const aliases: Array<{ test: (value: string) => boolean; matcher: (vaccine: Vaccine) => boolean }> = [
        {
            test: (value) => value.startsWith('hb'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('hepatitis b') || normalizeSearchValue(vaccine.name).includes('(hb)')
        },
        {
            test: (value) => value.startsWith('bcg'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('bcg')
        },
        {
            test: (value) => value.startsWith('vpo') || value.startsWith('polio'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('oral polio')
        },
        {
            test: (value) => value.startsWith('penta'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('pentavalent')
        },
        {
            test: (value) => value.startsWith('pcv') || value.startsWith('pneumo'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('pcv') || normalizeSearchValue(vaccine.name).includes('pneumococcal')
        },
        {
            test: (value) => value.startsWith('rota'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('rotavirus')
        },
        {
            test: (value) => value.startsWith('vpi'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('vpi') || normalizeSearchValue(vaccine.name).includes('inactivated polio')
        },
        {
            test: (value) => value.startsWith('rr'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('rr') || normalizeSearchValue(vaccine.name).includes('rougeole')
        },
        {
            test: (value) => value.startsWith('dtc'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('dtc') || normalizeSearchValue(vaccine.name).includes('diphtheria')
        },
        {
            test: (value) => value.startsWith('hpv'),
            matcher: (vaccine) => normalizeSearchValue(vaccine.name).includes('hpv')
        }
    ];

    const aliasMatch = aliases.find((alias) => alias.test(normalizedAntigen));
    return aliasMatch ? vaccines.find(aliasMatch.matcher)?.id || '' : '';
};

const getLocalizedAppointmentStatus = (translate: (key: string, params?: Record<string, string | number>) => string, status?: string) => {
    switch (status || 'scheduled') {
        case 'completed':
            return translate('admin.status.completed');
        case 'overdue':
            return translate('admin.status.overdue');
        case 'cancelled':
            return translate('admin.status.cancelled');
        default:
            return translate('admin.status.scheduled');
    }
};

const HealthCenterDashboardPage: React.FC = () => {
    const { language, t } = useAppPreferences();
    const [children, setChildren] = useState<AdminChild[]>([]);
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [vaccineDoses, setVaccineDoses] = useState<AdminVaccineDose[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [query, setQuery] = useState('');
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
    const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState>(emptyAppointmentForm);
    const [suggestedDoseGroup, setSuggestedDoseGroup] = useState<SuggestedDoseGroup | null>(null);

    const loadData = async () => {
        setLoading(true);
        setErrorMessage('');

        const results = await Promise.allSettled([
            getHealthCenterChildren(),
            getHealthCenterAppointments(),
            getHealthCenterVaccineDoses(),
            getVaccines()
        ]);

        const [childrenResult, appointmentsResult, vaccineDosesResult, vaccinesResult] = results;
        const errors: string[] = [];

        if (childrenResult.status === 'fulfilled') {
            setChildren(childrenResult.value);
        } else {
            setChildren([]);
            errors.push(t('healthCenter.loadChildrenError'));
        }

        if (appointmentsResult.status === 'fulfilled') {
            setAppointments(appointmentsResult.value);
        } else {
            setAppointments([]);
            errors.push(t('healthCenter.loadAppointmentsError'));
        }

        if (vaccineDosesResult.status === 'fulfilled') {
            setVaccineDoses(vaccineDosesResult.value);
        } else {
            setVaccineDoses([]);
            errors.push(t('healthCenter.loadCompletedDosesError'));
        }

        if (vaccinesResult.status === 'fulfilled') {
            setVaccines(vaccinesResult.value);
        } else {
            setVaccines([]);
            errors.push(t('healthCenter.loadVaccinesError'));
        }

        if (errors.length > 0) {
            setErrorMessage(errors.join(' '));
        }

        setLoading(false);
    };

    useEffect(() => {
        void loadData();
    }, [language]);

    const todayIso = new Date().toISOString().slice(0, 10);
    const normalizedQuery = query.trim().toLowerCase();

    const buildSuggestedDoseGroup = (child: AdminChild, preferredAppointmentDate?: string): SuggestedDoseGroup | null => {
        const completedDoseKeys = buildCompletedPniDoseKeys(
            vaccineDoses.filter((dose) => dose.childId === child.id && Boolean(dose.completedDate))
        );

        const pendingDoses = filterExclusivePniDoses(
            buildPniSchedule(child.dateOfBirth)
                .filter((dose) => !completedDoseKeys.has(`${normalizePniAntigen(dose.antigen)}:${dose.offsetDays}`)),
            completedDoseKeys
        )
            .sort((left, right) => left.scheduledDateIso.localeCompare(right.scheduledDateIso));

        if (pendingDoses.length === 0) {
            return null;
        }

        const missedBirthDose = normalizePniAntigen(pendingDoses[0].antigen) === 'HBn' && todayIso > child.dateOfBirth;
        const firstEligibleDose = missedBirthDose
            ? pendingDoses.find((dose) => normalizePniAntigen(dose.antigen) === 'HB1') || pendingDoses.find((dose) => dose.offsetDays === 28 && normalizePniAntigen(dose.antigen) !== 'HBn') || pendingDoses[0]
            : pendingDoses[0];

        const doses = pendingDoses.filter((dose) => {
            if (dose.scheduledDateIso !== firstEligibleDose.scheduledDateIso) {
                return false;
            }

            if (missedBirthDose && normalizePniAntigen(dose.antigen) === 'HBn') {
                return false;
            }

            return true;
        });

        const groupedDoses = doses.length > 0 ? doses : [firstEligibleDose];
        const primaryVaccineId = groupedDoses.map((dose) => findSuggestedVaccineId(dose.antigen, vaccines)).find(Boolean) || '';
        const doseLabels = groupedDoses.map((dose) => dose.antigen).join(language === 'ar' ? '، ' : ', ');
        const appointmentDate = preferredAppointmentDate || (firstEligibleDose.scheduledDateIso < todayIso ? todayIso : firstEligibleDose.scheduledDateIso);
        const notificationMessage = t('healthCenter.suggestionNotification', { date: appointmentDate, name: child.fullName, doses: doseLabels });
        const notes = t('healthCenter.suggestionNotes', { date: firstEligibleDose.scheduledDate, doses: doseLabels });

        return {
            doses: groupedDoses,
            primaryDose: firstEligibleDose,
            primaryVaccineId,
            appointmentDate,
            notificationMessage,
            notes
        };
    };

    const applyChildSuggestion = (child: AdminChild, preferredAppointmentDate?: string, showStatus = true) => {
        const suggestion = buildSuggestedDoseGroup(child, preferredAppointmentDate);
        setEditingAppointmentId(null);

        if (!suggestion) {
            setSuggestedDoseGroup(null);
            setAppointmentForm({
                childId: child.id,
                appointmentDate: preferredAppointmentDate || '',
                notificationMessage: t('healthCenter.noPendingNotification', { name: child.fullName })
            });

            if (showStatus) {
                setStatusMessage(t('healthCenter.noPendingStatus'));
            }
            return;
        }

        setSuggestedDoseGroup(suggestion);
        setAppointmentForm({
            childId: child.id,
            appointmentDate: suggestion.appointmentDate,
            notificationMessage: suggestion.notificationMessage
        });

        if (showStatus) {
            setStatusMessage(t('healthCenter.suggestionAuto', {
                doses: suggestion.doses.map((dose) => dose.antigen).join(language === 'ar' ? '، ' : ', ')
            }));
        }
    };

    const relanceChildren = useMemo(() => {
        return children
            .map((child) => {
                const completedDoseKeys = buildCompletedPniDoseKeys(
                    vaccineDoses.filter((dose) => dose.childId === child.id && Boolean(dose.completedDate))
                );

                const overdueDoses = filterExclusivePniDoses(
                    buildPniSchedule(child.dateOfBirth)
                        .filter((dose) => dose.scheduledDateIso < todayIso)
                        .filter((dose) => !completedDoseKeys.has(`${dose.antigen}:${dose.offsetDays}`)),
                    completedDoseKeys
                );

                if (overdueDoses.length === 0) {
                    return null;
                }

                return {
                    child,
                    overdueDoses,
                    overdueCount: overdueDoses.length,
                    oldestScheduledDateIso: overdueDoses[0].scheduledDateIso
                };
            })
            .filter((entry): entry is { child: AdminChild; overdueDoses: ReturnType<typeof buildPniSchedule>; overdueCount: number; oldestScheduledDateIso: string } => Boolean(entry))
            .filter((entry) => {
                if (!normalizedQuery) {
                    return true;
                }

                return [
                    entry.child.fullName,
                    entry.child.user?.fullName || '',
                    entry.child.user?.phoneNumber || '',
                    entry.overdueDoses.map((dose) => dose.antigen).join(' ')
                ].some((value) => value.toLowerCase().includes(normalizedQuery));
            })
            .sort((left, right) => {
                if (right.overdueCount !== left.overdueCount) {
                    return right.overdueCount - left.overdueCount;
                }

                return left.oldestScheduledDateIso.localeCompare(right.oldestScheduledDateIso);
            });
    }, [children, vaccineDoses, todayIso, normalizedQuery]);

    const searchableChildren = useMemo(() => {
        return children
            .filter((child) => {
                if (!normalizedQuery) {
                    return false;
                }

                return [
                    child.fullName,
                    child.user?.fullName || '',
                    child.user?.phoneNumber || '',
                    child.nationalId || ''
                ].some((value) => value.toLowerCase().includes(normalizedQuery));
            })
            .slice(0, 8);
    }, [children, normalizedQuery]);

    const overdueAppointments = appointments.filter((appointment) => (appointment.appointmentDate || '') < todayIso && (appointment.status || 'scheduled') !== 'completed');
    const todayAppointments = appointments.filter((appointment) => (appointment.appointmentDate || '') === todayIso);
    const scheduledAppointments = appointments
        .filter((appointment) => {
            if (!normalizedQuery) {
                return true;
            }

            return [
                appointment.childName || '',
                appointment.userName || '',
                appointment.vaccine || '',
                appointment.notificationMessage || '',
                appointment.notes || ''
            ].some((value) => value.toLowerCase().includes(normalizedQuery));
        })
        .sort((left, right) => (left.appointmentDate || '').localeCompare(right.appointmentDate || ''));

    const handleSelectChild = (childId: string) => {
        const child = children.find((entry) => entry.id === childId);

        if (!child) {
            setSuggestedDoseGroup(null);
            setAppointmentForm((current) => ({ ...current, childId }));
            return;
        }

        applyChildSuggestion(child);
    };

    const handleAppointmentDateChange = (appointmentDate: string) => {
        setAppointmentForm((current) => ({ ...current, appointmentDate }));

        const child = children.find((entry) => entry.id === appointmentForm.childId);
        if (!child) {
            return;
        }

        applyChildSuggestion(child, appointmentDate, false);
    };

    const handleScheduleAppointment = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');
        setStatusMessage('');

        const child = children.find((entry) => entry.id === appointmentForm.childId);
        if (!child || !suggestedDoseGroup) {
            setErrorMessage(t('healthCenter.selectChildError'));
            return;
        }

        if (!suggestedDoseGroup.primaryVaccineId) {
            setErrorMessage(t('healthCenter.matchVaccinesError'));
            return;
        }

        try {
            const payload = {
                childId: appointmentForm.childId,
                vaccineId: suggestedDoseGroup.primaryVaccineId,
                appointmentDate: appointmentForm.appointmentDate,
                notificationDate: appointmentForm.appointmentDate,
                notificationMessage: appointmentForm.notificationMessage,
                notes: suggestedDoseGroup.notes,
                status: 'scheduled'
            };

            if (editingAppointmentId) {
                await updateHealthCenterAppointment(editingAppointmentId, payload);
                setStatusMessage(t('healthCenter.appointmentUpdated'));
            } else {
                await createHealthCenterAppointment(payload);
                setStatusMessage(t('healthCenter.appointmentSaved'));
            }

            setEditingAppointmentId(null);
            setSuggestedDoseGroup(null);
            setAppointmentForm(emptyAppointmentForm);
            await loadData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('healthCenter.appointmentSaveError'));
        }
    };

    const handleEditAppointment = (appointment: AdminAppointment) => {
        const child = children.find((entry) => entry.id === appointment.childId);
        setEditingAppointmentId(appointment.id);

        if (!child) {
            setSuggestedDoseGroup(null);
            setAppointmentForm({
                childId: appointment.childId,
                appointmentDate: appointment.appointmentDate || '',
                notificationMessage: appointment.notificationMessage || ''
            });
            return;
        }

        applyChildSuggestion(child, appointment.appointmentDate, false);
    };

    const handleSendReminder = async (appointment: AdminAppointment) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await notifyHealthCenterAppointment(appointment.id, {
                notificationDate: appointment.appointmentDate,
                notificationMessage: appointment.notificationMessage || appointment.notes || t('healthCenter.defaultReminder', { date: appointment.appointmentDate || '' })
            });
            setStatusMessage(t('healthCenter.notificationSent'));
            await loadData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('healthCenter.notificationError'));
        }
    };

    const handleCancelEdit = () => {
        setEditingAppointmentId(null);
        setSuggestedDoseGroup(null);
        setAppointmentForm(emptyAppointmentForm);
    };

    return (
        <main className="page">
            <div className="content-card admin-dashboard health-center-dashboard">
                <div className="admin-dashboard__hero">
                    <div>
                        <span className="hero__eyebrow">{t('healthCenter.eyebrow')}</span>
                        <h1>{t('healthCenter.title')}</h1>
                        <p className="page-copy">{t('healthCenter.description')}</p>
                    </div>
                    <div className="admin-dashboard__metrics">
                        <div className="metric admin-metric"><span className="metric__value">{children.length}</span><span className="metric__label">{t('healthCenter.metric.children')}</span></div>
                        <div className="metric admin-metric"><span className="metric__value">{relanceChildren.length}</span><span className="metric__label">{t('healthCenter.metric.relance')}</span></div>
                        <div className="metric admin-metric"><span className="metric__value">{todayAppointments.length}</span><span className="metric__label">{t('healthCenter.metric.todayAppointments')}</span></div>
                        <div className="metric admin-metric"><span className="metric__value">{overdueAppointments.length}</span><span className="metric__label">{t('healthCenter.metric.overdueAppointments')}</span></div>
                    </div>
                </div>

                {errorMessage ? <p className="error">{errorMessage}</p> : null}
                {statusMessage ? <p className="success-message">{statusMessage}</p> : null}
                {loading ? <p className="page-copy">{t('healthCenter.loading')}</p> : null}

                <section className="admin-panel health-center-scheduler">
                    <div className="admin-panel__header">
                        <div>
                            <h2>{t('healthCenter.schedulerTitle')}</h2>
                            <p className="page-copy">{t('healthCenter.schedulerDescription')}</p>
                        </div>
                    </div>
                    <form className="admin-form health-center-scheduler__form" onSubmit={handleScheduleAppointment}>
                        <select value={appointmentForm.childId} onChange={(event) => handleSelectChild(event.target.value)} required>
                            <option value="">{t('healthCenter.selectChild')}</option>
                            {children.map((child) => (
                                <option key={child.id} value={child.id}>{child.fullName} - {child.user?.fullName || child.userId}</option>
                            ))}
                        </select>
                        <input type="date" value={appointmentForm.appointmentDate} onChange={(event) => handleAppointmentDateChange(event.target.value)} required />
                        <textarea value={appointmentForm.notificationMessage} readOnly rows={4} className="health-center-scheduler__message" />
                        <div className="admin-actions-cell">
                            <button type="submit">{editingAppointmentId ? t('healthCenter.saveEdit') : t('healthCenter.saveAppointment')}</button>
                            {editingAppointmentId ? (
                                <button type="button" className="admin-button admin-button--ghost" onClick={handleCancelEdit}>{t('common.cancel')}</button>
                            ) : null}
                        </div>
                    </form>
                    {suggestedDoseGroup ? (
                        <div className="health-center-scheduler__preview">
                            <h3>{t('healthCenter.suggestedTitle')}</h3>
                            <div className="health-center-dose-tags">
                                {suggestedDoseGroup.doses.map((dose) => (
                                    <span key={`${dose.antigen}-${dose.offsetDays}`} className="health-center-dose-tag">
                                        {dose.antigen} - {dose.ageLabel}
                                    </span>
                                ))}
                            </div>
                            <p className="page-copy">{suggestedDoseGroup.notes}</p>
                        </div>
                    ) : null}
                </section>

                <section className="admin-panel">
                    <div className="admin-panel__header">
                        <div>
                            <h2>{t('healthCenter.relanceTitle')}</h2>
                            <p className="page-copy">{t('healthCenter.relanceDescription')}</p>
                        </div>
                    </div>
                    <div className="admin-toolbar">
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={t('healthCenter.searchPlaceholder')}
                        />
                    </div>
                    {searchableChildren.length > 0 ? (
                        <div className="health-center-search-results">
                            {searchableChildren.map((child) => {
                                const suggestion = buildSuggestedDoseGroup(child);

                                return (
                                    <button key={child.id} type="button" className="health-center-search-result" onClick={() => handleSelectChild(child.id)}>
                                        <strong>{child.fullName}</strong>
                                        <span>{child.user?.fullName || child.userId}</span>
                                        <span>
                                            {suggestion
                                                ? t('healthCenter.nearestDoses', { doses: suggestion.doses.map((dose) => dose.antigen).join(language === 'ar' ? '، ' : ', ') })
                                                : t('healthCenter.noRemainingDoses')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                    <div className="admin-relance-list">
                        {relanceChildren.length === 0 ? (
                            <p className="page-copy">{t('healthCenter.relanceEmpty')}</p>
                        ) : (
                            relanceChildren.map(({ child, overdueDoses }) => (
                                <article
                                    key={child.id}
                                    className="admin-relance-card health-center-card health-center-card--interactive"
                                    onClick={() => handleSelectChild(child.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            handleSelectChild(child.id);
                                        }
                                    }}
                                >
                                    <div className="admin-relance-card__header">
                                        <div>
                                            <h3>{child.fullName}</h3>
                                            <p>{child.user?.fullName || child.userId}</p>
                                        </div>
                                        <span className="status-pill status-pill--alert">{t('healthCenter.overdueDoses', { count: overdueDoses.length })}</span>
                                    </div>
                                    <div className="admin-relance-card__meta">
                                        <span>{t('healthCenter.birthDate', { date: child.dateOfBirth })}</span>
                                        <span>{t('healthCenter.phone', { phone: child.user?.phoneNumber || child.phoneNumber || '' })}</span>
                                    </div>
                                    <div className="admin-relance-doses">
                                        {overdueDoses.map((dose) => (
                                            <div key={`${child.id}-${dose.antigen}-${dose.offsetDays}`} className="admin-relance-dose">
                                                <strong>{dose.antigen}</strong>
                                                <span>{dose.ageLabel}</span>
                                                <span>{t('healthCenter.referenceDate', { date: dose.scheduledDate })}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="health-center-card__footer">
                                        <span>{t('healthCenter.clickHint')}</span>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <section className="admin-panel">
                    <div className="admin-panel__header">
                        <div>
                            <h2>{t('healthCenter.appointmentsTitle')}</h2>
                            <p className="page-copy">{t('healthCenter.appointmentsDescription')}</p>
                        </div>
                    </div>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>{t('healthCenter.table.child')}</th>
                                    <th>{t('healthCenter.table.parent')}</th>
                                    <th>{t('healthCenter.table.primaryDose')}</th>
                                    <th>{t('healthCenter.table.vaccinationDate')}</th>
                                    <th>{t('healthCenter.table.plannedDoses')}</th>
                                    <th>{t('healthCenter.table.status')}</th>
                                    <th>{t('healthCenter.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scheduledAppointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td>{appointment.childName || appointment.childId}</td>
                                        <td>{appointment.userName || appointment.userId}</td>
                                        <td>{appointment.vaccine || appointment.vaccineId}</td>
                                        <td>{appointment.appointmentDate}</td>
                                        <td>{appointment.notes || '—'}</td>
                                        <td>{getLocalizedAppointmentStatus(t, appointment.status)}</td>
                                        <td>
                                            <div className="admin-actions-cell">
                                                <button type="button" className="admin-button admin-button--ghost" onClick={() => handleEditAppointment(appointment)}>
                                                    {t('common.edit')}
                                                </button>
                                                <button type="button" className="admin-button" onClick={() => void handleSendReminder(appointment)}>
                                                    {t('healthCenter.notify')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="admin-panel">
                    <h2>{t('healthCenter.overdueTodayTitle')}</h2>
                    <div className="admin-table-wrapper admin-table-wrapper--compact">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>{t('healthCenter.table.child')}</th>
                                    <th>{t('healthCenter.table.date')}</th>
                                    <th>{t('healthCenter.table.primaryDose')}</th>
                                    <th>{t('healthCenter.table.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...todayAppointments, ...overdueAppointments.filter((appointment) => (appointment.appointmentDate || '') !== todayIso)].map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td>{appointment.childName || appointment.childId}</td>
                                        <td>{appointment.appointmentDate}</td>
                                        <td>{appointment.vaccine || appointment.vaccineId}</td>
                                        <td>{getLocalizedAppointmentStatus(t, appointment.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default HealthCenterDashboardPage;

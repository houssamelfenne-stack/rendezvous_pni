import React, { useEffect, useState } from 'react';
import {
    AdminAuditLog,
    AdminAppointment,
    AdminChild,
    AdminUser,
    AdminVaccineDose,
    CreateAdminChildPayload,
    CreateAdminUserPayload,
    createAdminChild,
    createAdminUser,
    deleteAdminAppointment,
    deleteAdminChild,
    deleteAdminUser,
    getAdminAuditLogs,
    getAdminAppointments,
    getAdminChildren,
    getAdminUsers,
    getAdminVaccineDoses,
    updateAdminAppointment,
    updateAdminChild,
    updateAdminUser
} from '../services/adminService';
import { useAppPreferences } from '../context/AppPreferencesContext';
import { buildCompletedPniDoseKeys, buildPniSchedule, filterExclusivePniDoses } from '../utils/pniSchedule';

interface AdminUserForm extends CreateAdminUserPayload {}

interface AdminChildForm extends CreateAdminChildPayload {
    userId: string;
}

interface AdminAppointmentForm {
    appointmentDate: string;
    status: string;
    notes: string;
}

interface PendingDeleteState {
    entity: 'user' | 'child' | 'appointment';
    id: string;
    label: string;
}

const emptyUserForm: AdminUserForm = {
    fullName: '',
    role: 'citizen',
    gender: 'other',
    dateOfBirth: '',
    nationalId: '',
    address: '',
    phoneNumber: '',
    password: ''
};

const emptyChildForm: AdminChildForm = {
    userId: '',
    fullName: '',
    gender: 'other',
    dateOfBirth: '',
    nationalId: '',
    address: '',
    phoneNumber: ''
};

const emptyAppointmentForm: AdminAppointmentForm = {
    appointmentDate: '',
    status: 'scheduled',
    notes: ''
};

const getRequestErrorMessage = (error: unknown, fallback: string) => {
    const responseMessage = (error as any)?.response?.data?.message;
    return typeof responseMessage === 'string' && responseMessage.trim() ? responseMessage : fallback;
};

const formatRelanceDate = (dateIso: string) => {
    const date = new Date(dateIso);

    if (Number.isNaN(date.getTime())) {
        return dateIso;
    }

    return date.toLocaleDateString('fr-MA');
};

const getRoleLabel = (t: (key: string, params?: Record<string, string | number>) => string, role: AdminUser['role'] | AdminAuditLog['actorRole']) => {
    switch (role) {
        case 'admin':
            return t('role.admin');
        case 'health-center':
            return t('role.health-center');
        default:
            return t('role.citizen');
    }
};

const getAppointmentStatusLabel = (t: (key: string, params?: Record<string, string | number>) => string, status: string) => {
    return t(`admin.status.${status}`);
};

const getAuditEntityLabel = (t: (key: string, params?: Record<string, string | number>) => string, entityType: AdminAuditLog['entityType']) => {
    return t(`admin.auditEntity.${entityType}`);
};

const getAuditActionLabel = (t: (key: string, params?: Record<string, string | number>) => string, action: string) => {
    const translated = t(`admin.auditAction.${action}`);
    return translated === `admin.auditAction.${action}` ? action : translated;
};

const AdminDashboardPage: React.FC = () => {
    const { t, language } = useAppPreferences();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [children, setChildren] = useState<AdminChild[]>([]);
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [vaccineDoses, setVaccineDoses] = useState<AdminVaccineDose[]>([]);
    const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
    const [userForm, setUserForm] = useState<AdminUserForm>(emptyUserForm);
    const [childForm, setChildForm] = useState<AdminChildForm>(emptyChildForm);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editUserForm, setEditUserForm] = useState<AdminUserForm>(emptyUserForm);
    const [editingChildId, setEditingChildId] = useState<string | null>(null);
    const [editChildForm, setEditChildForm] = useState<AdminChildForm>(emptyChildForm);
    const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
    const [editAppointmentForm, setEditAppointmentForm] = useState<AdminAppointmentForm>(emptyAppointmentForm);
    const [pendingDelete, setPendingDelete] = useState<PendingDeleteState | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [userQuery, setUserQuery] = useState('');
    const [userFilter, setUserFilter] = useState<'all' | 'active' | 'disabled' | 'admin' | 'health-center' | 'citizen'>('all');
    const [childQuery, setChildQuery] = useState('');
    const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'scheduled' | 'completed' | 'overdue' | 'cancelled'>('all');
    const [auditFilter, setAuditFilter] = useState<'all' | 'user' | 'child' | 'appointment'>('all');

    const loadAdminData = async () => {
        setLoading(true);
        setErrorMessage('');

        const results = await Promise.allSettled([
            getAdminUsers(),
            getAdminChildren(),
            getAdminAppointments(),
            getAdminVaccineDoses(),
            getAdminAuditLogs()
        ]);

        const [usersResult, childrenResult, appointmentsResult, vaccineDosesResult, auditLogsResult] = results;
        const blockingErrors: string[] = [];
        const warningErrors: string[] = [];

        if (usersResult.status === 'fulfilled') {
            setUsers(usersResult.value);
        } else {
            setUsers([]);
            blockingErrors.push(getRequestErrorMessage(usersResult.reason, t('admin.error.loadUsers')));
        }

        if (childrenResult.status === 'fulfilled') {
            setChildren(childrenResult.value);
        } else {
            setChildren([]);
            blockingErrors.push(getRequestErrorMessage(childrenResult.reason, t('admin.error.loadChildren')));
        }

        if (appointmentsResult.status === 'fulfilled') {
            setAppointments(appointmentsResult.value);
        } else {
            setAppointments([]);
            blockingErrors.push(getRequestErrorMessage(appointmentsResult.reason, t('admin.error.loadAppointments')));
        }

        if (vaccineDosesResult.status === 'fulfilled') {
            setVaccineDoses(vaccineDosesResult.value);
        } else {
            setVaccineDoses([]);
            warningErrors.push(getRequestErrorMessage(vaccineDosesResult.reason, t('admin.error.loadDoses')));
        }

        if (auditLogsResult.status === 'fulfilled') {
            setAuditLogs(auditLogsResult.value);
        } else {
            setAuditLogs([]);
            warningErrors.push(getRequestErrorMessage(auditLogsResult.reason, t('admin.error.loadAudit')));
        }

        if (blockingErrors.length > 0) {
            setErrorMessage(blockingErrors.join(' '));
        } else if (warningErrors.length > 0) {
            setStatusMessage(warningErrors.join(' '));
        }

        setLoading(false);
    };

    useEffect(() => {
        void loadAdminData();
    }, [t]);

    const handleCreateUser = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');
        setStatusMessage('');

        try {
            await createAdminUser(userForm);
            setUserForm(emptyUserForm);
            setStatusMessage(t('admin.message.createUserSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.createUserError'));
        }
    };

    const handleCreateChild = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');
        setStatusMessage('');

        try {
            await createAdminChild(childForm.userId, {
                fullName: childForm.fullName,
                gender: childForm.gender,
                dateOfBirth: childForm.dateOfBirth,
                nationalId: childForm.nationalId,
                address: childForm.address,
                phoneNumber: childForm.phoneNumber
            });
            setChildForm(emptyChildForm);
            setStatusMessage(t('admin.message.createChildSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.createChildError'));
        }
    };

    const handleToggleUserStatus = async (user: AdminUser) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateAdminUser(user.id, { isActive: !user.isActive });
            setStatusMessage(user.isActive ? t('admin.message.userDisabled') : t('admin.message.userEnabled'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.userStatusError'));
        }
    };

    const startEditUser = (user: AdminUser) => {
        setEditingUserId(user.id);
        setEditUserForm({
            fullName: user.fullName,
            role: user.role,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            nationalId: user.nationalId,
            address: user.address,
            phoneNumber: user.phoneNumber,
            password: '',
            isActive: user.isActive
        });
    };

    const handleUpdateUser = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!editingUserId) {
            return;
        }

        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateAdminUser(editingUserId, {
                ...editUserForm,
                password: editUserForm.password || undefined
            });
            closeUserEditModal();
            setStatusMessage(t('admin.message.updateUserSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.updateUserError'));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await deleteAdminUser(userId);
            setStatusMessage(t('admin.message.deleteUserSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.deleteUserError'));
        }
    };

    const closeUserEditModal = () => {
        setEditingUserId(null);
        setEditUserForm(emptyUserForm);
    };

    const handleDeleteChild = async (childId: string) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await deleteAdminChild(childId);
            setStatusMessage(t('admin.message.deleteChildSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.deleteChildError'));
        }
    };

    const closeChildEditModal = () => {
        setEditingChildId(null);
        setEditChildForm(emptyChildForm);
    };

    const startEditChild = (child: AdminChild) => {
        setEditingChildId(child.id);
        setEditChildForm({
            userId: child.userId,
            fullName: child.fullName,
            gender: child.gender as 'male' | 'female' | 'other',
            dateOfBirth: child.dateOfBirth,
            nationalId: child.nationalId || '',
            address: child.address,
            phoneNumber: child.phoneNumber
        });
    };

    const handleUpdateChild = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!editingChildId) {
            return;
        }

        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateAdminChild(editingChildId, editChildForm);
            closeChildEditModal();
            setStatusMessage(t('admin.message.updateChildSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.updateChildError'));
        }
    };

    const handleDeleteAppointment = async (appointmentId: string) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await deleteAdminAppointment(appointmentId);
            setStatusMessage(t('admin.message.deleteAppointmentSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.deleteAppointmentError'));
        }
    };

    const closeAppointmentEditModal = () => {
        setEditingAppointmentId(null);
        setEditAppointmentForm(emptyAppointmentForm);
    };

    const handleAppointmentStatusChange = async (appointment: AdminAppointment, status: string) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateAdminAppointment(appointment.id, { status });
            setStatusMessage(t('admin.message.updateAppointmentStatusSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.updateAppointmentStatusError'));
        }
    };

    const startEditAppointment = (appointment: AdminAppointment) => {
        setEditingAppointmentId(appointment.id);
        setEditAppointmentForm({
            appointmentDate: appointment.appointmentDate,
            status: appointment.status || 'scheduled',
            notes: appointment.notes || ''
        });
    };

    const handleUpdateAppointment = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!editingAppointmentId) {
            return;
        }

        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateAdminAppointment(editingAppointmentId, editAppointmentForm);
            closeAppointmentEditModal();
            setStatusMessage(t('admin.message.updateAppointmentSuccess'));
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || t('admin.message.updateAppointmentError'));
        }
    };

    const requestDelete = (entity: PendingDeleteState['entity'], id: string, label: string) => {
        setPendingDelete({ entity, id, label });
    };

    const handleConfirmDelete = async () => {
        if (!pendingDelete) {
            return;
        }

        if (pendingDelete.entity === 'user') {
            await handleDeleteUser(pendingDelete.id);
        }

        if (pendingDelete.entity === 'child') {
            await handleDeleteChild(pendingDelete.id);
        }

        if (pendingDelete.entity === 'appointment') {
            await handleDeleteAppointment(pendingDelete.id);
        }

        setPendingDelete(null);
    };

    const normalizedUserQuery = userQuery.trim().toLowerCase();
    const filteredUsers = users.filter((user) => {
        const matchesQuery = !normalizedUserQuery || [user.fullName, user.nationalId, user.phoneNumber]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedUserQuery));

        const matchesFilter = userFilter === 'all'
            || (userFilter === 'active' && user.isActive)
            || (userFilter === 'disabled' && !user.isActive)
            || user.role === userFilter;

        return matchesQuery && matchesFilter;
    });

    const normalizedChildQuery = childQuery.trim().toLowerCase();
    const filteredChildren = children.filter((child) => {
        if (!normalizedChildQuery) {
            return true;
        }

        return [child.fullName, child.user?.fullName || '', child.nationalId || '']
            .some((value) => value.toLowerCase().includes(normalizedChildQuery));
    });

    const filteredAppointments = appointments.filter((appointment) => appointmentFilter === 'all' || (appointment.status || 'scheduled') === appointmentFilter);
    const filteredAuditLogs = auditLogs.filter((log) => auditFilter === 'all' || log.entityType === auditFilter);
    const todayIso = new Date().toISOString().slice(0, 10);
    const relanceChildren = children
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
                oldestScheduledDateIso: overdueDoses[0].scheduledDateIso
            };
        })
        .filter((entry): entry is { child: AdminChild; overdueDoses: ReturnType<typeof buildPniSchedule>; oldestScheduledDateIso: string } => Boolean(entry))
        .sort((left, right) => {
            if (right.overdueDoses.length !== left.overdueDoses.length) {
                return right.overdueDoses.length - left.overdueDoses.length;
            }

            return left.oldestScheduledDateIso.localeCompare(right.oldestScheduledDateIso);
        });

    return (
        <main className="page">
            <div className="content-card admin-dashboard">
                <div className="admin-dashboard__hero">
                    <div>
                        <span className="hero__eyebrow">{t('admin.eyebrow')}</span>
                        <h1>{t('admin.title')}</h1>
                        <p className="page-copy">{t('admin.description')}</p>
                    </div>
                    <div className="admin-dashboard__metrics">
                        <div className="metric admin-metric"><span className="metric__value">{users.length}</span><span className="metric__label">{t('admin.metric.accounts')}</span></div>
                        <div className="metric admin-metric"><span className="metric__value">{children.length}</span><span className="metric__label">{t('admin.metric.children')}</span></div>
                        <div className="metric admin-metric"><span className="metric__value">{appointments.length}</span><span className="metric__label">{t('admin.metric.appointments')}</span></div>
                        <div className="metric admin-metric"><span className="metric__value">{auditLogs.length}</span><span className="metric__label">{t('admin.metric.audit')}</span></div>
                    </div>
                </div>

                {statusMessage ? <p className="admin-dashboard__status">{statusMessage}</p> : null}
                {errorMessage ? <p className="error">{errorMessage}</p> : null}
                {loading ? <p className="page-copy">{t('admin.loading')}</p> : null}

                <section className="admin-dashboard__grid">
                    <article className="admin-panel">
                        <h2>{t('admin.createUserTitle')}</h2>
                        <form className="admin-form" onSubmit={handleCreateUser}>
                            <input value={userForm.fullName} onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))} placeholder={t('auth.fullName')} required />
                            <select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as 'citizen' | 'health-center' | 'admin' }))}>
                                <option value="citizen">{t('role.citizen')}</option>
                                <option value="health-center">{t('role.health-center')}</option>
                                <option value="admin">{t('role.admin')}</option>
                            </select>
                            <select value={userForm.gender} onChange={(event) => setUserForm((current) => ({ ...current, gender: event.target.value as 'male' | 'female' | 'other' }))}>
                                <option value="other">{t('gender.other')}</option>
                                <option value="male">{t('gender.male')}</option>
                                <option value="female">{t('gender.female')}</option>
                            </select>
                            <input type="date" value={userForm.dateOfBirth} onChange={(event) => setUserForm((current) => ({ ...current, dateOfBirth: event.target.value }))} required />
                            <input value={userForm.nationalId} onChange={(event) => setUserForm((current) => ({ ...current, nationalId: event.target.value }))} placeholder={t('auth.nationalId')} required />
                            <input value={userForm.address} onChange={(event) => setUserForm((current) => ({ ...current, address: event.target.value }))} placeholder={t('auth.address')} required />
                            <input value={userForm.phoneNumber} onChange={(event) => setUserForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder={t('auth.phoneNumber')} required />
                            <input type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder={t('auth.password')} required />
                            <button type="submit">{t('admin.button.createUser')}</button>
                        </form>
                    </article>

                    <article className="admin-panel">
                        <h2>{t('admin.addChildTitle')}</h2>
                        <form className="admin-form" onSubmit={handleCreateChild}>
                            <select value={childForm.userId} onChange={(event) => setChildForm((current) => ({ ...current, userId: event.target.value }))} required>
                                <option value="">{t('admin.selectUser')}</option>
                                {users.filter((user) => user.role === 'citizen').map((user) => (
                                    <option key={user.id} value={user.id}>{user.fullName} - {user.nationalId}</option>
                                ))}
                            </select>
                            <input value={childForm.fullName} onChange={(event) => setChildForm((current) => ({ ...current, fullName: event.target.value }))} placeholder={t('admin.table.child')} required />
                            <select value={childForm.gender} onChange={(event) => setChildForm((current) => ({ ...current, gender: event.target.value as 'male' | 'female' | 'other' }))}>
                                <option value="other">{t('gender.other')}</option>
                                <option value="male">{t('gender.male')}</option>
                                <option value="female">{t('gender.female')}</option>
                            </select>
                            <input type="date" value={childForm.dateOfBirth} onChange={(event) => setChildForm((current) => ({ ...current, dateOfBirth: event.target.value }))} required />
                            <input value={childForm.nationalId} onChange={(event) => setChildForm((current) => ({ ...current, nationalId: event.target.value }))} placeholder={t('admin.placeholder.childNationalId')} />
                            <input value={childForm.address} onChange={(event) => setChildForm((current) => ({ ...current, address: event.target.value }))} placeholder={t('auth.address')} required />
                            <input value={childForm.phoneNumber} onChange={(event) => setChildForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder={t('auth.phoneNumber')} required />
                            <button type="submit">{t('admin.button.addChild')}</button>
                        </form>
                    </article>
                </section>

                <section className="admin-panel">
                    <div className="admin-panel__header">
                        <div>
                            <h2>{t('admin.relanceTitle')}</h2>
                            <p className="page-copy">{t('admin.relanceDescription')}</p>
                        </div>
                        <span className="status-pill status-pill--alert">{relanceChildren.length} {t('admin.metric.children')}</span>
                    </div>
                    <div className="admin-relance-list">
                        {relanceChildren.length === 0 ? (
                            <p className="page-copy">{t('admin.relanceEmpty')}</p>
                        ) : (
                            relanceChildren.map(({ child, overdueDoses }) => (
                                <article key={child.id} className="admin-relance-card">
                                    <div className="admin-relance-card__header">
                                        <div>
                                            <h3>{child.fullName}</h3>
                                            <p>{child.user?.fullName || child.userId}</p>
                                        </div>
                                        <span className="status-pill status-pill--warn">{t('admin.overdueDoses', { count: overdueDoses.length })}</span>
                                    </div>
                                    <div className="admin-relance-card__meta">
                                        <span>{t('admin.birthDate')}: {child.dateOfBirth}</span>
                                        <span>{t('admin.guardian')}: {child.user?.phoneNumber || child.phoneNumber}</span>
                                    </div>
                                    <div className="admin-relance-doses">
                                        {overdueDoses.map((dose) => (
                                            <div key={`${child.id}-${dose.antigen}-${dose.offsetDays}`} className="admin-relance-dose">
                                                <strong>{dose.antigen}</strong>
                                                <span>{dose.ageLabel}</span>
                                                <span>{t('admin.referenceDate')}: {formatRelanceDate(dose.scheduledDateIso)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <section className="admin-panel">
                    <h2>{t('admin.section.accounts')}</h2>
                    <div className="admin-toolbar">
                        <input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder={t('admin.searchUserPlaceholder')} />
                        <select value={userFilter} onChange={(event) => setUserFilter(event.target.value as typeof userFilter)}>
                            <option value="all">{t('admin.filter.allAccounts')}</option>
                            <option value="active">{t('admin.filter.active')}</option>
                            <option value="disabled">{t('admin.filter.disabled')}</option>
                            <option value="citizen">{t('admin.filter.citizens')}</option>
                            <option value="health-center">{t('admin.filter.healthCenters')}</option>
                            <option value="admin">{t('admin.filter.administration')}</option>
                        </select>
                    </div>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>{t('admin.table.name')}</th>
                                    <th>{t('admin.table.role')}</th>
                                    <th>{t('admin.table.status')}</th>
                                    <th>{t('admin.table.nationalId')}</th>
                                    <th>{t('admin.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.fullName}</td>
                                        <td>{getRoleLabel(t, user.role)}</td>
                                        <td>{user.isActive ? t('admin.status.active') : t('admin.status.disabled')}</td>
                                        <td>{user.nationalId}</td>
                                        <td className="admin-actions-cell">
                                            <button type="button" className="admin-button admin-button--ghost" onClick={() => startEditUser(user)}>
                                                {t('common.edit')}
                                            </button>
                                            <button type="button" className="admin-button admin-button--ghost" onClick={() => void handleToggleUserStatus(user)}>
                                                {user.isActive ? t('admin.filter.disabled') : t('admin.status.active')}
                                            </button>
                                            <button type="button" className="admin-button admin-button--danger" onClick={() => requestDelete('user', user.id, user.fullName)}>
                                                {t('common.delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="admin-dashboard__grid admin-dashboard__grid--wide">
                    <article className="admin-panel">
                        <h2>{t('admin.section.children')}</h2>
                        <div className="admin-toolbar">
                            <input value={childQuery} onChange={(event) => setChildQuery(event.target.value)} placeholder={t('admin.searchChildPlaceholder')} />
                        </div>
                        <div className="admin-table-wrapper admin-table-wrapper--compact">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>{t('admin.table.child')}</th>
                                        <th>{t('admin.table.guardian')}</th>
                                        <th>{t('admin.table.dateOfBirth')}</th>
                                        <th>{t('admin.table.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredChildren.map((child) => (
                                        <tr key={child.id}>
                                            <td>{child.fullName}</td>
                                            <td>{child.user?.fullName || child.userId}</td>
                                            <td>{child.dateOfBirth}</td>
                                            <td className="admin-actions-cell">
                                                <button type="button" className="admin-button admin-button--ghost" onClick={() => startEditChild(child)}>
                                                    {t('common.edit')}
                                                </button>
                                                <button type="button" className="admin-button admin-button--danger" onClick={() => requestDelete('child', child.id, child.fullName)}>
                                                    {t('admin.button.deleteChild')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="admin-panel">
                        <h2>{t('admin.section.appointments')}</h2>
                        <div className="admin-toolbar">
                            <select value={appointmentFilter} onChange={(event) => setAppointmentFilter(event.target.value as typeof appointmentFilter)}>
                                <option value="all">{t('admin.filter.allAppointments')}</option>
                                <option value="scheduled">{t('admin.status.scheduled')}</option>
                                <option value="completed">{t('admin.status.completed')}</option>
                                <option value="overdue">{t('admin.status.overdue')}</option>
                                <option value="cancelled">{t('admin.status.cancelled')}</option>
                            </select>
                        </div>
                        <div className="admin-table-wrapper admin-table-wrapper--compact">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>{t('admin.table.child')}</th>
                                        <th>{t('admin.table.date')}</th>
                                        <th>{t('admin.table.vaccine')}</th>
                                        <th>{t('admin.table.status')}</th>
                                        <th>{t('admin.table.action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td>{appointment.childName || appointment.childId}</td>
                                            <td>{appointment.appointmentDate}</td>
                                            <td>{appointment.vaccine || appointment.vaccineId}</td>
                                            <td>
                                                <select value={appointment.status || 'scheduled'} onChange={(event) => void handleAppointmentStatusChange(appointment, event.target.value)}>
                                                    <option value="scheduled">{t('admin.status.scheduled')}</option>
                                                    <option value="completed">{t('admin.status.completed')}</option>
                                                    <option value="overdue">{t('admin.status.overdue')}</option>
                                                    <option value="cancelled">{t('admin.status.cancelled')}</option>
                                                </select>
                                            </td>
                                            <td className="admin-actions-cell">
                                                <button type="button" className="admin-button admin-button--ghost" onClick={() => startEditAppointment(appointment)}>
                                                    {t('common.edit')}
                                                </button>
                                                <button type="button" className="admin-button admin-button--danger" onClick={() => requestDelete('appointment', appointment.id, appointment.childName || appointment.childId)}>
                                                    {t('admin.button.deleteAppointment')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </section>

                <section className="admin-panel">
                    <h2>{t('admin.section.audit')}</h2>
                    <div className="admin-toolbar">
                        <select value={auditFilter} onChange={(event) => setAuditFilter(event.target.value as typeof auditFilter)}>
                            <option value="all">{t('admin.filter.allActions')}</option>
                            <option value="user">{t('admin.auditEntity.user')}</option>
                            <option value="child">{t('admin.auditEntity.child')}</option>
                            <option value="appointment">{t('admin.auditEntity.appointment')}</option>
                        </select>
                    </div>
                    <div className="admin-table-wrapper admin-table-wrapper--compact">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>{t('admin.table.time')}</th>
                                    <th>{t('admin.table.actor')}</th>
                                    <th>{t('admin.table.entity')}</th>
                                    <th>{t('admin.table.action')}</th>
                                    <th>{t('admin.table.description')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAuditLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{log.createdAt}</td>
                                        <td>{getRoleLabel(t, log.actorRole)}</td>
                                        <td>{getAuditEntityLabel(t, log.entityType)}</td>
                                        <td>{getAuditActionLabel(t, log.action)}</td>
                                        <td>{log.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {editingUserId ? (
                    <div className="children-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) closeUserEditModal(); }}>
                        <div className="children-modal admin-modal" role="dialog" aria-modal="true">
                            <div className="children-modal__header">
                                <h2>{t('admin.modal.editUserTitle')}</h2>
                                <button type="button" className="children-modal__close" onClick={closeUserEditModal} aria-label={t('common.close')}>×</button>
                            </div>
                            <form className="admin-form" onSubmit={handleUpdateUser}>
                                <input value={editUserForm.fullName} onChange={(event) => setEditUserForm((current) => ({ ...current, fullName: event.target.value }))} placeholder={t('auth.fullName')} required />
                                <select value={editUserForm.role} onChange={(event) => setEditUserForm((current) => ({ ...current, role: event.target.value as 'citizen' | 'health-center' | 'admin' }))}>
                                    <option value="citizen">{t('role.citizen')}</option>
                                    <option value="health-center">{t('role.health-center')}</option>
                                    <option value="admin">{t('role.admin')}</option>
                                </select>
                                <select value={editUserForm.gender} onChange={(event) => setEditUserForm((current) => ({ ...current, gender: event.target.value as 'male' | 'female' | 'other' }))}>
                                    <option value="other">{t('gender.other')}</option>
                                    <option value="male">{t('gender.male')}</option>
                                    <option value="female">{t('gender.female')}</option>
                                </select>
                                <input type="date" value={editUserForm.dateOfBirth} onChange={(event) => setEditUserForm((current) => ({ ...current, dateOfBirth: event.target.value }))} required />
                                <input value={editUserForm.nationalId} onChange={(event) => setEditUserForm((current) => ({ ...current, nationalId: event.target.value }))} placeholder={t('auth.nationalId')} required />
                                <input value={editUserForm.address} onChange={(event) => setEditUserForm((current) => ({ ...current, address: event.target.value }))} placeholder={t('auth.address')} required />
                                <input value={editUserForm.phoneNumber} onChange={(event) => setEditUserForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder={t('auth.phoneNumber')} required />
                                <input type="password" value={editUserForm.password} onChange={(event) => setEditUserForm((current) => ({ ...current, password: event.target.value }))} placeholder={t('admin.placeholder.optionalPassword')} />
                                <div className="admin-actions-cell">
                                    <button type="submit">{t('auth.saveChanges')}</button>
                                    <button type="button" className="admin-button admin-button--ghost" onClick={closeUserEditModal}>{t('common.cancel')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : null}

                {editingChildId ? (
                    <div className="children-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) closeChildEditModal(); }}>
                        <div className="children-modal admin-modal" role="dialog" aria-modal="true">
                            <div className="children-modal__header">
                                <h2>{t('admin.modal.editChildTitle')}</h2>
                                <button type="button" className="children-modal__close" onClick={closeChildEditModal} aria-label={t('common.close')}>×</button>
                            </div>
                            <form className="admin-form" onSubmit={handleUpdateChild}>
                                <select value={editChildForm.userId} onChange={(event) => setEditChildForm((current) => ({ ...current, userId: event.target.value }))} required>
                                    <option value="">{t('admin.selectUser')}</option>
                                    {users.filter((user) => user.role === 'citizen').map((user) => (
                                        <option key={user.id} value={user.id}>{user.fullName} - {user.nationalId}</option>
                                    ))}
                                </select>
                                <input value={editChildForm.fullName} onChange={(event) => setEditChildForm((current) => ({ ...current, fullName: event.target.value }))} placeholder={t('admin.table.child')} required />
                                <select value={editChildForm.gender} onChange={(event) => setEditChildForm((current) => ({ ...current, gender: event.target.value as 'male' | 'female' | 'other' }))}>
                                    <option value="other">{t('gender.other')}</option>
                                    <option value="male">{t('gender.male')}</option>
                                    <option value="female">{t('gender.female')}</option>
                                </select>
                                <input type="date" value={editChildForm.dateOfBirth} onChange={(event) => setEditChildForm((current) => ({ ...current, dateOfBirth: event.target.value }))} required />
                                <input value={editChildForm.nationalId} onChange={(event) => setEditChildForm((current) => ({ ...current, nationalId: event.target.value }))} placeholder={t('admin.placeholder.childNationalId')} />
                                <input value={editChildForm.address} onChange={(event) => setEditChildForm((current) => ({ ...current, address: event.target.value }))} placeholder={t('auth.address')} required />
                                <input value={editChildForm.phoneNumber} onChange={(event) => setEditChildForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder={t('auth.phoneNumber')} required />
                                <div className="admin-actions-cell">
                                    <button type="submit">{t('auth.saveChanges')}</button>
                                    <button type="button" className="admin-button admin-button--ghost" onClick={closeChildEditModal}>{t('common.cancel')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : null}

                {editingAppointmentId ? (
                    <div className="children-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) closeAppointmentEditModal(); }}>
                        <div className="children-modal admin-modal" role="dialog" aria-modal="true">
                            <div className="children-modal__header">
                                <h2>{t('admin.modal.editAppointmentTitle')}</h2>
                                <button type="button" className="children-modal__close" onClick={closeAppointmentEditModal} aria-label={t('common.close')}>×</button>
                            </div>
                            <form className="admin-form" onSubmit={handleUpdateAppointment}>
                                <input type="date" value={editAppointmentForm.appointmentDate} onChange={(event) => setEditAppointmentForm((current) => ({ ...current, appointmentDate: event.target.value }))} required />
                                <select value={editAppointmentForm.status} onChange={(event) => setEditAppointmentForm((current) => ({ ...current, status: event.target.value }))}>
                                    <option value="scheduled">{t('admin.status.scheduled')}</option>
                                    <option value="completed">{t('admin.status.completed')}</option>
                                    <option value="overdue">{t('admin.status.overdue')}</option>
                                    <option value="cancelled">{t('admin.status.cancelled')}</option>
                                </select>
                                <input value={editAppointmentForm.notes} onChange={(event) => setEditAppointmentForm((current) => ({ ...current, notes: event.target.value }))} placeholder={t('admin.placeholder.optionalNote')} />
                                <div className="admin-actions-cell">
                                    <button type="submit">{t('auth.saveChanges')}</button>
                                    <button type="button" className="admin-button admin-button--ghost" onClick={closeAppointmentEditModal}>{t('common.cancel')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : null}

                {pendingDelete ? (
                    <div className="children-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}>
                        <div className="children-modal admin-modal admin-confirm-modal" role="dialog" aria-modal="true">
                            <div className="children-modal__header">
                                <h2>{t('admin.modal.confirmDeleteTitle')}</h2>
                                <button type="button" className="children-modal__close" onClick={() => setPendingDelete(null)} aria-label={t('common.close')}>×</button>
                            </div>
                            <p className="page-copy">{t('admin.modal.confirmDeleteText')}</p>
                            <p className="admin-confirm-modal__label">{pendingDelete.label}</p>
                            <div className="admin-actions-cell">
                                <button type="button" className="admin-button admin-button--danger" onClick={() => void handleConfirmDelete()}>{t('admin.button.confirmDelete')}</button>
                                <button type="button" className="admin-button admin-button--ghost" onClick={() => setPendingDelete(null)}>{t('common.cancel')}</button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </main>
    );
};

export default AdminDashboardPage;
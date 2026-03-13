import React, { useEffect, useState } from 'react';
import {
    AdminAppointment,
    AdminChild,
    AdminUser,
    CreateAdminChildPayload,
    CreateAdminUserPayload,
    createAdminChild,
    createAdminUser,
    deleteAdminAppointment,
    deleteAdminChild,
    deleteAdminUser,
    getAdminAppointments,
    getAdminChildren,
    getAdminUsers,
    updateAdminAppointment,
    updateAdminUser
} from '../services/adminService';

interface AdminUserForm extends CreateAdminUserPayload {}

interface AdminChildForm extends CreateAdminChildPayload {
    userId: string;
}

const emptyUserForm: AdminUserForm = {
    fullName: '',
    role: 'user',
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

const AdminDashboardPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [children, setChildren] = useState<AdminChild[]>([]);
    const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
    const [userForm, setUserForm] = useState<AdminUserForm>(emptyUserForm);
    const [childForm, setChildForm] = useState<AdminChildForm>(emptyChildForm);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const loadAdminData = async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const [nextUsers, nextChildren, nextAppointments] = await Promise.all([
                getAdminUsers(),
                getAdminChildren(),
                getAdminAppointments()
            ]);

            setUsers(nextUsers);
            setChildren(nextChildren);
            setAppointments(nextAppointments);
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'تعذر تحميل بيانات لوحة الإدارة.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadAdminData();
    }, []);

    const handleCreateUser = async (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage('');
        setStatusMessage('');

        try {
            await createAdminUser(userForm);
            setUserForm(emptyUserForm);
            setStatusMessage('تم إنشاء الحساب بنجاح.');
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'تعذر إنشاء الحساب الإداري.');
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
            setStatusMessage('تمت إضافة الطفل بنجاح.');
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'تعذر إضافة الطفل.');
        }
    };

    const handleToggleUserStatus = async (user: AdminUser) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateAdminUser(user.id, { isActive: !user.isActive });
            setStatusMessage(user.isActive ? 'تم تعطيل الحساب.' : 'تم تفعيل الحساب.');
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'تعذر تحديث حالة الحساب.');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await deleteAdminUser(userId);
            setStatusMessage('تم حذف الحساب وما يرتبط به.');
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'تعذر حذف الحساب.');
        }
    };

    const handleDeleteChild = async (childId: string) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await deleteAdminChild(childId);
            setStatusMessage('تم حذف الطفل.');
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'تعذر حذف الطفل.');
        }
    };

    const handleDeleteAppointment = async (appointmentId: string) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await deleteAdminAppointment(appointmentId);
            setStatusMessage('تم حذف الموعد.');
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'تعذر حذف الموعد.');
        }
    };

    const handleAppointmentStatusChange = async (appointment: AdminAppointment, status: string) => {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await updateAdminAppointment(appointment.id, { status });
            setStatusMessage('تم تحديث حالة الموعد.');
            await loadAdminData();
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || 'تعذر تحديث الموعد.');
        }
    };

    return (
        <main className="page">
            <div className="content-card admin-dashboard">
                <div className="admin-dashboard__hero">
                    <div>
                        <span className="hero__eyebrow">Super Admin</span>
                        <h1>لوحة التحكم الإدارية</h1>
                        <p className="page-copy">إدارة الحسابات، تعطيل المستخدمين، إضافة الأطفال، والتحكم في المواعيد من مكان واحد.</p>
                    </div>
                </div>

                {statusMessage ? <p className="admin-dashboard__status">{statusMessage}</p> : null}
                {errorMessage ? <p className="error">{errorMessage}</p> : null}
                {loading ? <p className="page-copy">جاري تحميل بيانات الإدارة...</p> : null}

                <section className="admin-dashboard__grid">
                    <article className="admin-panel">
                        <h2>إنشاء حساب جديد</h2>
                        <form className="admin-form" onSubmit={handleCreateUser}>
                            <input value={userForm.fullName} onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="الاسم الكامل" required />
                            <select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as 'user' | 'super-admin' }))}>
                                <option value="user">مستخدم عادي</option>
                                <option value="super-admin">Super Admin</option>
                            </select>
                            <select value={userForm.gender} onChange={(event) => setUserForm((current) => ({ ...current, gender: event.target.value as 'male' | 'female' | 'other' }))}>
                                <option value="other">غير محدد</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                            <input type="date" value={userForm.dateOfBirth} onChange={(event) => setUserForm((current) => ({ ...current, dateOfBirth: event.target.value }))} required />
                            <input value={userForm.nationalId} onChange={(event) => setUserForm((current) => ({ ...current, nationalId: event.target.value }))} placeholder="رقم البطاقة الوطنية" required />
                            <input value={userForm.address} onChange={(event) => setUserForm((current) => ({ ...current, address: event.target.value }))} placeholder="العنوان" required />
                            <input value={userForm.phoneNumber} onChange={(event) => setUserForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="رقم الهاتف" required />
                            <input type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} placeholder="كلمة المرور" required />
                            <button type="submit">إنشاء الحساب</button>
                        </form>
                    </article>

                    <article className="admin-panel">
                        <h2>إضافة طفل لمستخدم</h2>
                        <form className="admin-form" onSubmit={handleCreateChild}>
                            <select value={childForm.userId} onChange={(event) => setChildForm((current) => ({ ...current, userId: event.target.value }))} required>
                                <option value="">اختر المستخدم</option>
                                {users.filter((user) => user.role === 'user').map((user) => (
                                    <option key={user.id} value={user.id}>{user.fullName} - {user.nationalId}</option>
                                ))}
                            </select>
                            <input value={childForm.fullName} onChange={(event) => setChildForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="اسم الطفل" required />
                            <select value={childForm.gender} onChange={(event) => setChildForm((current) => ({ ...current, gender: event.target.value as 'male' | 'female' | 'other' }))}>
                                <option value="other">غير محدد</option>
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                            <input type="date" value={childForm.dateOfBirth} onChange={(event) => setChildForm((current) => ({ ...current, dateOfBirth: event.target.value }))} required />
                            <input value={childForm.nationalId} onChange={(event) => setChildForm((current) => ({ ...current, nationalId: event.target.value }))} placeholder="رقم تعريف الطفل" />
                            <input value={childForm.address} onChange={(event) => setChildForm((current) => ({ ...current, address: event.target.value }))} placeholder="العنوان" required />
                            <input value={childForm.phoneNumber} onChange={(event) => setChildForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="رقم الهاتف" required />
                            <button type="submit">إضافة الطفل</button>
                        </form>
                    </article>
                </section>

                <section className="admin-panel">
                    <h2>الحسابات</h2>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>الاسم</th>
                                    <th>الدور</th>
                                    <th>الحالة</th>
                                    <th>البطاقة الوطنية</th>
                                    <th>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.fullName}</td>
                                        <td>{user.role}</td>
                                        <td>{user.isActive ? 'نشط' : 'معطل'}</td>
                                        <td>{user.nationalId}</td>
                                        <td className="admin-actions-cell">
                                            <button type="button" className="admin-button admin-button--ghost" onClick={() => void handleToggleUserStatus(user)}>
                                                {user.isActive ? 'تعطيل' : 'تفعيل'}
                                            </button>
                                            <button type="button" className="admin-button admin-button--danger" onClick={() => void handleDeleteUser(user.id)}>
                                                حذف
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
                        <h2>الأطفال</h2>
                        <div className="admin-table-wrapper admin-table-wrapper--compact">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>الطفل</th>
                                        <th>ولي الأمر</th>
                                        <th>تاريخ الازدياد</th>
                                        <th>إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {children.map((child) => (
                                        <tr key={child.id}>
                                            <td>{child.fullName}</td>
                                            <td>{child.user?.fullName || child.userId}</td>
                                            <td>{child.dateOfBirth}</td>
                                            <td className="admin-actions-cell">
                                                <button type="button" className="admin-button admin-button--danger" onClick={() => void handleDeleteChild(child.id)}>
                                                    حذف الطفل
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="admin-panel">
                        <h2>المواعيد</h2>
                        <div className="admin-table-wrapper admin-table-wrapper--compact">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>الطفل</th>
                                        <th>التاريخ</th>
                                        <th>اللقاح</th>
                                        <th>الحالة</th>
                                        <th>إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td>{appointment.childName || appointment.childId}</td>
                                            <td>{appointment.appointmentDate}</td>
                                            <td>{appointment.vaccine || appointment.vaccineId}</td>
                                            <td>
                                                <select value={appointment.status || 'scheduled'} onChange={(event) => void handleAppointmentStatusChange(appointment, event.target.value)}>
                                                    <option value="scheduled">scheduled</option>
                                                    <option value="completed">completed</option>
                                                    <option value="overdue">overdue</option>
                                                    <option value="cancelled">cancelled</option>
                                                </select>
                                            </td>
                                            <td className="admin-actions-cell">
                                                <button type="button" className="admin-button admin-button--danger" onClick={() => void handleDeleteAppointment(appointment.id)}>
                                                    حذف الموعد
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </section>
            </div>
        </main>
    );
};

export default AdminDashboardPage;
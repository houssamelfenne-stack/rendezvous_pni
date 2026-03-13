import bcrypt from 'bcryptjs';
import { AppDatabase } from '../storage/types';
import { UserRecord } from '../types/entities';
import { createId } from '../storage/shared';

const normalizeExistingUsers = (users: UserRecord[]) => {
    let changed = false;
    const normalizedUsers = users.map((user) => {
        const nextRole = user.role || 'user';
        const nextIsActive = user.isActive === false ? false : true;

        if (user.role === nextRole && user.isActive === nextIsActive) {
            return user;
        }

        changed = true;
        return {
            ...user,
            role: nextRole,
            isActive: nextIsActive,
            updatedAt: new Date().toISOString()
        };
    });

    return { normalizedUsers, changed };
};

export const ensureSuperAdminAccount = async (database: AppDatabase) => {
    const users = await database.usersStore.list();
    const { normalizedUsers, changed } = normalizeExistingUsers(users);

    const superAdminNationalId = process.env.SUPER_ADMIN_NATIONAL_ID?.trim();
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD?.trim();
    const superAdminFullName = process.env.SUPER_ADMIN_FULL_NAME?.trim() || 'Super Admin';
    const superAdminGender = (process.env.SUPER_ADMIN_GENDER?.trim() as UserRecord['gender']) || 'other';
    const superAdminDateOfBirth = process.env.SUPER_ADMIN_DATE_OF_BIRTH?.trim() || '1990-01-01';
    const superAdminAddress = process.env.SUPER_ADMIN_ADDRESS?.trim() || 'Platform Administration';
    const superAdminPhone = process.env.SUPER_ADMIN_PHONE_NUMBER?.trim() || '0600000000';

    if (!superAdminNationalId || !superAdminPassword) {
        if (changed) {
            await database.usersStore.save(normalizedUsers);
        }

        return;
    }

    const existingSuperAdmin = normalizedUsers.find((user) => user.role === 'super-admin' || user.nationalId === superAdminNationalId);

    if (existingSuperAdmin) {
        const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
        const updatedUsers = normalizedUsers.map((user) => user.id === existingSuperAdmin.id
            ? {
                ...user,
                fullName: superAdminFullName,
                role: 'super-admin' as const,
                isActive: true,
                gender: superAdminGender === 'male' || superAdminGender === 'female' || superAdminGender === 'other' ? superAdminGender : 'other',
                dateOfBirth: superAdminDateOfBirth,
                nationalId: superAdminNationalId,
                address: superAdminAddress,
                phoneNumber: superAdminPhone,
                password: hashedPassword,
                updatedAt: new Date().toISOString()
            }
            : user);
        await database.usersStore.save(updatedUsers);
        return;
    }

    const timestamp = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
    const superAdminUser: UserRecord = {
        id: createId('user'),
        fullName: superAdminFullName,
        role: 'super-admin',
        isActive: true,
        gender: superAdminGender === 'male' || superAdminGender === 'female' || superAdminGender === 'other' ? superAdminGender : 'other',
        dateOfBirth: superAdminDateOfBirth,
        nationalId: superAdminNationalId,
        address: superAdminAddress,
        phoneNumber: superAdminPhone,
        password: hashedPassword,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    await database.usersStore.save([...normalizedUsers, superAdminUser]);
};
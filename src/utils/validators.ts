export const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
};

export const validateGender = (gender: string): boolean => {
    const validGenders = ['Male', 'Female', 'Other'];
    return validGenders.includes(gender);
};

export const validateDateOfBirth = (dob: string): boolean => {
    const date = new Date(dob);
    const today = new Date();
    return date < today && date.getFullYear() > (today.getFullYear() - 18);
};

export const validateNationalID = (id: string): boolean => {
    const idRegex = /^[0-9]{9}$/; // Assuming a 9-digit national ID
    return idRegex.test(id);
};

export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[0-9]{10,15}$/; // Adjust based on expected phone number format
    return phoneRegex.test(phone);
};
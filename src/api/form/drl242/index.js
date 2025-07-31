const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

export const submitForm = async (formData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};

export const searchFormData = async ({ type, value, password }) => {
  try {
    const params = new URLSearchParams({
      action: 'filter',
      [type === 'studentId' ? 'studentId' : 'name']: value,
      password: password,
    });

    // Get filtered data
    const dataResponse = await fetch(`${API_URL}?${params}`);
    if (!dataResponse.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await dataResponse.json();

    if (data.error) throw new Error(data.error);

    return {
      ...data
    };
  } catch (error) {
    console.error('Error searching form data:', error);
    throw error;
  }
};

export const getFormStats = async () => {
  try {
    const response = await fetch(`${API_URL}?action=stats`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error fetching form stats:', error);
    throw error;
  }
};

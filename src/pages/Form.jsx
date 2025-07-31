import { useState } from 'react';
import DRLForm from '../components/forms/DRL242/DRLForm';

const FORM_TYPES = {
  DRL: {
    id: 'drl',
    title: 'Điểm Rèn Luyện 242',
    description: 'Form đánh giá điểm rèn luyện học kỳ HK242',
    component: DRLForm
  },
  // FEEDBACK: {
  //   id: 'feedback',
  //   title: 'Phản Hồi Môn Học',
  //   description: 'Form phản hồi về môn học và giảng viên',
  //   component: null // Thêm component mới khi cần
  // },
  // REGISTRATION: {
  //   id: 'registration',
  //   title: 'Đăng Ký Học Phần',
  //   description: 'Form đăng ký học phần mới',
  //   component: null // Thêm component mới khi cần
  // }
};

const Form = () => {
  const [selectedForm, setSelectedForm] = useState(null);

  const renderFormContent = () => {
    if (!selectedForm) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Object.values(FORM_TYPES).map((form) => (
            <div
              key={form.id}
              className={`bg-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 
                ${form.component ? 'cursor-pointer hover:shadow-xl' : 'opacity-75'}`}
              onClick={() => form.component && setSelectedForm(form)}
            >
              <h3 className="text-xl font-bold mb-2 text-blue-600">{form.title}</h3>
              <p className="text-gray-600">{form.description}</p>
              {!form.component && (
                <p className="text-sm text-orange-500 mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Coming soon...
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    const FormComponent = selectedForm.component;
    
    return (
      <div>
        <button
          onClick={() => setSelectedForm(null)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </button>
        <FormComponent />
      </div>
    );
  };

  return (
    <section className='max-container'>
      <h1 className='head-text'>
        <span className='blue-gradient_text font-semibold drop-shadow'>
          {selectedForm ? selectedForm.title : 'Các form hiện có'}
        </span>
      </h1>
      
      <div className='mt-5 flex flex-col gap-3 text-slate-500'>
        <p>
          {selectedForm 
            ? selectedForm.description
            : 'Chọn form cần điền dưới đây.'}
        </p>
      </div>

      {renderFormContent()}
    </section>
  );
};

export default Form;

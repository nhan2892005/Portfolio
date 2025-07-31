import { useEffect, useState } from 'react';
import { submitForm, searchFormData, getFormStats } from '../../../api/form/drl242';
import DRLResults from './DRLResults';
import DRLStats from './DRLStats';

const DRLForm = () => {
  const [activeTab, setActiveTab] = useState('search'); // 'form' or 'search'
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    studentId: '',
    email: '',
    score1: 0,
    score2: 0,
    score3: 0,
    evidence3: '',
    score4: 0,
    evidence4: '',
    score5: 0,
    evidence5: '',
    score6: 0,
    evidence6: '',
    notes: '',
    password: ''
  });
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchType, setSearchType] = useState('studentId');
  const [searchValue, setSearchValue] = useState('');
  const [formStats, setFormStats] = useState(null);
  const [showUpdateBlock, setShowUpdateBlock] = useState(false);
  const [updateStudentId, setUpdateStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const calculateTotalScore = () => {
    return Number(formData.score1) + Number(formData.score2) + Number(formData.score3) + 
           Number(formData.score4) + Number(formData.score5) + Number(formData.score6);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await submitForm({
        ...formData,
        totalScore: calculateTotalScore()
      });
      setSubmittedData(result);
      alert('Form submitted successfully!');
    } catch (err) {
      setError(err.message);
      alert('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!searchValue) {
        throw new Error('Hãy nhập giá trị tìm kiếm.');
      }

      if (!password) {
        throw new Error('Hãy nhập mật khẩu để tra cứu, nếu chưa có mật khẩu, bấm nút cập nhật mật khẩu. Nếu gặp khó khăn, hãy liên hệ với Phúc Nhân.');
      }

      const data = await searchFormData({
        type: searchType,
        value: searchValue,
        password: password
      });
      // handle case where no data is found
      if (!data || data.length === 0) {
        return alert('No data found for the given search criteria.');
      }
      setSubmittedData(data);
    } catch (err) {
      setError(err.message);
      alert('Error searching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!updateStudentId || !newPassword) {
      return alert('Please provide both Student ID and new password.');
    }

    if (newPassword.length < 8 || newPassword.length > 12) {
      return alert("Mật khẩu phải từ 8 đến 12 ký tự.");
    }

    try {
      const result = await submitForm({
        studentId: updateStudentId,
        password: newPassword
      });
      alert(result.result || "Cập nhật mật khẩu thành công!");
      setShowUpdateBlock(false);
      setUpdateStudentId('');
      setNewPassword('');
    } catch (err) {
      alert("Lỗi khi cập nhật mật khẩu.");
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getFormStats();
        setFormStats(stats);
      } catch (err) {
        console.error('Error fetching form stats:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className='w-full'>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Tab Navigation */}
          <div className="flex border-b mb-5">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'form'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('form')}
            >
              Điền Form
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'search'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('search');
                setSubmittedData(null);
              }}
            >
              Tra cứu
            </button>
          </div>

            {/* Search Section */}
            {activeTab === 'search' && (
              <div className='mt-5 bg-white p-5 rounded-lg shadow-md flex flex-col gap-5'>
                <div className='mt-5 flex gap-5 bg-white p-5 rounded-lg shadow-md'>
                <select 
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className='border p-2 rounded'
                >
                    <option value="studentId">Tìm theo MSSV</option>
                    <option value="name">Tìm theo họ tên</option>
                </select>
                <div className='flex flex-col gap-2'>
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchType === 'studentId' ? 'Nhập MSSV...' : 'Nhập họ tên...'}
                    className='flex-1 border p-2 rounded'
                    required
                />
                <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={'Nhập mật khẩu'}
                    className='flex-1 border p-2 rounded'
                    required
                    minLength={8}
                    maxLength={12}
                    pattern=".{8,12}"
                />
                </div>
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400'
                >
                    {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
                <div>
                  <button
                    onClick={() => setShowUpdateBlock(prev => !prev)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {showUpdateBlock ? 'Ẩn cập nhật mật khẩu' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
                </div>
                {showUpdateBlock && (
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded flex flex-col gap-3 max-w-md">
                    <input
                      type="text"
                      value={updateStudentId}
                      onChange={(e) => setUpdateStudentId(e.target.value)}
                      placeholder="Mã số sinh viên"
                      className='border p-2 rounded'
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mật khẩu mới (8–12 ký tự)"
                      className='border p-2 rounded'
                    />
                    <button
                      onClick={async () => await handleUpdatePassword()}
                      className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
                    >
                      Xác nhận cập nhật
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Form Section */}
            {activeTab === 'form' && (
                <form onSubmit={handleSubmit} className='mt-5 bg-white p-5 rounded-lg shadow-md'>
                <h2 className="text-xl font-bold mb-4">Điểm rèn luyện Form</h2>
                
                <div className='grid grid-cols-2 gap-5'>
                <div>
                    <label className='block mb-2'>Họ và tên lót</label>
                    <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className='w-full border p-2 rounded'
                    />
                </div>
                <div>
                    <label className='block mb-2'>Tên</label>
                    <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className='w-full border p-2 rounded'
                    />
                </div>
                </div>

                <div className='mt-5 grid grid-cols-2 gap-5'>
                <div>
                    <label className='block mb-2'>MSSV</label>
                    <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                    className='w-full border p-2 rounded'
                    />
                </div>
                <div>
                    <label className='block mb-2'>Email</label>
                    <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    pattern=".*@hcmut\.edu\.vn$"
                    className='w-full border p-2 rounded'
                    />
                </div>
                </div>

                {/* Scores Section */}
                <div className='mt-5 grid grid-cols-2 gap-5'>
                {[1, 2, 3, 4, 5, 6].map(num => (
                    <div key={num} className="p-4 border rounded-lg bg-gray-50">
                    <label className='block mb-2 font-medium'>Mục {num}:</label>
                    <input
                        type="number"
                        name={`score${num}`}
                        value={formData[`score${num}`]}
                        onChange={handleInputChange}
                        min="0"
                        className='w-full border p-2 rounded mb-2'
                    />
                    {num >= 3 && (
                        <div className='mt-2'>
                        <label className='block mb-2'>Minh chứng</label>
                        <input
                            type="text"
                            name={`evidence${num}`}
                            value={formData[`evidence${num}`]}
                            onChange={handleInputChange}
                            className='w-full border p-2 rounded'
                            placeholder="Link minh chứng..."
                        />
                        </div>
                    )}
                    </div>
                ))}
                </div>

                <div className='mt-5'>
                <label className='block mb-2'>Ghi chú</label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className='w-full border p-2 rounded'
                    rows="4"
                />
                </div>

                <div className='mt-5'>
                  <label className='block mb-2'>Mật khẩu (8–12 ký tự)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength={8}
                    maxLength={12}
                    placeholder="Đặt mật khẩu để chỉnh sửa sau"
                    className='w-full border p-2 rounded'
                    required
                  />
                </div>

                <div className='mt-5 flex justify-between items-center'>
                <div className='text-xl font-bold'>
                    Tổng điểm: {calculateTotalScore()}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className='bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400'
                >
                    {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
                </div>
            </form>
            )}

            {/* Results Section */}
            {submittedData && (
                <div className='mt-5'>
                <DRLResults data={submittedData} />
                {activeTab === 'search' && (
                    <div className="mt-5 flex justify-center">
                    <button
                        onClick={() => {
                        setActiveTab('form');
                        setFormData({
                            ...formData,
                            lastName: submittedData[0]["Họ và Tên - Họ và Tên lót (VD: Tên Nguyễn Văn A, nhập: Nguyễn Văn)"],
                            firstName: submittedData[0]["Họ và Tên - Tên (VD: Tên Nguyễn Văn A, nhập: A)"],
                            studentId: submittedData[0]["Mã số sinh viên"].toString(),
                            email: submittedData[0]["Email (@hcmut.edu.vn)"],
                            score1: submittedData[0]["1. Ý thức tham gia học tập"],
                            score2: submittedData[0]["2. Ý thức chấp hành nội quy, quy chế, quy định trong nhà trường"],
                            score3: submittedData[0]["3. Ý thức tham gia các hoạt động chính trị, xã hội, văn hoá, văn nghệ, thể thao, phòng chống tội phạm và các tệ nạn xã hội."],
                            evidence3: submittedData[0]["Minh chứng mục 3"],
                            score4: submittedData[0]["4. Ý thức công dân, quan hệ cộng đồng"],
                            evidence4: submittedData[0]["Minh chứng mục 4"],
                            score5: submittedData[0]["5. Ý thức và kết quả khi tham gia công tác cán bộ lớp, các đoàn thể, tổ chức trong trường"],
                            evidence5: submittedData[0]["Minh chứng mục 5"],
                            score6: submittedData[0]["6. Điểm thưởng đặc biệt"],
                            evidence6: submittedData[0]["Minh chứng mục 6"],
                            notes: submittedData[0]["Thắc mắc của sinh viên"] || ""
                        });
                        }}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                    >
                        Chỉnh sửa đánh giá này
                    </button>
                    </div>
                )}
                </div>
            )}

            {error && (
                <div className='mt-5 bg-red-100 text-red-700 p-4 rounded-lg'>
                {error}
                </div>
            )}
        </div>
        <div className="lg:col-span-1">
            <div className="sticky top-5">
                <DRLStats stats={formStats} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default DRLForm;
